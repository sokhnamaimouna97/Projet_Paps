import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Import des composants
import DashboardHeader from '../components/commercants/DashboardHeader';
import DashboardStats from '../components/commercants/DashboardStats';
import ProductsTab from '../components/commercants/ProductsTab';
import OrdersTab from '../components/commercants/OrdersTab';
import DeliveryTab from '../components/commercants/DeliveryTab';

// Import des types
import { Product, Order, DeliveryPerson, StoreSettings, MerchantDashboardProps } from '../lib/types';

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ 
  merchantId, 
  onBack, 
  onSwitchToStore 
}) => {
  // États principaux
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: 'Ma Boutique',
    description: 'Commerce local de produits frais',
    logo: '',
    headerImage: ''
  });

  // Chargement des données
  useEffect(() => {
    loadData();
  }, [merchantId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, ordersRes, deliveryRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/products`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/orders`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/delivery-people`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const deliveryData = await deliveryRes.json();

      setProducts(productsData.products || []);
      setOrders(ordersData.orders || []);
      
      // Ajouter Paps comme livreur par défaut s'il n'existe pas déjà
      const deliveryPeopleList = deliveryData.deliveryPeople || [];
      const papsExists = deliveryPeopleList.some(dp => dp.id === 'paps_default');
      
      if (!papsExists) {
        deliveryPeopleList.unshift({
          id: 'paps_default',
          name: 'Paps (Service de livraison)',
          phone: '+221 33 XXX XX XX',
          email: 'support@paps.sn',
          status: 'online'
        });
      }
      
      setDeliveryPeople(deliveryPeopleList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <DashboardHeader
        onBack={onBack}
        onSwitchToStore={onSwitchToStore}
        isPremium={isPremium}
        setIsPremium={setIsPremium}
        merchantId={merchantId}
        storeSettings={storeSettings}
        setStoreSettings={setStoreSettings}
        isShareDialogOpen={isShareDialogOpen}
        setIsShareDialogOpen={setIsShareDialogOpen}
      />

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-label="Contenu principal du dashboard commerçant">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="delivery">Livreurs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats products={products} orders={orders} />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductsTab 
              products={products}
              setProducts={setProducts}
              merchantId={merchantId}
              isPremium={isPremium}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersTab 
              orders={orders}
              setOrders={setOrders}
              deliveryPeople={deliveryPeople}
              merchantId={merchantId}
            />
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            <DeliveryTab 
              deliveryPeople={deliveryPeople}
              setDeliveryPeople={setDeliveryPeople}
              merchantId={merchantId}
              isPremium={isPremium}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MerchantDashboard;