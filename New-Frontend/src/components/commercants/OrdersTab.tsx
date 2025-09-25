import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Phone, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number;
  status: string;
  createdAt: string;
  deliveryPersonId?: string;
}

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

interface OrdersTabProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  deliveryPeople: DeliveryPerson[];
  merchantId: string;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ 
  orders, 
  setOrders, 
  deliveryPeople, 
  merchantId 
}) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      assigned: { label: 'Assignée', variant: 'default' as const },
      accepted: { label: 'Acceptée', variant: 'default' as const },
      in_progress: { label: 'En cours', variant: 'default' as const },
      delivered: { label: 'Livrée', variant: 'default' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleAssignOrder = async (orderId: string, deliveryPersonId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/orders/${orderId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ deliveryPersonId })
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(orders.map(o => o.id === orderId ? result.order : o));
        toast.success('Commande assignée avec succès');
      } else {
        toast.error('Erreur lors de l\'assignation de la commande');
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Erreur lors de l\'assignation de la commande');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Gestion des commandes</h2>
      
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

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm mb-2">Informations client</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center"><Users className="w-4 h-4 mr-2" />{order.customerName}</p>
                    <p className="flex items-center"><Phone className="w-4 h-4 mr-2" />{order.customerPhone}</p>
                    <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{order.customerAddress}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm mb-2">Articles commandés</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.productName} - {(item.price * item.quantity).toLocaleString('fr-FR')} XOF
                      </p>
                    ))}
                    <p className="font-semibold text-sm">Total: {order.total.toLocaleString('fr-FR')} XOF</p>
                  </div>
                </div>
              </div>

              {order.status === 'pending' && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm mb-2">Assigner à un livreur</h4>
                  <div className="flex gap-2 flex-wrap">
                    {deliveryPeople.filter(dp => dp.status === 'online').map((deliveryPerson) => (
                      <Button
                        key={deliveryPerson.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignOrder(order.id, deliveryPerson.id)}
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        {deliveryPerson.name}
                      </Button>
                    ))}
                    {deliveryPeople.filter(dp => dp.status === 'online').length === 0 && (
                      <p className="text-sm text-gray-500">Aucun livreur disponible</p>
                    )}
                  </div>
                </div>
              )}

              {order.deliveryPersonId && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Assignée à: {deliveryPeople.find(dp => dp.id === order.deliveryPersonId)?.name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersTab;