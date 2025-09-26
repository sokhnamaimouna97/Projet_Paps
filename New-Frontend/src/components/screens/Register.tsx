import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { UserPlus, Store, Shield, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../lib/db';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    password: "",
    confirmPassword: "",
    nom_boutique: "",
    adress: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return false;
    }
    
    if (formData.password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Veuillez entrer une adresse email valide.");
      return false;
    }

    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Préparation des données (sans confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await axios.post(`${API_URL}/signup`, dataToSend);
      
      setSuccessMessage("Compte créé avec succès! Un abonnement gratuit de 30 jours a été activé.");
      
      // Redirection vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      
      if (error.response?.status === 409) {
        setErrorMessage("Cet email est déjà utilisé.");
      } else if (error.response?.status === 500) {
        setErrorMessage("Erreur du serveur. Veuillez réessayer plus tard.");
      } else {
        setErrorMessage(error.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F6F5] to-white dark:from-[#0B1A1A] dark:to-[#0E131A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8" role="banner">
          <h1 className="text-3xl text-[#2C3E50] dark:text-white">Créer un compte commerçant</h1>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="grid  gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#2C3E50] dark:text-white">
                  <UserPlus className="w-6 h-6 mr-3 text-[#5CBCB6]" />
                  Inscription
                </CardTitle>
                <CardDescription>
                  Créez votre compte pour commencer à vendre en ligne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#2C3E50] dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Informations personnelles
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prenom">Prénom *</Label>
                        <Input
                          id="prenom"
                          name="prenom"
                          type="text"
                          placeholder="Jean"
                          value={formData.prenom}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nom">Nom *</Label>
                        <Input
                          id="nom"
                          name="nom"
                          type="text"
                          placeholder="Dupont"
                          value={formData.nom}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="jean.dupont@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telephone">Téléphone *</Label>
                        <Input
                          id="telephone"
                          name="telephone"
                          type="tel"
                          placeholder="+33 1 23 45 67 89"
                          value={formData.telephone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informations boutique */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#2C3E50] dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Informations boutique
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="nom_boutique">Nom de la boutique *</Label>
                      <Input
                        id="nom_boutique"
                        name="nom_boutique"
                        type="text"
                        placeholder="Ma Super Boutique"
                        value={formData.nom_boutique}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adress">Adresse *</Label>
                      <Input
                        id="adress"
                        name="adress"
                        type="text"
                        placeholder="123 Rue de la Paix, 75001 Paris"
                        value={formData.adress}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#2C3E50] dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Sécurité
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#5CBCB6] hover:bg-[#4AA9A3] text-white" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Créer mon compte
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Déjà un compte ?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-[#5CBCB6] hover:underline font-medium"
                      >
                        Se connecter
                      </button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informations supplémentaires */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-[#E8F6F5] to-[#D1F2F0] dark:from-[#0B1A1A] dark:to-[#0E2A2A] border-[#5CBCB6]">
              <CardHeader>
                <CardTitle className="flex items-center text-[#2C3E50] dark:text-[#5CBCB6]">
                  <Store className="w-5 h-5 mr-2" />
                  Avantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#2C3E50] dark:text-gray-300">
                  <li>• Abonnement gratuit de 30 jours</li>
                  <li>• Gestion complète de votre boutique</li>
                  <li>• Suivi des commandes en temps réel</li>
                  <li>• Support client dédié</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <Shield className="w-5 h-5 mr-2 text-[#5CBCB6]" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Vos données sont protégées par chiffrement SSL et nos systèmes de sécurité avancés.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="dark:text-white">Démarrage rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Commencez à vendre en quelques minutes seulement après votre inscription.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}