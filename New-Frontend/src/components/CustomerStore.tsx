import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Filter, Search, MapPin, Phone, CreditCard, Truck, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Merchant {
  id: string;
  name: string;
  logo: string;
  description?: string;
  headerImage?: string;
}

interface CustomerStoreProps {
  merchantId: string;
  onBack: () => void;
  onMerchantAccess?: (merchantId: string) => void;
}

export default function CustomerStore({ merchantId, onBack, onMerchantAccess }: CustomerStoreProps) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
 const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/'); // ou navigate(-1) pour revenir à la page précédente
  };
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadStoreData();
    // Charger le panier depuis localStorage
    const savedCart = localStorage.getItem(`cart_${merchantId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [merchantId]);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem(`cart_${merchantId}`, JSON.stringify(cart));
  }, [cart, merchantId]);

  const loadStoreData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/store/${merchantId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMerchant(data.merchant);
        
        // Ajouter des produits de démonstration avec des images
        const demoProducts = [
          {
            id: 'demo_1',
            name: 'Panier de Légumes Bio',
            description: 'Assortiment de légumes frais de saison, cultivés localement sans pesticides.',
            price: 8250,
            category: 'Légumes',
            stock: 15,
            imageUrl: 'https://images.unsplash.com/photo-1605447813584-26aeb3f8e6ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0cyUyMHZlZ2V0YWJsZXMlMjBncm9jZXJ5fGVufDF8fHx8MTc1NzY4OTAxMHww&ixlib=rb-4.1.0&q=80&w=400'
          },
          {
            id: 'demo_2',
            name: 'Pain Artisanal',
            description: 'Pain traditionnel cuit au four à bois, croûte dorée et mie moelleuse.',
            price: 2500,
            category: 'Boulangerie',
            stock: 8,
            imageUrl: 'https://images.unsplash.com/photo-1679673987713-54f809ce417d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyZWFkJTIwYmFrZXJ5fGVufDF8fHx8MTc1NzY4Nzc5N3ww&ixlib=rb-4.1.0&q=80&w=400'
          },
          {
            id: 'demo_3',
            name: 'Tomates Bio du Jardin',
            description: 'Tomates cultivées sans produits chimiques, récoltées à maturité parfaite.',
            price: 2750,
            category: 'Légumes',
            stock: 12,
            imageUrl: 'https://images.unsplash.com/photo-1667885098658-f34fed001418?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdmVnZXRhYmxlcyUyMG1hcmtldHxlbnwxfHx8fDE3NTc2MjYzMzN8MA&ixlib=rb-4.1.0&q=80&w=400'
          }
        ];

        setProducts([...demoProducts, ...(data.products || [])]);
      } else {
        toast.error('Erreur lors du chargement de la boutique');
      }
    } catch (error) {
      console.error('Error loading store:', error);
      toast.error('Erreur lors du chargement de la boutique');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        toast.success(`${product.name} ajouté au panier`);
      } else {
        toast.error('Stock insuffisant');
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
      toast.success(`${product.name} ajouté au panier`);
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (product && newQuantity <= product.stock) {
        setCart(cart.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        toast.error('Stock insuffisant');
      }
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast.success('Produit retiré du panier');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error('Veuillez remplir toutes les informations de livraison');
      return;
    }

    if (cart.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    try {
      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: getTotalPrice()
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/store/${merchantId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        setOrderId(result.order.id);
        setIsOrderPlaced(true);
        setCart([]);
        setIsCheckoutOpen(false);
        toast.success('Commande passée avec succès !');
      } else {
        toast.error('Erreur lors de la commande');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Erreur lors de la commande');
    }
  };

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Obtenir les catégories uniques
  const categories = Array.from(new Set(products.map(product => product.category)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F6FAFA] via-white to-white dark:from-[#0B1A1A] dark:via-[#0E131A] dark:to-[#0E131A]">
      {/* Header de la boutique */}
      <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur border-b dark:border-gray-700 sticky top-0 z-20" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center">
                {merchant?.logo && (
                  <img src={merchant.logo} alt={merchant.name} className="w-8 h-8 mr-3 rounded" />
                )}
                <h1 className="text-xl text-gray-900 dark:text-white">{merchant?.name || 'Commerce Local'}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {onMerchantAccess && (
                <Button variant="ghost" onClick={() => onMerchantAccess(merchantId)} className="text-[#2C3E50] hover:bg-[#E8F6F5]">
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              )}
              
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative border-[#5CBCB6] text-[#5CBCB6] hover:bg-[#E8F6F5]">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Panier
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-[#5CBCB6] text-white">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="backdrop-blur bg-white/80 dark:bg-gray-900/70">
                <SheetHeader>
                  <SheetTitle>Votre panier</SheetTitle>
                  <SheetDescription>
                    {getTotalItems()} article{getTotalItems() > 1 ? 's' : ''} • {getTotalPrice().toLocaleString('fr-FR')} XOF
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Votre panier est vide</p>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">{item.product.price.toLocaleString('fr-FR')} XOF</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg">Total</span>
                          <span className="text-xl">{getTotalPrice().toLocaleString('fr-FR')} XOF</span>
                        </div>
                        <Button 
                          onClick={() => {
                            setIsCartOpen(false);
                            setIsCheckoutOpen(true);
                          }}
                          className="w-full"
                          size="lg"
                        >
                          Passer commande
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Bannière d'en-tête avec image personnalisable */}
      <div className="relative h-64 bg-gradient-to-r from-[#5CBCB6] to-[#2C3E50] overflow-hidden rounded-b-2xl" aria-label="Bannière de la boutique">
        {merchant?.headerImage && (
          <img 
            src={merchant.headerImage} 
            alt="Bannière de la boutique"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#5CBCB6]/80 to-[#2C3E50]/80"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-white">
            <h2 className="text-4xl mb-3">Bienvenue chez {merchant?.name || 'notre commerce'}</h2>
            <p className="text-[#E8F6F5] text-lg">
              Découvrez nos produits locaux et passez commande en quelques clics
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex items-center bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm">
                <div className="w-2 h-2 bg-[#28A745] rounded-full mr-2"></div>
                Livraison assurée par Paps
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-label="Catalogue et actions de la boutique">
        {/* Barre de recherche et filtres */}
        <div className="mb-8 space-y-4 sticky top-16 z-10">
          <div className="flex flex-col sm:flex-row gap-4 bg-white/80 dark:bg-gray-800/70 backdrop-blur p-3 rounded-xl border dark:border-gray-700">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille de produits */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-2xl hover:shadow-black/5 transition-all bg-white/90 dark:bg-gray-800/70 backdrop-blur rounded-2xl border border-transparent hover:border-[#5CBCB6]/20">
              <CardContent className="p-0 rounded-2xl overflow-hidden">
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.stock < 5 && product.stock > 0 && (
                    <Badge className="absolute top-2 left-2 bg-orange-500">
                      Stock limité
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      Épuisé
                    </Badge>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg mb-2 font-semibold tracking-tight">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl text-[#2C3E50] dark:text-white">{product.price.toLocaleString('fr-FR')} XOF</span>
                    <Badge variant="secondary">
                      {product.category}
                    </Badge>
                  </div>

                  <Button 
                    onClick={() => addToCart(product)}
                    className="w-full shadow-md group-hover:shadow-lg transition-shadow"
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-300 text-lg">Aucun produit trouvé</p>
            <p className="text-gray-400 dark:text-gray-400">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Dialog de commande */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md backdrop-blur dark:bg-gray-900/80">
          <DialogHeader>
            <DialogTitle>Finaliser votre commande</DialogTitle>
            <DialogDescription>
              Renseignez vos informations de livraison
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Nom complet *</Label>
              <Input
                id="customer-name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                placeholder="Votre nom et prénom"
              />
            </div>
            
            <div>
              <Label htmlFor="customer-phone">Téléphone *</Label>
              <Input
                id="customer-phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                placeholder="06 12 34 56 78"
              />
            </div>
            
            <div>
              <Label htmlFor="customer-address">Adresse de livraison *</Label>
              <Textarea
                id="customer-address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                placeholder="Adresse complète avec code postal et ville"
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm mb-2">Récapitulatif</h4>
              <div className="space-y-1 text-sm">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>{(item.product.price * item.quantity).toLocaleString('fr-FR')} XOF</span>
                  </div>
                ))}
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{getTotalPrice().toLocaleString('fr-FR')} XOF</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="flex-1">
                Retour
              </Button>
              <Button onClick={handlePlaceOrder} className="flex-1">
                <CreditCard className="w-4 h-4 mr-2" />
                Commander
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de commande */}
      <Dialog open={isOrderPlaced} onOpenChange={setIsOrderPlaced}>
        <DialogContent className="max-w-md backdrop-blur bg-white/90 dark:bg-gray-900/80">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              Commande confirmée !
            </DialogTitle>
            <DialogDescription className="text-center">
              Votre commande a été transmise au commerçant
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Numéro de commande</p>
              <p className="font-mono text-lg">#{orderId.slice(-8)}</p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Votre commande va être préparée</p>
              <p>• Un livreur sera assigné prochainement</p>
              <p>• Vous serez contacté avant la livraison</p>
            </div>

            <Button onClick={() => setIsOrderPlaced(false)} className="w-full">
              Continuer vos achats
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}