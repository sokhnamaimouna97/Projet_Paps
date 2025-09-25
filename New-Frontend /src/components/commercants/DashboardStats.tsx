import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { Product, Order } from '../../lib/types';

interface DashboardStatsProps {
  products: Product[];
  orders: Order[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ products, orders }) => {
  // Calcul des statistiques
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const lowStockProducts = products.filter(product => product.stock < 5).length;

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

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ventes totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalSales.toLocaleString('fr-FR')} XOF</div>
            <p className="text-xs text-muted-foreground">
              Toutes les commandes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Commandes aujourd'hui</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              Nouvelles commandes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Produits en stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Produits actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Stock faible</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-500">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produits &lt; 5 unités
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cartes de détails */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.total.toLocaleString('fr-FR')} XOF</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produits en stock faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.filter(p => p.stock < 5).slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{product.name}</p>
                    <p className="text-xs text-red-500">Stock: {product.stock}</p>
                  </div>
                  <Badge variant="destructive">Faible</Badge>
                </div>
              ))}
              {products.filter(p => p.stock < 5).length === 0 && (
                <p className="text-sm text-gray-500">Tous les produits ont un stock suffisant</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;