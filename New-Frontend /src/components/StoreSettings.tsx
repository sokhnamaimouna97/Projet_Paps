import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Settings, Upload, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';


interface StoreSettingsProps {
  merchantId: string;
  currentSettings: {
    name: string;
    description?: string;
    logo?: string;
    headerImage?: string;
  };
  onSettingsUpdate: (settings: any) => void;
}

export default function StoreSettings({ merchantId, currentSettings, onSettingsUpdate }: StoreSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(currentSettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Ici, vous intégreriez l'appel API pour sauvegarder les paramètres
      // Pour la démo, on simule la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSettingsUpdate(settings);
      setIsOpen(false);
      toast.success('Paramètres de la boutique mis à jour !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomHeaderImage = () => {
    const headerImages = [
      'https://images.unsplash.com/photo-1742199545197-7172a58e526b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0JTIwZ3JvY2VyeSUyMHN0b3JlfGVufDF8fHx8MTc1NzgwMDA1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0cyUyMHZlZ2V0YWJsZXMlMjBncm9jZXJ5fGVufDF8fHx8MTc1NzY4OTAxMHww&ixlib=rb-4.1.0&q=80&w=1200',
      'https://images.unsplash.com/photo-1605450029268-93b71c39b632?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMGJ1c2luZXNzJTIwc3RvcmV8ZW58MXx8fHwxNzU3ODAwMDU2fDA&ixlib=rb-4.1.0&q=80&w=1200',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHByb2R1Y2UlMjBtYXJrZXR8ZW58MXx8fHwxNzU3ODAwMDU2fDA&ixlib=rb-4.1.0&q=80&w=1200'
    ];
    
    const randomImage = headerImages[Math.floor(Math.random() * headerImages.length)];
    setSettings({ ...settings, headerImage: randomImage });
    toast.success('Image d\'en-tête mise à jour !');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#5CBCB6] text-[#5CBCB6] hover:bg-[#E8F6F5]">
          <Settings className="w-4 h-4 mr-2" />
          Paramètres boutique
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2C3E50]">Paramètres de la boutique</DialogTitle>
          <DialogDescription>
            Personnalisez l'apparence et les informations de votre boutique
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#2C3E50]">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="store-name">Nom de la boutique</Label>
                <Input
                  id="store-name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Mon Commerce Local"
                />
              </div>
              
              <div>
                <Label htmlFor="store-description">Description</Label>
                <Textarea
                  id="store-description"
                  value={settings.description || ''}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Décrivez votre boutique et vos spécialités..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image d'en-tête */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#2C3E50]">Image d'en-tête</CardTitle>
              <CardDescription>
                Cette image apparaît en bannière sur votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.headerImage && (
                <div className="relative h-32 rounded-lg overflow-hidden border">
                  <img 
                    src={settings.headerImage} 
                    alt="Aperçu de l'en-tête"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button size="sm" variant="secondary" className="bg-white/80">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="header-image-url">URL de l'image</Label>
                  <Input
                    id="header-image-url"
                    value={settings.headerImage || ''}
                    onChange={(e) => setSettings({ ...settings, headerImage: e.target.value })}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
                <div className="pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={getRandomHeaderImage}
                    className="border-[#5CBCB6] text-[#5CBCB6] hover:bg-[#E8F6F5]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Image aléatoire
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>💡 <strong>Conseils :</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Utilisez une image de haute qualité (au moins 1200x400px)</li>
                  <li>Choisissez une image qui représente votre activité</li>
                  <li>Évitez les images avec trop de texte</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#2C3E50]">Logo de la boutique</CardTitle>
              <CardDescription>
                Logo affiché à côté du nom de votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.logo && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={settings.logo} 
                    alt="Logo actuel"
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <span className="text-sm text-gray-600">Logo actuel</span>
                </div>
              )}
              
              <div>
                <Label htmlFor="logo-url">URL du logo</Label>
                <Input
                  id="logo-url"
                  value={settings.logo || ''}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  placeholder="https://exemple.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-[#5CBCB6] hover:bg-[#4AA9A3] text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}