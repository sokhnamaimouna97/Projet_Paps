import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/home.css';
import { Store, Truck, ShoppingBag, Shield, ArrowRight, Play } from 'lucide-react';
import RoleCard from './RoleCard';
import { Button } from '../ui/button';

interface HomeScreenProps {
  onNavigate?: (view: 'merchant' | 'delivery' | 'store' | 'paps' | 'login') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const navigate = useNavigate();
  const [active, setActive] = useState<'roles' | 'marche' | 'temoignages' | 'faq' | 'newsletter' | null>(null);
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    const handler = () => {
      const sections: Array<{ id: typeof active; el: HTMLElement | null }> = [
        { id: 'roles', el: document.getElementById('roles') },
        { id: 'marche', el: document.getElementById('marche') },
        { id: 'temoignages', el: document.getElementById('temoignages') },
        { id: 'faq', el: document.getElementById('faq') },
        { id: 'newsletter', el: document.getElementById('newsletter') },
      ];
      const offset = 90; // hauteur approx. du micro-header
      let current: typeof active = null;
      for (const s of sections) {
        if (!s.el) continue;
        const rect = s.el.getBoundingClientRect();
        if (rect.top - offset <= 0) current = s.id;
      }
      setActive(current);
      setShrunk(window.scrollY > 8);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, []);

  // Fonction de navigation mise à jour pour gérer React Router
  const handleNavigation = (destination: string) => {
    if (destination.startsWith('/')) {
      // Navigation React Router
      navigate(destination);
    } else {
      // Navigation locale via props (fallback)
      if (onNavigate) {
        onNavigate(destination as any);
      }
    }
  };

  const cards = [
    {
      key: 'merchant' as const,
      icon: <Store className="w-9 h-9 text-[#5CBCB6]" />,
      title: 'Commerçant',
      bullets: [
        'Gestion des produits et stock',
        'Suivi des commandes ',
        'Gestion des livreurs',
        'Statistiques et analyses',
      ],
      circleBg: 'bg-[#5CBCB6]/10',
      circleHoverBg: 'group-hover:bg-[#5CBCB6]/20',
      border: 'border-[#5CBCB6]/20',
      buttonText: 'Se connecter',
      buttonClassName: 'w-full bg-[#5CBCB6] hover:bg-[#4AA9A3] text-white',
      buttonVariant: 'default' as const,
      navigateTo: '/login',
      aria: "Accéder à l'espace Commerçant",
    },
    {
      key: 'delivery' as const,
      icon: <Truck className="w-9 h-9 text-[#28A745]" />,
      title: 'Livreur',
      bullets: [
        'Commandes assignées',
        'Suivi en temps réel',
        'Statut disponibilité',
        'Communication directe',
      ],
      circleBg: 'bg-[#28A745]/10',
      circleHoverBg: 'group-hover:bg-[#28A745]/20',
      border: 'border-[#5CBCB6]/20',
      buttonText: 'Se connecter',
      buttonClassName: 'w-full border-[#28A745] text-[#28A745] hover:bg-[#28A745] hover:text-white',
      buttonVariant: 'outline' as const,
      navigateTo: '/login',
      aria: "Accéder à l'espace Livreur",
    },
    {
      key: 'customer' as const,
      icon: <ShoppingBag className="w-9 h-9 text-[#2C3E50]" />,
      title: 'Acheteur',
      bullets: [
        'Catalogue de produits',
        'Panier et commande rapide',
        'Sans création de compte',
        'Suivi de commande',
      ],
      circleBg: 'bg-[#2C3E50]/10',
      circleHoverBg: 'group-hover:bg-[#2C3E50]/20',
      border: 'border-[#5CBCB6]/20',
      buttonText: 'Visiter la Boutique',
      buttonClassName: 'w-full bg-[#2C3E50] hover:bg-[#1A252F] text-white',
      buttonVariant: 'default' as const,
      navigateTo: '/store', // Navigation locale pour customer
      aria: "Visiter la Boutique Acheteur",
    },
    {
      key: 'paps' as const,
      icon: <Shield className="w-9 h-9 text-[#FFC107]" />,
      title: 'Admin',
      bullets: [
        'Gestion des commerçants',
        'Suivi des livraisons',
        'Analyses et rapports',
        'Statistiques en temps réel',
      ],
      circleBg: 'bg-[#FFC107]/10',
      circleHoverBg: 'group-hover:bg-[#FFC107]/20',
      border: 'border-[#5CBCB6]/20',
      buttonText: 'Accès Administrateur',
      buttonClassName: 'w-full bg-[#FFC107] text-[#2C3E50] hover:bg-[#E0A800]',
      buttonVariant: 'default' as const,
      navigateTo: '/login',
      aria: "Accéder au Backoffice Paps",
    },
  ];

