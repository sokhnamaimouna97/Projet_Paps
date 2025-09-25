import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ROLEPAGES } from '../lib/role';
import { jwtDecode } from 'jwt-decode';

interface Role {
  commercant: string;
  livreur: string;
}

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const ProtectedRoute: React.FC<{ requiredRole?: keyof Role }> = ({ requiredRole }) => {
  const location = useLocation();
  const token = Cookies.get('token');
  const currentPath = location.pathname;

  // Check if token exists
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Get and validate role from token
  const userRole = getUserRoleFromToken(token);
  
  // Handle invalid role
  if (!userRole) {
    console.log('Invalid token or role');
    // Clear authentication data
    clearAuthData();
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check required role
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch: Required ${requiredRole}, Got ${userRole}`);
    return <Navigate to="/" replace />;
  }

  // Check if route is allowed for role
  if (!isRouteAllowed(userRole, currentPath)) {
    console.log(`Route ${currentPath} not allowed for role ${userRole}`);
    return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
  }

  return <Outlet />;
};

const isRouteAllowed = (role: string, path: string): boolean => {
  try {
    const allowedPages = ROLEPAGES[role as keyof typeof ROLEPAGES];
    
    if (!allowedPages) {
      console.warn(`No pages defined for role: ${role}`);
      return false;
    }

    const isAllowed = allowedPages.some(page => {
      const routePattern = new RegExp(
        '^' + page.path.replace(/:[^\s/]+/g, '[^/]+') + '$'
      );
      return routePattern.test(path);
    });

    console.log(`Route ${path} allowed for ${role}: ${isAllowed}`);
    return isAllowed;
  } catch (error) {
    console.error('Error checking route permission:', error);
    return false;
  }
};

const getUserRoleFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Check token expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log('Token expired');
      return null;
    }

    // Return the role directly from the decoded token
    return decoded.role || null;
    
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const getDefaultRouteForRole = (role: string): string => {
  try {
    const pages = ROLEPAGES[role as keyof typeof ROLEPAGES];
    if (!pages || pages.length === 0) {
      console.warn(`No default route found for role: ${role}`);
      return '/';
    }
    return pages[0].path;
  } catch (error) {
    console.error('Error getting default route:', error);
    return '/';
  }
};

const clearAuthData = () => {
  Cookies.remove('token');
  localStorage.removeItem('token');
};

const PublicRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const token = Cookies.get('token');
  const location = useLocation();

  if (token) {
    const userRole = getUserRoleFromToken(token);
    if (userRole) {
      const redirectUrl = getDefaultRouteForRole(userRole);
      console.log(`User already authenticated, redirecting to ${redirectUrl}`);
      return <Navigate to={redirectUrl} state={{ from: location }} replace />;
    }
    clearAuthData();
  }

  return <>{element}</>;
};

export { ProtectedRoute, PublicRoute };