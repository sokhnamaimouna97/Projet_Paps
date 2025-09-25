import { Navigate, Route, Routes } from 'react-router-dom';
import LoginScreen from './src/components/screens/LoginScreen';
import HomeScreen from './src/components/screens/HomeScreen';
import { ProtectedRoute, PublicRoute } from './src/components/ProtectedRoute';
import { ROLEPAGES, PUBLIC_ROUTES } from './src/lib/role';
import CustomerStore from './src/components/CustomerStore';

const Router = () => {
  return (
    <Routes>
      {/* Route de connexion */}
      <Route path="/login" element={<PublicRoute element={<LoginScreen />} />} />
      
      {/* Routes publiques */}
      <Route path="/" element={<PublicRoute element={<HomeScreen />} />} />
       <Route path="/store" element={<PublicRoute element={<CustomerStore />} />} />
      
      {/* Routes Admin protégées */}
      <Route element={<ProtectedRoute requiredRole="commercant" />}>
        {ROLEPAGES.commercant.map((route, index) => (
          <Route 
            key={`admin-${index}`}
            path={route.path} 
            element={<route.component />} 
          />
        ))}
      </Route>

      {/* Routes Agent protégées */}
      <Route element={<ProtectedRoute requiredRole="livreur" />}>
        {ROLEPAGES.livreur.map((route, index) => (
          <Route 
            key={`agent-${index}`}
            path={route.path} 
            element={<route.component />} 
          />
        ))}
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;