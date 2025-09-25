import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginScreen() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const data = { email, password };
      await login(data, navigate);
      setSuccessMessage("Connexion réussie!");
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      
      if (error.response?.status === 401) {
        setErrorMessage("Email ou mot de passe incorrect.");
      } else if (error.response?.status === 500) {
        setErrorMessage("Erreur du serveur. Veuillez réessayer plus tard.");
      } else {
        setErrorMessage("Erreur lors de la connexion. Veuillez vérifier vos identifiants.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F6F5] to-white dark:from-[#0B1A1A] dark:to-[#0E131A] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8" role="banner">
          <h1 className="text-3xl text-[#2C3E50] dark:text-white">Connexion</h1>
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

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-[#2C3E50] dark:text-white">
                <LogIn className="w-6 h-6 mr-3 text-[#5CBCB6]" />
                Se Connecter
              </CardTitle>
              <CardDescription>
                Veuillez entrer vos informations pour vous connecter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="*****"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#5CBCB6] hover:bg-[#4AA9A3] text-white" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Chargement...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informations supplémentaires */}
          <div className="space-y-6">
            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="dark:text-white">Bienvenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Connectez-vous pour accéder à votre espace personnel et gérer vos activités.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-[#E8F6F5] to-[#D1F2F0] dark:from-[#0B1A1A] dark:to-[#0E2A2A] border-[#5CBCB6]">
              <CardHeader>
                <CardTitle className="text-[#2C3E50] dark:text-[#5CBCB6]">Plateforme sécurisée</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#2C3E50] dark:text-gray-300">
                  Vos données sont protégées par nos systèmes de sécurité avancés.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}