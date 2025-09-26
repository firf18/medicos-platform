/**
 * CSRF Token Hook
 * @fileoverview Hook for managing CSRF tokens in frontend
 * @compliance CSRF protection with secure token management
 */

import { useState, useEffect, useCallback } from 'react';

interface CSRFState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useCSRFToken = () => {
  const [csrfState, setCSRFState] = useState<CSRFState>({
    token: null,
    isLoading: true,
    error: null
  });

  const fetchCSRFToken = useCallback(async () => {
    try {
      setCSRFState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      
      setCSRFState({
        token: data.token,
        isLoading: false,
        error: null
      });

      return data.token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCSRFState({
        token: null,
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    return await fetchCSRFToken();
  }, [fetchCSRFToken]);

  useEffect(() => {
    fetchCSRFToken();
  }, [fetchCSRFToken]);

  return {
    token: csrfState.token,
    isLoading: csrfState.isLoading,
    error: csrfState.error,
    refreshToken
  };
};
