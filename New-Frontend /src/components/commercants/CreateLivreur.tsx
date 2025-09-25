import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Eye, EyeOff, User, Mail, Phone, Building, Crown } from 'lucide-react';
import { useApiClient } from '../../lib/useApiClient';
import { API_URL } from '../../lib/db';

interface CreateLivreurProps {
  commercantId: string;
  onSuccess?: (data: any) => void;
  disabled?: boolean;
  maxReached?: boolean;
}

const CreateLivreur: React.FC<CreateLivreurProps> = ({ 
  commercantId, 
  onSuccess, 
  disabled = false, 
  maxReached = false 
}) => {
  const { createOrUpdate, loading, error, clearError } = useApiClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    commercant_id: commercantId
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.prenom.trim()) {
      errors.prenom = 'Le prénom est requis';
    }

    if (!formData.nom.trim()) {
      errors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmez le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.telephone.trim()) {
      errors.telephone = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.telephone)) {
      errors.telephone = 'Format de téléphone invalide';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion du changement des inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer les erreurs lors de la saisie
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (error) {
      clearError();
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      prenom: '',
      nom: '',
      email: '',
      password: '',
      confirmPassword: '',
      telephone: '',
      commercant_id: commercantId
    });
    setValidationErrors({});
    setSuccessMessage('');
    clearError();
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Préparer les données pour l'API (sans confirmPassword)
    const { confirmPassword, ...apiData } = formData;

    await createOrUpdate({
      url: `${API_URL}/createLivreur`,
      data: apiData,
      method: 'POST',
      options: {
        onSuccess: (data) => {
          setSuccessMessage('Livreur créé avec succès !');
          resetForm();
          
          // Callback de succès
          if (onSuccess) {
            onSuccess(data);
          }
          
          // Fermer le dialog après 1.5 secondes
          setTimeout(() => {
            setIsOpen(false);
            setSuccessMessage('');
          }, 1500);
        },
        onError: (errorMsg) => {
          console.error('Erreur création livreur:', errorMsg);
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button disabled={disabled || loading}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un livreur
          {maxReached && <Crown className="w-4 h-4 ml-2" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="w-5 h-5 mr-2" />
            Créer un nouveau livreur
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer un compte livreur.
          </DialogDescription>
        </DialogHeader>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Affichage des erreurs API */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prenom" className="text-sm font-medium">
                    Prénom *
                  </Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className={validationErrors.prenom ? 'border-red-500' : ''}
                    placeholder="Entrez le prénom"
                  />
                  {validationErrors.prenom && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.prenom}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nom" className="text-sm font-medium">
                    Nom *
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className={validationErrors.nom ? 'border-red-500' : ''}
                    placeholder="Entrez le nom"
                  />
                  {validationErrors.nom && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.nom}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={validationErrors.email ? 'border-red-500' : ''}
                  placeholder="exemple@email.com"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telephone" className="text-sm font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Téléphone *
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className={validationErrors.telephone ? 'border-red-500' : ''}
                  placeholder="+221 77 123 45 67"
                />
                {validationErrors.telephone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.telephone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mot de passe */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mot de passe *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={validationErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      placeholder="Min. 6 caractères"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmer le mot de passe *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                    placeholder="Répétez le mot de passe"
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Commerçant (lecture seule) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Affectation</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="commercant_id" className="text-sm font-medium flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  ID Commerçant
                </Label>
                <Input
                  id="commercant_id"
                  name="commercant_id"
                  value={formData.commercant_id}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le livreur sera automatiquement affecté à votre commerce
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création en cours...
              </>
            ) : (
              'Créer le livreur'
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Annuler
          </Button>
        </div>

        {/* Aide */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 mr-3 flex-shrink-0"></div>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Informations importantes :</p>
              <ul className="text-blue-600 space-y-1">
                <li>• Le mot de passe doit contenir au moins 6 caractères</li>
                <li>• L'email doit être unique dans le système</li>
                <li>• Le livreur pourra se connecter avec son email et mot de passe</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLivreur;