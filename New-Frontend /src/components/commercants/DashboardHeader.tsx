import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ArrowLeft, ShoppingCart, Share2, Copy, MessageCircle, Facebook, Twitter, Crown } from 'lucide-react';
import StoreSettings from '../StoreSettings';
import { toast } from 'sonner';

interface StoreSettings {
  name: string;
  description: string;
  logo: string;
  headerImage: string;
}

interface DashboardHeaderProps {
  onBack: () => void;
  onSwitchToStore?: () => void;
  isPremium: boolean;
  setIsPremium: React.Dispatch<React.SetStateAction<boolean>>;
  merchantId: string;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onBack,
  onSwitchToStore,
  isPremium,
  setIsPremium,
  merchantId,
  storeSettings,
  setStoreSettings,
  isShareDialogOpen,
  setIsShareDialogOpen
}) => {
  // Fonctions de partage
  const getStoreUrl = () => {
    return `${window.location.origin}${window.location.pathname}?merchant=${merchantId}`;
  };

  const shareToWhatsApp = () => {
    const storeUrl = getStoreUrl();
    const message = `🛍️ Découvrez ma boutique en ligne !\n\nVenez découvrir mes produits locaux et passez commande facilement :\n${storeUrl}\n\n#CommerceLocal #Livraison`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = () => {
    const storeUrl = getStoreUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareToTwitter = () => {
    const storeUrl = getStoreUrl();
    const message = "🛍️ Découvrez ma boutique en ligne ! Produits locaux et livraison rapide.";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(storeUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const copyStoreLink = async () => {
    const storeUrl = getStoreUrl();
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast.success('Lien copié dans le presse-papiers !');
    } catch (err) {
      toast.error('Erreur lors de la copie du lien');
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b dark:border-gray-700" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-xl text-gray-900 dark:text-white">Dashboard Commerçant</h1>
            {isPremium && (
              <Badge className="ml-3 bg-[#FFC107] text-[#2C3E50]">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <StoreSettings 
              merchantId={merchantId}
              currentSettings={storeSettings}
              onSettingsUpdate={setStoreSettings}
            />
            
            {onSwitchToStore && (
              <Button variant="outline" onClick={onSwitchToStore} className="border-[#5CBCB6] text-[#5CBCB6] hover:bg-[#E8F6F5]">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Voir ma boutique
              </Button>
            )}
            
            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-[#5CBCB6] text-[#5CBCB6] hover:bg-[#E8F6F5]">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager ma boutique
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Partager votre boutique</DialogTitle>
                  <DialogDescription>
                    Partagez le lien de votre boutique sur les réseaux sociaux ou copiez le lien directement.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Lien de votre boutique :</p>
                    <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                      {getStoreUrl()}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={shareToWhatsApp} className="bg-green-600 hover:bg-green-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button onClick={shareToFacebook} className="bg-blue-600 hover:bg-blue-700">
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button onClick={shareToTwitter} className="bg-sky-500 hover:bg-sky-600">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button onClick={copyStoreLink} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copier le lien
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {!isPremium && (
              <Button 
                onClick={() => setIsPremium(true)} 
                className="bg-[#FFC107] text-[#2C3E50] hover:bg-[#E0A800]"
              >
                <Crown className="w-4 h-4 mr-2" />
                Passer en Premium
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;