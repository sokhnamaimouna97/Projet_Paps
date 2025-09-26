import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Check, 
  Star,
  ArrowRight,
  Menu,
  Phone,
  Mail
} from 'lucide-react';
import papsLogo from '../figma/assets/f78545a4-2df2-4ea0-8f6e-6e655d9a017a.jpg';
import heroImage from '../figma/assets/90a2947e-8bdf-457f-8e6f-8774eeec7943.png';
import dashboardImage from '../figma/assets/e3fbdd59-d4ed-4b96-8b38-a80646b0a291.png';
import featuresImage from '../figma/assets/673cc20b-24bf-4442-9c7a-7e6976e36363.png';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={papsLogo} alt="PAPS" className="h-10 w-auto" />
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-[#2E3A59] transition-colors">Services</a>
              <a href="#avantages" className="text-gray-700 hover:text-[#2E3A59] transition-colors">Avantages</a>
              <a href="#contact" className="text-gray-700 hover:text-[#2E3A59] transition-colors">Contact</a>
            </nav>

            <div className="flex items-center space-x-4">
             <Link to="/login">
  <Button 
    variant="outline" 
    className="border-[#2E3A59] text-[#2E3A59] hover:bg-[#2E3A59] hover:text-white"
  >
    Se connecter
  </Button>
</Link>
<Link to="/register">. 
<Button className="bg-[#52C1B8] hover:bg-[#4AB0A8] text-white">
                Créer mon compte
              </Button></Link>
            
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2E3A59] via-[#3A4B6B] to-[#52C1B8] text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-[#52C1B8] text-white hover:bg-[#4AB0A8]">
                  ✨ Solution complète pour commerçants
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Créez votre boutique en ligne en
                  <span className="text-[#52C1B8]"> quelques clics</span>
                </h1>
                <p className="text-xl text-gray-200 leading-relaxed">
                  Il suffit de créer votre compte PAPS pour disposer instantanément de votre boutique personnelle avec toutes les fonctions de gestion : commandes, stock et livraisons.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-[#52C1B8] hover:bg-[#4AB0A8] text-white text-lg px-8 py-4">
                  Créer ma boutique gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#2E3A59] text-lg px-8 py-4">
                  Voir la démo
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-[#52C1B8]" />
                  <span>Inscription gratuite</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-[#52C1B8]" />
                  <span>Configuration en 5 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-[#52C1B8]" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src={heroImage}
                  alt="Commerçant avec PAPS"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#52C1B8]/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#52C1B8] text-white hover:bg-[#4AB0A8] mb-4">
              Nos Services
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#2E3A59] mb-6">
              Tout ce dont vous avez besoin pour gérer votre commerce
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une seule plateforme, trois fonctions essentielles pour développer votre activité commercial en toute simplicité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#52C1B8]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#52C1B8] transition-colors duration-300">
                  <Package className="h-8 w-8 text-[#52C1B8] group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-[#2E3A59] text-xl">Gestion des stocks</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Suivez vos produits en temps réel, gérez les alertes de stock et optimisez vos approvisionnements automatiquement.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Suivi en temps réel
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Alertes automatiques
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Gestion multi-entrepôts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#52C1B8]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#52C1B8] transition-colors duration-300">
                  <ShoppingCart className="h-8 w-8 text-[#52C1B8] group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-[#2E3A59] text-xl">Suivi des commandes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Centralisez toutes vos commandes, automatisez le traitement et offrez un suivi transparent à vos clients.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Interface centralisée
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Traitement automatisé
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Notifications clients
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white group md:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#52C1B8]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#52C1B8] transition-colors duration-300">
                  <Truck className="h-8 w-8 text-[#52C1B8] group-hover:text-white transition-colors duration-300" />
                </div>
                <CardTitle className="text-[#2E3A59] text-xl">Réseau de livraison</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Accédez à notre réseau de livreurs partenaires et assurez des livraisons rapides et fiables pour vos clients.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Réseau étendu
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Suivi GPS
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#52C1B8] mr-2" />
                    Tarifs préférentiels
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#2E3A59] text-white hover:bg-[#3A4B6B] mb-4">
              Comment ça marche
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#2E3A59] mb-6">
              Lancez votre boutique en 3 étapes simples
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plus besoin d'être un expert technique. En quelques minutes, votre boutique est opérationnelle.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#52C1B8] rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2E3A59] mb-2">Créez votre compte</h3>
                  <p className="text-gray-600">
                    Inscrivez-vous gratuitement avec votre email. Aucune carte bancaire requise pour commencer.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#52C1B8] rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2E3A59] mb-2">Configurez votre boutique</h3>
                  <p className="text-gray-600">
                    Ajoutez vos produits, définissez vos prix et personnalisez l'apparence de votre boutique en quelques clics.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#52C1B8] rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2E3A59] mb-2">Commencez à vendre</h3>
                  <p className="text-gray-600">
                    Partagez le lien de votre boutique et commencez à recevoir des commandes immédiatement.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="bg-[#52C1B8] hover:bg-[#4AB0A8] text-white">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <img
                src={dashboardImage}
                alt="Interface PAPS"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Boutique en ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="avantages" className="py-20 bg-gradient-to-br from-[#2E3A59] to-[#3A4B6B] text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#52C1B8] text-white hover:bg-[#4AB0A8] mb-4">
              Pourquoi choisir PAPS
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Des avantages qui font la différence
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Rejoignez des milliers de commerçants qui font confiance à PAPS pour développer leur activité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#52C1B8] rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">+250</h3>
              <p className="text-gray-300">Commerçants actifs</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#52C1B8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">11K+</h3>
              <p className="text-gray-300">Commandes traitées</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#52C1B8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">95%</h3>
              <p className="text-gray-300">Livraisons réussies</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#52C1B8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">4.8/5</h3>
              <p className="text-gray-300">Satisfaction client</p>
            </div>
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={featuresImage}
                alt="Livraison PAPS"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">Une solution pensée pour l'Afrique</h3>
              <p className="text-gray-200 text-lg">
                PAPS comprend les défis spécifiques du commerce en Afrique et propose des solutions adaptées à notre contexte local.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-[#52C1B8]" />
                  <span className="text-lg">Paiement mobile intégré</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-[#52C1B8]" />
                  <span className="text-lg">Livraison dans toute la région</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-[#52C1B8]" />
                  <span className="text-lg">Support multilingue</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-[#52C1B8]" />
                  <span className="text-lg">Interface simple et intuitive</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl lg:text-3xl font-medium text-[#2E3A59] mb-8">
                "Depuis que j'utilise PAPS, j'ai multiplié mes ventes par 3. La gestion des stocks et des livraisons est devenue un jeu d'enfant !"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-[#52C1B8] rounded-full flex items-center justify-center text-white text-xl font-bold">
                  A
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#2E3A59]">Aïssatou Diallo</p>
                  <p className="text-gray-600">Propriétaire, Boutique Mode Dakar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#52C1B8]">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Prêt à transformer votre commerce ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de commerçants qui ont déjà fait le choix de PAPS. Créez votre compte gratuitement aujourd'hui !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#52C1B8] text-lg px-8 py-4">
              Créer mon compte gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 text-lg px-8 py-4">
              Planifier une démo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#2E3A59] text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img src={papsLogo} alt="PAPS" className="h-12 w-auto mb-4 filter brightness-0 invert" />
              <p className="text-gray-300 mb-6 max-w-md">
                PAPS simplifie la gestion de votre commerce avec des outils puissants et faciles à utiliser.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-[#52C1B8]" />
                  <span className="text-gray-300">+221 33 XXX XX XX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-[#52C1B8]" />
                  <span className="text-gray-300">contact@paps.sn</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[#52C1B8] transition-colors">Gestion des stocks</a></li>
                <li><a href="#" className="hover:text-[#52C1B8] transition-colors">Suivi des commandes</a></li>
                <li><a href="#" className="hover:text-[#52C1B8] transition-colors">Réseau de livraison</a></li>
                <li><a href="#" className="hover:text-[#52C1B8] transition-colors">Analytiques</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[#52C1B8] transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-[#52C1B8] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#52C1B8] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#52C1B8] transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PAPS. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}