  return (
    <div className="home-screen min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E8F6F5] via-white to-white dark:from-[#0B1A1A] dark:via-[#0E131A] dark:to-[#0E131A]">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10">
        {/* Micro-header */}
        <nav className={`micro-header ${shrunk ? 'shrink' : ''} sticky top-0 left-0 right-0 -mx-6 px-6 py-2 mb-6`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-sm">
            <span className="font-semibold text-[#1F2D3D] dark:text-white">Paps</span>
            <div className="flex items-center gap-4">
              <a href="#roles" className={active === 'roles' ? 'active' : ''}>Espaces</a>
              <a href="#marche" className={active === 'marche' ? 'active' : ''}>Comment ça marche</a>
              <a href="#temoignages" className={`hidden sm:inline-block ${active === 'temoignages' ? 'active' : ''}`}>Témoignages</a>
              <a href="#faq" className={`hidden sm:inline-block ${active === 'faq' ? 'active' : ''}`}>FAQ</a>
            </div>
            <div className="hidden sm:block">
              <Button 
                size="sm" 
                onClick={() => navigate('/login')}
                className="h-8 px-3 bg-[#5CBCB6] hover:bg-[#4AA9A3] text-white"
              >
                Démarrer
              </Button>
            </div>
          </div>
        </nav>

        <header className="text-center mb-14 relative" aria-labelledby="site-title">
          <div className="flex justify-center mb-8" aria-hidden="true">
            <div className="w-20 h-20 bg-[#5CBCB6] rounded-2xl flex items-center justify-center shadow-xl shadow-[#5CBCB6]/30">
              <div className="text-white text-2xl font-bold">P</div>
            </div>
          </div>
          <h1 id="site-title" className="text-5xl md:text-4xl sm:text-3xl mb-3 tracking-tight leading-tight text-[#1F2D3D] dark:text-white max-w-3xl mx-auto section-title">
            Vendez local, livrez vite, grandissez sereinement
          </h1>
          <p className="text-base md:text-lg text-[#5A6A7A] dark:text-zinc-300 max-w-xl mx-auto">
            Créez votre boutique en ligne et gérez vos livraisons simplement. Trois espaces, un écosystème.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex items-center justify-center gap-3 hero-cta">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-[#5CBCB6] hover:bg-[#4AA9A3] text-white shadow-md"
            >
              Démarrer gratuitement
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleNavigation('customer')}
              className="border-[#2C3E50] text-[#2C3E50] dark:text-white dark:border-white"
            >
              Explorer une boutique démo
              <Play className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="mt-8" />
        </header>
        
        <main className="px-0">
          <div id="roles" className="text-center mb-4">
            <h2 className="text-xl font-semibold text-[#1F2D3D] dark:text-white">Choisissez votre espace</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch cards-grid">
            {cards.map(card => (
              <div key={card.key} className="h-full">
                <div className="h-full rounded-2xl border border-transparent hover:border-[#5CBCB6]/20 transition-all soft-shadow">
                  <RoleCard
                    icon={card.icon}
                    title={card.title}
                    bulletPoints={card.bullets.slice(0,3)}
                    accentClassName=""
                    borderClassName={`bg-white dark:bg-gray-800`}
                    circleBgClassName={card.circleBg}
                    circleHoverBgClassName={card.circleHoverBg}
                    buttonText={card.buttonText}
                    buttonClassName={card.buttonClassName}
                    buttonVariant={card.buttonVariant}
                    onClick={() => handleNavigation(card.navigateTo)}
                    ariaLabel={card.aria}
                  />
                </div>
              </div>
            ))}
          </div>
         
          {/* Comment ça marche */}
          <section id="marche" className="mt-16" aria-label="Comment ça marche">
            <h3 className="section-title text-lg font-semibold text-center text-[#1F2D3D] dark:text-white">
              Comment ça marche
            </h3>
            <div className="gradient-underline" />
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {[
                { step: '01', title: 'Créez votre compte', desc: 'Renseignez votre boutique et vos informations.' },
                { step: '02', title: 'Ajoutez vos produits', desc: 'Importez ou créez vos fiches simplement.' },
                { step: '03', title: 'Vendez et livrez', desc: 'Recevez des commandes et suivez les livraisons.' },
              ].map((it) => (
                <div key={it.step} className="rounded-xl bg-white dark:bg-gray-800 border border-[#5CBCB6]/10 p-6">
                  <div className="text-[#5CBCB6] text-sm font-semibold mb-1">{it.step}</div>
                  <div className="text-[#2C3E50] dark:text-white font-semibold">{it.title}</div>
                  <div className="text-sm text-[#6C757D] dark:text-zinc-300 mt-1">{it.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Section témoignages */}
          <section id="temoignages" className="mt-16" aria-label="Témoignages">
            <h3 className="section-title text-lg font-semibold text-center text-[#1F2D3D] dark:text-white">
              Ce que disent nos utilisateurs
            </h3>
            <div className="gradient-underline" />
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {[
                { 
                  name: 'Amadou Diallo', 
                  role: 'Commerçant', 
                  text: 'Paps m\'a permis de digitaliser ma boutique rapidement. Les ventes ont augmenté de 40% en 3 mois.' 
                },
                { 
                  name: 'Fatou Sow', 
                  role: 'Livreuse', 
                  text: 'Interface simple et efficace. Je peux gérer toutes mes livraisons depuis l\'application.' 
                },
              ].map((testimonial, index) => (
                <div key={index} className="rounded-xl bg-white dark:bg-gray-800 border border-[#5CBCB6]/10 p-6">
                  <p className="text-[#2C3E50] dark:text-white mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#5CBCB6] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-[#2C3E50] dark:text-white font-semibold text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-[#6C757D] dark:text-zinc-300 text-xs">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section FAQ */}
          <section id="faq" className="mt-16" aria-label="Questions fréquentes">
            <h3 className="section-title text-lg font-semibold text-center text-[#1F2D3D] dark:text-white">
              Questions fréquentes
            </h3>
            <div className="gradient-underline" />
            <div className="space-y-4 mt-6">
              {[
                {
                  q: 'Comment commencer sur Paps ?',
                  a: 'Créez simplement votre compte en choisissant votre espace (commerçant ou livreur) et suivez le guide d\'onboarding.'
                },
                {
                  q: 'Quels sont les frais ?',
                  a: 'Paps applique une commission compétitive sur chaque vente réalisée. Pas d\'abonnement mensuel.'
                },
                {
                  q: 'Comment gérer les livraisons ?',
                  a: 'Assignez automatiquement ou manuellement les commandes aux livreurs disponibles depuis votre dashboard.'
                },
              ].map((faq, index) => (
                <details key={index} className="rounded-xl bg-white dark:bg-gray-800 border border-[#5CBCB6]/10 p-6">
                  <summary className="text-[#2C3E50] dark:text-white font-semibold cursor-pointer">
                    {faq.q}
                  </summary>
                  <p className="text-[#6C757D] dark:text-zinc-300 text-sm mt-3">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

        </main>

        {/* Pied de page simple */}
        <footer className="mt-16 text-center text-xs text-[#6C757D] dark:text-zinc-400">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
            <a href="#" className="hover:underline">Conditions</a>
            <span>•</span>
            <a href="#" className="hover:underline">Confidentialité</a>
            <span>•</span>
            <a href="#" className="hover:underline">Contact</a>
          </div>
          <div>© {new Date().getFullYear()} Paps — Tous droits réservés.</div>
        </footer>
      </div>
    </div>
  );
}