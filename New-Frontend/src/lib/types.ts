// types.ts - Interfaces communes pour le dashboard

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { 
    productId: string; 
    productName: string; 
    quantity: number; 
    price: number 
  }[];
  total: number;
  status: string;
  createdAt: string;
  deliveryPersonId?: string;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

export interface StoreSettings {
  name: string;
  description: string;
  logo: string;
  headerImage: string;
}

export interface MerchantDashboardProps {
  merchantId: string;
  onBack: () => void;
  onSwitchToStore?: () => void;
}