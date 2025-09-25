import React, { createContext, useContext, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../lib/db";
import { getRedirectUrlForRole } from "../lib/role";
import { User } from "../components/Models/user.models";

const baseUrl = `${API_URL}`

// Types pour le contexte
interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (contact: User, navigate: ReturnType<typeof useNavigate>) => Promise<void>;
  logout: () => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fournisseur de contexte
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    Cookies.get("token") || localStorage.getItem("token") || null
  );
  const [role, setRole] = useState<string | null>(null);

  const login = async (contact: User, navigate: ReturnType<typeof useNavigate>) => {
    try {
      const response = await axios.post(`${baseUrl}/signin`, contact);
  
      const { token, user } = response.data;
      if (!token || !user || !user.role) {
        throw new Error("Token ou rôle manquant dans la réponse");
      }
  
      // Met à jour les états locaux
      setToken(token);
      setRole(user.role);
  
      // Stocke le token dans les cookies
      Cookies.set("token", token, {
        expires: 7,
        path: "/",
        secure: true,
        sameSite: "Strict",
      });
  
      // Stocke le token dans localStorage
      localStorage.setItem("token", token);
  
      // Configure axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
      // Redirection basée sur le rôle
      const redirectUrl = getRedirectUrlForRole(user.role);
      if (!redirectUrl) {
        throw new Error("URL de redirection invalide pour le rôle");
      }
      navigate(redirectUrl);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  const logout = () => {
    // Réinitialise les états locaux
    setToken(null); 
    setRole(null);

    // Supprime le token des cookies et du localStorage
    Cookies.remove("token");
    localStorage.removeItem("token");

    console.log("Cookie après suppression:", Cookies.get("token")); // Doit être undefined
    console.log("LocalStorage après suppression:", localStorage.getItem("token")); // Doit être null

    // Supprime le header Authorization
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};


/* import React, { createContext, useContext, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { API_URL } from "../../lib/db";

const baseUrl = ${API_URL};

// Types pour le contexte
interface AuthContextType {
  token: string | null;
  login: (contact: User) => Promise<void>;
  logout: () => void;
}

interface User {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fournisseur de contexte
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    Cookies.get("token") || localStorage.getItem("token") || null
  );

  const login = async (contact: User) => {
    try {
      const response = await axios.post(${baseUrl}/signin, contact);

      const { token } = response.data;
      if (!token) {
        throw new Error("Token manquant dans la réponse");
      }

      // Met à jour l'état local
      setToken(token);

      // Stocke le token dans les cookies
      Cookies.set("token", token, {
        expires: 7, // Durée de vie en jours
        path: "/",
        secure: true,
        sameSite: "Strict",
      });

      // Stocke le token dans localStorage
      localStorage.setItem("token", token);

      // Configure axios
      axios.defaults.headers.common["Authorization"] = Bearer ${token};
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  const logout = () => {
    // Réinitialise l'état local
    setToken(null);

    // Supprime le token des cookies et du localStorage
    Cookies.remove("token");
    localStorage.removeItem("token");

    // Supprime le header Authorization
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}; */