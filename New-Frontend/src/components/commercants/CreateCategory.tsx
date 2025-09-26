import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Folder } from 'lucide-react';
import { useApiClient } from '../../lib/useApiClient';
import { API_URL } from '../../lib/db';

const CreateCategory: React.FC = () => {
  const { createOrUpdate, loading, error, clearError, fetchData } = useApiClient();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({ nom: '' });
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- Liste des catégories ---
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchData({ url: `${API_URL}/getAllCategorie`, method: 'GET' });
      setCategories(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // --- Gestion formulaire ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ nom: e.target.value });
    if (validationError) setValidationError('');
    if (error) clearError();
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    if (!formData.nom.trim()) {
      setValidationError("Le nom de la catégorie est requis");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({ nom: '' });
    setValidationError('');
    setSuccessMessage('');
    clearError();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await createOrUpdate({
      url: `${API_URL}/createCategories`,
      data: formData,
      method: 'POST',
      options: {
        onSuccess: () => {
          setSuccessMessage('Catégorie créée avec succès !');
          resetForm();
          loadCategories(); // 🔥 recharge la liste

          setTimeout(() => {
            setIsOpen(false);
            setSuccessMessage('');
          }, 1500);
        },
        onError: (errorMsg) => {
          console.error("Erreur création catégorie:", errorMsg);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* --- Bouton + Modal --- */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une catégorie
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Folder className="w-5 h-5 mr-2" />
              Créer une nouvelle catégorie
            </DialogTitle>
            <DialogDescription>
              Entrez le nom de la catégorie.
            </DialogDescription>
          </DialogHeader>

          {/* Succès */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Nom de la catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className={validationError ? "border-red-500" : ""}
                placeholder="Ex: Informatique"
                disabled={loading}
              />
              {validationError && (
                <p className="text-red-500 text-sm mt-1">{validationError}</p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-6">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? "Création en cours..." : "Créer la catégorie"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCategory;
