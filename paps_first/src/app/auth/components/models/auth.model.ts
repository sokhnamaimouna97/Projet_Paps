export interface User {
  _id?: string;
  id?: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  role: 'commercant' | 'livreur' | 'superAdmin';
  commercant_id?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Interface pour l'inscription commerçant (correspond à votre API)
export interface RegisterRequest {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  password: string;
  nom_boutique: string;
  adress: string;
}

export interface RegisterCommercantResponse {
  message: string;
  user: User;
  subscription: {
    start: string;
    end: string;
    status: string;
  };
}

// Types des rôles utilisateurs
export type UserRole = 'livreur' | 'superAdmin' | 'commercant';

// Interface pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Interface pour les résultats de validation
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

// Types pour les réponses d'API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

// ===== 2. CONSTANTES =====
// src/app/constants/auth.constants.ts
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'current_user',
  TOKEN_EXPIRY_KEY: 'token_expiry',
  REFRESH_TOKEN_KEY: 'refresh_token'
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  VALIDATE_TOKEN: '/auth/validate',
  REFRESH_TOKEN: '/auth/refresh',
  PROFILE: '/auth/profile'
} as const;

// Messages d'erreur par défaut
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email ou mot de passe invalide',
  TOKEN_EXPIRED: 'Votre session a expiré, veuillez vous reconnecter',
  NETWORK_ERROR: 'Erreur de connexion, veuillez réessayer',
  UNAUTHORIZED: 'Accès non autorisé',
  VALIDATION_ERROR: 'Erreur de validation des données'
} as const;