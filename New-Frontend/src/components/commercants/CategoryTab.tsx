import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Folder } from 'lucide-react';
import CreateCategory from './CreateCategory';
import { toast } from 'sonner';
import { useApiClient } from '../../lib/useApiClient';
import { API_URL } from '../../lib/db';

interface CategoryPerson {
  id: string;
  nom: string;
}

interface CategoryTabProps {
  merchantId: string;
  isPremium: boolean;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ merchantId, isPremium }) => {
  const { fetchJSON, loading } = useApiClient();
  const [categories, setCategories] = useState<CategoryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les catégories au montage
  useEffect(() => {
    loadCategories();
  }, [merchantId]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      await fetchJSON(`${API_URL}/getcategoriesByCommercant`, {
        onSuccess: (data) => {
          console.log('Catégories chargées:', data);

          const categoriesList = data.categories || data || [];
          setCategories(categoriesList);
        },
        onError: (error) => {
          console.error('Erreur lors du chargement des catégories:', error);
          toast.error('Erreur lors du chargement des catégories');
          setCategories([]);
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setIsLoading(false);
    }
  };

  // Recharger après création
  const handleCategoryCreated = (data: any) => {
    if (data && data.category) {
      setCategories(prev => [
        ...prev,
        {
          id: data.category._id || data.category.id,
          nom: data.category.nom
        }
      ]);
    }
    toast.success('Catégorie créée avec succès !');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl">Gestion des catégories</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span>Chargement des catégories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Gestion des catégories</h2>
          {!isPremium && (
            <p className="text-sm text-gray-600 mt-1">
              Version freemium : nombre limité de catégories
            </p>
          )}
          <p className="text-sm text-blue-600 mt-1">
            {categories.length} catégorie(s) disponible(s)
          </p>
        </div>

        <CreateCategory
          onSuccess={handleCategoryCreated}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Folder className="w-4 h-4 mr-2 text-blue-600" />
                  <h3 className="text-lg font-medium">{category.nom}</h3>
                </div>
                <Badge variant="secondary">Catégorie</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Aucune catégorie trouvée</p>
          <p className="text-sm text-gray-400">
            Créez votre première catégorie pour commencer
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryTab;
