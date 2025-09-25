import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { ArrowLeft, Phone, MapPin, CheckCircle, Clock, Truck, Navigation, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Order {
  id: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number;
  status: string;
  createdAt: string;
  assignedAt?: string;
  acceptedAt?: string;
}

interface DeliveryDashboardProps {
  deliveryId: string;
  onBack: () => void;
}

export default function DeliveryDashboard({ deliveryId, onBack }: DeliveryDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<Record<string, number>>({});

  useEffect(() => {
    loadOrders();
    loadDeliveryStatus();
  }, [deliveryId]);
  // Init Supabase client + Realtime subscription
  useEffect(() => {
    const url = `https://${projectId}.supabase.co`;
    const client = createClient(url, publicAnonKey);
    supabaseRef.current = client;
    const channel = client.channel(`delivery:${deliveryId}`);
    channel.on('broadcast', { event: 'orders_update' }, (payload) => {
      // recharger les commandes sur broadcast
      void loadOrders();
    }).subscribe((status) => {
      // no-op
    });
    return () => {
      try { client.removeChannel(channel); } catch {}
    };
  }, [deliveryId]);


  // Rafraîchissement automatique (toutes les 30s quand en ligne)
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [isOnline, deliveryId]);

  const loadOrders = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/delivery/${deliveryId}/orders`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (response.ok) {
        const data = await response.json();
        const incoming: Order[] = data.orders || [];
        // Notifications pour nouvelles commandes "assigned"
        try {
          const prevIds = prevOrderIdsRef.current;
          const newAssigned = incoming.filter(o => o.status === 'assigned' && !prevIds.has(o.id));
          if (newAssigned.length > 0) {
            maybeNotify(`${newAssigned.length} nouvelle(s) commande(s)`, {
              body: `Nouvelles commandes en attente d'acceptation`,
            });
          }
          prevOrderIdsRef.current = new Set(incoming.map(o => o.id));
        } catch {}
        setOrders(incoming);
        setLastUpdatedAt(Date.now());
        // Estimation ETA simple: 10 min de base + 2 min par article
        try {
          const nextEta: Record<string, number> = {};
          for (const o of incoming) {
            const itemsCount = o.items?.reduce((a, b) => a + (b.quantity || 1), 0) || 0;
            nextEta[o.id] = 10 + Math.min(30, itemsCount * 2);
          }
          setEtaMinutes(nextEta);
        } catch {}
      } else {
        toast.error('Erreur lors du chargement des commandes');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeliveryStatus = async () => {
    // Pour cette démo, nous utilisons un état local
    // Dans une vraie application, vous chargeriez le statut depuis le serveur
    setIsOnline(true);
    // Demander la permission de notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try { await Notification.requestPermission(); } catch {}
      }
    }
    // Démarrer le traitement de la file si en ligne
    if (navigator.onLine) {
      void processActionQueue();
    }
  };

  const handleStatusChange = async (online: boolean) => {
    setIsOnline(online);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/delivery/${deliveryId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ status: online ? 'online' : 'offline' })
      });

      if (response.ok) {
        toast.success(online ? 'Vous êtes maintenant en ligne' : 'Vous êtes maintenant hors ligne');
      } else {
        toast.error('Erreur lors de la mise à jour du statut');
        setIsOnline(!online); // Revert on error
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
      setIsOnline(!online); // Revert on error
    }
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Notifications helper
  const maybeNotify = (title: string, options?: NotificationOptions) => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try { new Notification(title, options); } catch {}
    }
  };

  // File d'actions hors-ligne
  type QueuedAction = { type: 'accept' | 'status'; payload: any };
  const queueKey = `delivery_queue_${deliveryId}`;
  const enqueueAction = (action: QueuedAction) => {
    try {
      const raw = localStorage.getItem(queueKey);
      const list: QueuedAction[] = raw ? JSON.parse(raw) : [];
      list.push(action);
      localStorage.setItem(queueKey, JSON.stringify(list));
      toast.message('Action enregistrée hors-ligne. Elle sera synchronisée.');
    } catch {}
  };
  const readQueue = (): QueuedAction[] => {
    try {
      const raw = localStorage.getItem(queueKey);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };
  const writeQueue = (list: QueuedAction[]) => {
    try { localStorage.setItem(queueKey, JSON.stringify(list)); } catch {}
  };
  const processActionQueue = async () => {
    if (isProcessingQueue) return;
    setIsProcessingQueue(true);
    try {
      let list = readQueue();
      if (list.length === 0) return;
      for (const action of list) {
        if (action.type === 'accept') {
          await performAccept(action.payload.orderId, false);
        } else if (action.type === 'status') {
          await performUpdateStatus(action.payload.orderId, action.payload.status, false);
        }
      }
      writeQueue([]);
      toast.success('Actions hors-ligne synchronisées');
      await loadOrders();
    } catch {
      // on laissera en queue
    } finally {
      setIsProcessingQueue(false);
    }
  };
  useEffect(() => {
    const onOnline = () => { void processActionQueue(); };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const performAccept = async (orderId: string, showToast = true) => {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/delivery/${deliveryId}/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      if (response.ok) {
        const result = await response.json();
      setOrders(prev => prev.map(o => o.id === orderId ? result.order : o));
      if (showToast) toast.success('Commande acceptée');
      } else {
      if (showToast) toast.error('Erreur lors de l\'acceptation de la commande');
      throw new Error('accept failed');
    }
  };
  const handleAcceptOrder = async (orderId: string) => {
    if (!navigator.onLine) {
      enqueueAction({ type: 'accept', payload: { orderId } });
      return;
    }
    try {
      await performAccept(orderId);
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Erreur lors de l\'acceptation de la commande');
    }
  };

  const performUpdateStatus = async (orderId: string, status: string, showToast = true) => {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/delivery/${deliveryId}/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const result = await response.json();
      setOrders(prev => prev.map(o => o.id === orderId ? result.order : o));
      if (showToast) {
        const statusMessages = {
          'en_route_pickup': 'En route vers le point de vente',
          'picked_up': 'Commande récupérée',
          'en_route_delivery': 'En route vers le client',
          'delivered': 'Commande livrée'
        };
        toast.success(statusMessages[status as keyof typeof statusMessages] || 'Statut mis à jour');
      }
    } else {
      if (showToast) toast.error('Erreur lors de la mise à jour du statut');
      throw new Error('status failed');
    }
  };
  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!navigator.onLine) {
      enqueueAction({ type: 'status', payload: { orderId, status } });
      return;
    }
    try {
      await performUpdateStatus(orderId, status);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      assigned: { label: 'Assignée', variant: 'secondary' as const },
      accepted: { label: 'Acceptée', variant: 'default' as const },
      en_route_pickup: { label: 'En route (récup.)', variant: 'default' as const },
      picked_up: { label: 'Récupérée', variant: 'default' as const },
      en_route_delivery: { label: 'En livraison', variant: 'default' as const },
      delivered: { label: 'Livrée', variant: 'default' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getNextStatusActions = (currentStatus: string) => {
    const statusFlow = {
      accepted: [
        { status: 'en_route_pickup', label: 'En route vers le commerce', icon: Truck }
      ],
      en_route_pickup: [
        { status: 'picked_up', label: 'Commande récupérée', icon: CheckCircle }
      ],
      picked_up: [
        { status: 'en_route_delivery', label: 'En route vers le client', icon: Navigation }
      ],
      en_route_delivery: [
        { status: 'delivered', label: 'Marquer comme livrée', icon: CheckCircle }
      ]
    };

    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const matchesSearch = (order: Order, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerAddress.toLowerCase().includes(q) ||
      order.customerPhone.toLowerCase().includes(q)
    );
  };

  const orderTime = (order: Order) => {
    // Choisit le meilleur timestamp disponible pour le tri
    const candidates = [order.acceptedAt, order.assignedAt, order.createdAt].filter(Boolean) as string[];
    return candidates.length > 0 ? new Date(candidates[0]).getTime() : 0;
  };

  const filtered = orders
    .filter(o => (statusFilter === 'all' ? true : o.status === statusFilter))
    .filter(o => matchesSearch(o, searchQuery));

  const pendingOrders = filtered
    .filter(order => order.status === 'assigned')
    .sort((a, b) => orderTime(b) - orderTime(a));
  const activeOrders = filtered
    .filter(order => ['accepted', 'en_route_pickup', 'picked_up', 'en_route_delivery'].includes(order.status))
    .sort((a, b) => orderTime(b) - orderTime(a));
  const completedOrders = filtered
    .filter(order => order.status === 'delivered')
    .sort((a, b) => orderTime(b) - orderTime(a));

  const openMaps = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };
  const openWaze = (address: string) => {
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
    window.open(url, '_blank');
  };
  const openAppleMaps = (address: string) => {
    const url = `http://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };
  const openMultiStopRoute = (addresses: string[]) => {
    if (addresses.length === 0) return;
    const [dest, ...waypoints] = addresses;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}${waypoints.length ? `&waypoints=${encodeURIComponent(waypoints.join('|'))}` : ''}`;
    window.open(url, '_blank');
  };

  // Preuve de livraison: PIN + photo (UI minimale inline)
  const [proofForOrder, setProofForOrder] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const submitProof = async (orderId: string) => {
    if (!pinInput || !photoDataUrl) {
      toast.error('Veuillez saisir le code PIN et la photo.');
      return;
    }
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/delivery/${deliveryId}/orders/${orderId}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ pin: pinInput, photo: photoDataUrl })
      });
      if (response.ok) {
        toast.success('Preuve de livraison enregistrée');
        setProofForOrder(null);
        setPinInput('');
        setPhotoDataUrl(null);
        await handleUpdateStatus(orderId, 'delivered');
      } else {
        toast.error('Erreur lors de l\'envoi de la preuve');
      }
    } catch (e) {
      toast.error('Erreur lors de l\'envoi de la preuve');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header optimisé mobile */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} size="sm" className="mr-3">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg">Espace Livreur</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
              <Switch
                checked={isOnline}
                onCheckedChange={handleStatusChange}
              />
            </div>
          </div>
          {/* Barre d’outils: recherche, filtre, actions */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div className="sm:col-span-3">
              <div className="relative">
                <Input
                  placeholder="Rechercher (client, adresse, tél., #id)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="assigned">Assignée</SelectItem>
                  <SelectItem value="accepted">Acceptée</SelectItem>
                  <SelectItem value="en_route_pickup">En route (récup.)</SelectItem>
                  <SelectItem value="picked_up">Récupérée</SelectItem>
                  <SelectItem value="en_route_delivery">En livraison</SelectItem>
                  <SelectItem value="delivered">Livrée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-stretch gap-2 sm:justify-end sm:col-span-1">
              <Button onClick={handleManualRefresh} variant="outline" className="w-full sm:w-auto">
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Rafraîchir
              </Button>
            </div>
          </div>
          {lastUpdatedAt && (
            <p className="mt-2 text-xs text-gray-500">Dernière mise à jour: {new Date(lastUpdatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl">{pendingOrders.length}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-blue-600">{activeOrders.length}</div>
              <div className="text-sm text-gray-600">En cours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-green-600">{completedOrders.length}</div>
              <div className="text-sm text-gray-600">Livrées</div>
            </CardContent>
          </Card>
        </div>

        {/* Commandes en attente d'acceptation */}
        {pendingOrders.length > 0 && (
          <div>
            <h2 className="text-xl mb-4 text-gray-900">Nouvelles commandes</h2>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <Card key={order.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg">Commande #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          Assignée {order.assignedAt && new Date(order.assignedAt).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <h4 className="text-sm mb-1">Client</h4>
                        <p className="text-sm text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {order.customerName} - {order.customerAddress}
                        </p>
                        {etaMinutes[order.id] !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">ETA estimée: {etaMinutes[order.id]} min</p>
                        )}
                        <p className="text-sm text-gray-700 flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-2" />
                          {order.customerPhone}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={() => openMaps(order.customerAddress)}>
                            <Navigation className="w-4 h-4 mr-2" />
                            Itinéraire
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`tel:${order.customerPhone}`)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Appeler
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm mb-1">Articles ({order.items.length})</h4>
                        <div className="text-sm text-gray-600">
                          {order.items.map((item, index) => (
                            <p key={index}>{item.quantity}x {item.productName}</p>
                          ))}
                        </div>
                      </div>

                      <div className="text-lg">
                        Total: {order.total.toFixed(2)} €
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full"
                      size="lg"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accepter cette commande
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Commandes actives */}
        {activeOrders.length > 0 && (
          <div>
            <h2 className="text-xl mb-4 text-gray-900">Commandes en cours</h2>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <Card key={order.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg">Commande #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          Acceptée {order.acceptedAt && new Date(order.acceptedAt).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <h4 className="text-sm mb-1">Livraison</h4>
                        <p className="text-sm text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {order.customerName} - {order.customerAddress}
                        </p>
                        {etaMinutes[order.id] !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">ETA estimée: {etaMinutes[order.id]} min</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(`tel:${order.customerPhone}`)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Appeler le client
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 ml-2"
                          onClick={() => openMaps(order.customerAddress)}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Itinéraire
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 ml-2"
                          onClick={() => openWaze(order.customerAddress)}
                        >
                          Waze
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 ml-2"
                          onClick={() => openAppleMaps(order.customerAddress)}
                        >
                          Apple Plans
                        </Button>
                      </div>

                      <div className="text-lg">
                        Total: {order.total.toFixed(2)} €
                      </div>
                    </div>

                    {/* Actions pour mettre à jour le statut */}
                    <div className="space-y-2">
                      {getNextStatusActions(order.status).map((action) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={action.status}
                            onClick={() => handleUpdateStatus(order.id, action.status)}
                            className="w-full"
                            variant={action.status === 'delivered' ? 'default' : 'outline'}
                            size="lg"
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {action.label}
                          </Button>
                        );
                      })}
                      {/* Preuve de livraison lorsque en_route_delivery -> delivered */}
                      {order.status === 'en_route_delivery' && (
                        <div className="border rounded-lg p-3 bg-white">
                          <p className="text-sm text-gray-700 mb-2">Preuve de livraison</p>
                          <input
                            type="text"
                            placeholder="Code PIN du client"
                            value={proofForOrder === order.id ? pinInput : ''}
                            onChange={(e) => { setProofForOrder(order.id); setPinInput(e.target.value); }}
                            className="w-full border rounded px-2 py-1 text-sm mb-2"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => setPhotoDataUrl(String(reader.result));
                                reader.readAsDataURL(file);
                                setProofForOrder(order.id);
                              }}
                              className="text-xs"
                            />
                            {photoDataUrl && proofForOrder === order.id && (
                              <span className="text-xs text-green-600">Photo ajoutée</span>
                            )}
                          </div>
                          <Button
                            onClick={() => submitProof(order.id)}
                            className="w-full mt-2"
                          >
                            Valider la preuve et livrer
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucune commande */}
        {orders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2 text-gray-900">Aucune commande pour le moment</h3>
              <p className="text-gray-600 mb-4">
                {isOnline 
                  ? "Vous êtes en ligne. Les nouvelles commandes apparaîtront ici." 
                  : "Activez votre statut en ligne pour recevoir des commandes."
                }
              </p>
              {!isOnline && (
                <Button onClick={() => handleStatusChange(true)}>
                  Se mettre en ligne
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Commandes récemment livrées */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-xl mb-4 text-gray-900">Récemment livrées</h2>
            <div className="space-y-3">
              {completedOrders.slice(0, 3).map((order) => (
                <Card key={order.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm">#{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg">{order.total.toFixed(2)} €</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}