// hooks/useApiClient.ts
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

interface ApiResponse<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  showLoading?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

// 🔑 Hook personnalisé pour les appels API
export const useApiClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📥 GET JSON avec React
  const fetchJSON = useCallback(async <T = any>(
    url: string, 
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { showLoading = true, onSuccess, onError } = options;
    
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('token');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (onSuccess) onSuccess(data);
      
      if (showLoading) setLoading(false);
      return { data, loading: false, error: null };

    } catch (err: any) {
      const errorMessage = err.message || 'Une erreur est survenue';
      console.error('❌ Erreur fetchJSON:', errorMessage);
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
      if (showLoading) setLoading(false);
      
      return { data: null, loading: false, error: errorMessage };
    }
  }, []);

  // 📤 CREATE ou UPDATE avec React
  const createOrUpdate = useCallback(async <T = any>({
    url,
    data,
    method = 'POST',
    options = {}
  }: {
    url: string;
    data: any;
    method?: 'POST' | 'PUT' | 'PATCH';
    options?: ApiOptions;
  }): Promise<ApiResponse<T>> => {
    const { showLoading = true, onSuccess, onError } = options;
    
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('🚨 Token manquant !');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await axios({
        method,
        url,
        data,
        headers,
      });

      if (onSuccess) onSuccess(response.data);
      
      if (showLoading) setLoading(false);
      return { data: response.data, loading: false, error: null };

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          err.message || 
                          'Une erreur est survenue';
      
      console.error('💥 Erreur API :', errorMessage);
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
      if (showLoading) setLoading(false);
      
      return { data: null, loading: false, error: errorMessage };
    }
  }, []);

  // 🗑️ DELETE avec React
  const deleteResource = useCallback(async <T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { showLoading = true, onSuccess, onError } = options;
    
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('🚨 Token manquant !');
      }

      const response = await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (onSuccess) onSuccess(response.data);
      
      if (showLoading) setLoading(false);
      return { data: response.data, loading: false, error: null };

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          err.message || 
                          'Une erreur est survenue';
      
      console.error('💥 Erreur DELETE :', errorMessage);
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
      if (showLoading) setLoading(false);
      
      return { data: null, loading: false, error: errorMessage };
    }
  }, []);

  return {
    loading,
    error,
    fetchJSON,
    createOrUpdate,
    deleteResource,
    clearError: () => setError(null),
  };
};