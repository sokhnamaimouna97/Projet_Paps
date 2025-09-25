import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  ArrowLeft, 
  Truck, 
  Users, 
  Package, 
  TrendingUp, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  BarChart3,
  Calendar,
  DollarSign,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'suspended';
  isPremium: boolean;
  createdAt: string;
  totalOrders: number;
  totalRevenue: number;
}

interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  averageDeliveryTime: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  total: number;
  status: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  createdAt: string;
  deliveredAt?: string;
}

interface PapsBackofficeProps {
  onBack: () => void;
}

export default function PapsBackoffice({ onBack }: PapsBackofficeProps) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    averageDeliveryTime: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simulation des données - en production, ces données viendraient de l'API
      const mockMerchants: Merchant[] = [
        {
          id: 'merchant_1',
          name: 'Boutique Fatou',
          email: 'fatou@boutique.sn',
          phone: '+221 77 123 45 67',
          address: 'Plateau, Dakar',
          status: 'active',
          isPremium: true,
          createdAt: '2024-01-15',
          totalOrders: 156,
          totalRevenue: 2450000
        },
        {
          id: 'merchant_2',
          name: 'Epicerie Mamadou',
          email: 'mamadou@epicerie.sn',
          phone: '+221 70 234 56 78',
          address: 'Médina, Dakar',
          status: 'active',
          isPremium: false,
          createdAt: '2024-02-20',
          totalOrders: 89,
          totalRevenue: 1200000
        },
        {
          id: 'merchant_3',
          name: 'Fashion Aïssatou',
          email: 'aissatou@fashion.sn',
          phone: '+221 76 345 67 89',
          address: 'Almadies, Dakar',
          status: 'suspended',
          isPremium: false,
          createdAt: '2024-03-10',
          totalOrders: 34,
          totalRevenue: 680000
        }
      ];

      const mockOrders: Order[] = [
        {
          id: 'order_1',
          merchantId: 'merchant_1',
          merchantName: 'Boutique Fatou',
          customerName: 'Aminata Diallo',
          customerPhone: '+221 77 987 65 43',
          customerAddress: 'HLM, Dakar',
          total: 15000,
          status: 'delivered',
          deliveryPersonId: 'paps_delivery_1',
          deliveryPersonName: 'Moussa Seck',
          createdAt: '2024-12-10T10:30:00Z',
          deliveredAt: '2024-12-10T12:15:00Z'
        },
        {
          id: 'order_2',
          merchantId: 'merchant_2',
          merchantName: 'Epicerie Mamadou',
          customerName: 'Ousmane Ba',
          customerPhone: '+221 70 111 22 33',
          customerAddress: 'Liberté 6, Dakar',
          total: 8500,
          status: 'in_transit',
          deliveryPersonId: 'paps_delivery_2',
          deliveryPersonName: 'Fatima Kane',
          createdAt: '2024-12-12T14:20:00Z'
        }
      ];

      const mockStats: DeliveryStats = {
        totalDeliveries: 1247,
        completedDeliveries: 1183,
        pendingDeliveries: 64,
        averageDeliveryTime: 45, // minutes
        totalRevenue: 18750000 // CFA
      };

      setMerchants(mockMerchants);
      setOrders(mockOrders);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerchantStatusChange = async (merchantId: string, newStatus: string) => {
    try {
      // En production, faire un appel API pour mettre à jour le statut
      setMerchants(merchants.map(m => 
        m.id === merchantId ? { ...m, status: newStatus as 'active' | 'inactive' | 'suspended' } : m
      ));
      toast.success('Statut du commerçant mis à jour');
    } catch (error) {
      console.error('Error updating merchant status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Actif', variant: 'default' as const },
      inactive: { label: 'Inactif', variant: 'secondary' as const },
      suspended: { label: 'Suspendu', variant: 'destructive' as const },
      delivered: { label: 'Livré', variant: 'default' as const },
      in_transit: { label: 'En cours', variant: 'secondary' as const },
      pending: { label: 'En attente', variant: 'outline' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement du backoffice Paps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800/90 backdrop-blur border-b" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} className="mr-4 text-white hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center">
                <Truck className="w-8 h-8 text-white mr-3" />
                <h1 className="text-xl text-white">Backoffice Paps</h1>
              </div>
            </div>
            <div className="text-white text-sm">
              <p>Plateforme de gestion des livraisons</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-label="Contenu principal du backoffice Paps">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="merchants">
              <Users className="w-4 h-4 mr-2" />
              Commerçants
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-2" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analyses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <h2 className="text-2xl">Vue d'ensemble</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Livraisons</CardTitle>
                  <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-blue-600">{stats.totalDeliveries}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% ce mois
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Livraisons Complétées</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">{stats.completedDeliveries}</div>
                  <p className="text-xs text-muted-foreground">
                    Taux: {((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">En Attente</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-orange-600">{stats.pendingDeliveries}</div>
                  <p className="text-xs text-muted-foreground">
                    À traiter aujourd'hui
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Revenus Paps</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-purple-600">{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">
                    CFA ce mois
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader>
                  <CardTitle>Commerçants Actifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {merchants.filter(m => m.status === 'active').slice(0, 5).map((merchant) => (
                      <div key={merchant.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">{merchant.name}</p>
                          <p className="text-xs text-gray-500">{merchant.totalOrders} commandes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{(merchant.totalRevenue / 1000).toFixed(0)}K CFA</p>
                          {merchant.isPremium && <Badge className="text-xs">Premium</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader>
                  <CardTitle>Temps de Livraison Moyen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-blue-600 mb-2">{stats.averageDeliveryTime} min</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plateau</span>
                      <span>35 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Médina</span>
                      <span>42 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Almadies</span>
                      <span>58 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="merchants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl">Gestion des Commerçants</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un commerçant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                    <SelectItem value="suspended">Suspendus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredMerchants.map((merchant) => (
                <Card key={merchant.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg">{merchant.name}</h3>
                          {getStatusBadge(merchant.status)}
                          {merchant.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                              Premium
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid gap-2 md:grid-cols-2 text-sm text-gray-600">
                          <p className="flex items-center"><Mail className="w-4 h-4 mr-2" />{merchant.email}</p>
                          <p className="flex items-center"><Phone className="w-4 h-4 mr-2" />{merchant.phone}</p>
                          <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{merchant.address}</p>
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Membre depuis {new Date(merchant.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        <div className="flex gap-6 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500">Commandes:</span>
                            <span className="ml-1 font-medium">{merchant.totalOrders}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Revenus:</span>
                            <span className="ml-1 font-medium">{(merchant.totalRevenue / 1000).toFixed(0)}K CFA</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Select
                          value={merchant.status}
                          onValueChange={(value) => handleMerchantStatusChange(merchant.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                            <SelectItem value="suspended">Suspendu</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedMerchant(merchant)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails du commerçant</DialogTitle>
                              <DialogDescription>
                                Informations complètes sur {merchant.name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedMerchant && (
                              <div className="space-y-4">
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Nom:</Label>
                                    <span className="col-span-3">{selectedMerchant.name}</span>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Email:</Label>
                                    <span className="col-span-3">{selectedMerchant.email}</span>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Téléphone:</Label>
                                    <span className="col-span-3">{selectedMerchant.phone}</span>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Adresse:</Label>
                                    <span className="col-span-3">{selectedMerchant.address}</span>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Statut:</Label>
                                    <span className="col-span-3">{getStatusBadge(selectedMerchant.status)}</span>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Plan:</Label>
                                    <span className="col-span-3">
                                      {selectedMerchant.isPremium ? (
                                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">Premium</Badge>
                                      ) : (
                                        <Badge variant="secondary">Freemium</Badge>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl">Suivi des Commandes</h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg">Commande #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <h4 className="text-sm mb-2">Commerçant</h4>
                        <p className="text-sm text-gray-600">{order.merchantName}</p>
                      </div>

                      <div>
                        <h4 className="text-sm mb-2">Client</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{order.customerName}</p>
                          <p className="flex items-center"><Phone className="w-3 h-3 mr-1" />{order.customerPhone}</p>
                          <p className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{order.customerAddress}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm mb-2">Livraison</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Total: <span className="font-medium">{order.total.toFixed(2)} CFA</span></p>
                          {order.deliveryPersonName && (
                            <p>Livreur: {order.deliveryPersonName}</p>
                          )}
                          {order.deliveredAt && (
                            <p>Livré le: {new Date(order.deliveredAt).toLocaleDateString('fr-FR')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl">Analyses et Rapports</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader>
                  <CardTitle>Performance des Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Plateau</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-sm">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Médina</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                        </div>
                        <span className="text-sm">72%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Almadies</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}}></div>
                        </div>
                        <span className="text-sm">68%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader>
                  <CardTitle>Évolution Mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Janvier</span>
                      <span className="text-sm font-medium">1,234 livraisons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Février</span>
                      <span className="text-sm font-medium">1,456 livraisons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Mars</span>
                      <span className="text-sm font-medium">1,678 livraisons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avril</span>
                      <span className="text-sm font-medium">1,892 livraisons</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
              <CardHeader>
                <CardTitle>Indicateurs Clés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl text-blue-600 mb-1">94.8%</div>
                    <div className="text-sm text-gray-600">Taux de livraison</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl text-green-600 mb-1">4.7/5</div>
                    <div className="text-sm text-gray-600">Satisfaction client</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl text-orange-600 mb-1">45min</div>
                    <div className="text-sm text-gray-600">Temps moyen</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl text-purple-600 mb-1">156</div>
                    <div className="text-sm text-gray-600">Commerçants actifs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}