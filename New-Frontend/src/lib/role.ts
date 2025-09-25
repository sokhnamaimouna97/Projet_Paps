import MerchantDashboard from "../components/MerchantDashboard";
import DeliveryDashboard from "../components/DeliveryDashboard";
import CustomerStore from "../components/CustomerStore";
import PapsBackoffice from "../components/PapsBackoffice";
import HomeScreen from "../components/screens/HomeScreen";

type Role = 'commercant' | 'livreur';

export const ROLEPAGES: Record<Role, { path: string; component: React.ElementType }[]> = {
  commercant: [
    { path: '/admin/dashboard', component: MerchantDashboard },
    { path: '/admin/backoffice', component: PapsBackoffice },
    { path: '/admin/settings', component: DeliveryDashboard }, 
  ],
  livreur: [
   // { path: '/agent/dashboard', component: CustomerStore },
    { path: '/agent/delivery', component: DeliveryDashboard },
      { path: '/login', component: DeliveryDashboard },
  ]
};

// Ajoutez également les routes publiques
export const PUBLIC_ROUTES = [
//  { path: '/home', component: HomeScreen },
  { path: '/store', component: CustomerStore },
];

export const getRedirectUrl = (role: Role): string => {
  console.log("Rôle reçu pour redirection :", role);
  const pages = ROLEPAGES[role];

  if (pages && pages.length > 0) {
    console.log(`Redirection pour ${role}:`, pages[0].path);
    return pages[0].path;
  } else {
    console.warn("Rôle non reconnu, redirection par défaut.");
    return '/home';
  }
};

export function getRedirectUrlForRole(role: Role): string {
  return getRedirectUrl(role);
}