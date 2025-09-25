import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Plus, Edit, Trash2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Product } from '../../lib/types';

interface ProductsTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  merchantId: string;
  isPremium: boolean;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ 
  products, 
  setProducts, 
  merchantId, 
  isPremium 
}) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: ''
  });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Limitation freemium : max 25 produits
    if (!isPremium && products.length >= 25) {
      toast.error('Version freemium limitée à 25 produits. Passez en Premium pour plus de produits.');
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        const result = await response.json();
        setProducts([...products, result.product]);
        setNewProduct({ name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '' });
        setIsAddingProduct(false);
        toast.success('Produit ajouté avec succès');
      } else {
        toast.error('Erreur lors de l\'ajout du produit');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erreur lors de l\'ajout du produit');
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(editingProduct)
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(products.map(p => p.id === editingProduct.id ? result.product : p));
        setEditingProduct(null);
        toast.success('Produit modifié avec succès');
      } else {
        toast.error('Erreur lors de la modification du produit');
      }
    } catch (error) {
      console.error('Error editing product:', error);
      toast.error('Erreur lors de la modification du produit');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Produit supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Gestion des produits</h2>
          {!isPremium && (
            <p className="text-sm text-gray-600 mt-1">
              Version freemium : {products.length}/25 produits
            </p>
          )}
        </div>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button disabled={!isPremium && products.length >= 25}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un produit
              {!isPremium && products.length >= 25 && (
                <Crown className="w-4 h-4 ml-2" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau produit</DialogTitle>
              <DialogDescription>
                Remplissez les informations du produit ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Prix (XOF)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Catégorie</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddProduct}>
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
            <CardContent className="p-4">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl">{product.price.toLocaleString('fr-FR')} XOF</span>
                <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                  Stock: {product.stock}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier le produit</DialogTitle>
                    </DialogHeader>
                    {editingProduct && (
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-name" className="text-right">Nom</Label>
                          <Input
                            id="edit-name"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-price" className="text-right">Prix (XOF)</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-stock" className="text-right">Stock</Label>
                          <Input
                            id="edit-stock"
                            type="number"
                            value={editingProduct.stock}
                            onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setEditingProduct(null)}>
                        Annuler
                      </Button>
                      <Button onClick={handleEditProduct}>
                        Sauvegarder
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer "{product.name}" ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;