/**
 * 🔐 HOOK DE REACT PARA DIDIT VERIFICATION
 * 
 * Hook personalizado para manejar la verificación de identidad con Didit
 * en componentes de React
 */

import { useState, useCallback } from 'react';
import { DiditIntegration, DoctorVerificationData, DiditSession, DiditResults } from '@/lib/didit-integration';

export interface UseDiditVerificationReturn {
  // Estado
  isLoading: boolean;
  error: string | null;
  session: DiditSession | null;
  results: DiditResults | null;
  
  // Acciones
  createSession: (doctorData: DoctorVerificationData, workflowId?: string) => Promise<void>;
  getResults: (sessionId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export interface UseDiditVerificationOptions {
  workflowId?: string;
  callbackUrl?: string;
  onSuccess?: (session: DiditSession) => void;
  onError?: (error: Error) => void;
  onResults?: (results: DiditResults) => void;
}

/**
 * Hook para manejar la verificación de identidad con Didit
 * 
 * @param options - Opciones de configuración
 * @returns Objeto con estado y funciones para manejar la verificación
 */
export function useDiditVerification(
  options: UseDiditVerificationOptions = {}
): UseDiditVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<DiditSession | null>(null);
  const [results, setResults] = useState<DiditResults | null>(null);

  // Instancia de Didit
  const didit = new DiditIntegration();

  /**
   * Crea una nueva sesión de verificación
   */
  const createSession = useCallback(async (
    doctorData: DoctorVerificationData,
    workflowId?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Creando sesión de verificación...');
      console.log('Datos del médico:', doctorData);

      const newSession = await didit.createVerificationSession(
        doctorData,
        workflowId || options.workflowId,
        options.callbackUrl
      );

      setSession(newSession);
      
      // Callback de éxito
      if (options.onSuccess) {
        options.onSuccess(newSession);
      }

      console.log('✅ Sesión creada exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      // Callback de error
      if (options.onError) {
        options.onError(err instanceof Error ? err : new Error(errorMessage));
      }

      console.error('❌ Error creando sesión:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [didit, options]);

  /**
   * Obtiene los resultados de una sesión
   */
  const getResults = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`📊 Obteniendo resultados para sesión: ${sessionId}`);

      const sessionResults = await didit.getVerificationResults(sessionId);
      setResults(sessionResults);
      
      // Callback de resultados
      if (options.onResults) {
        options.onResults(sessionResults);
      }

      console.log('✅ Resultados obtenidos exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      // Callback de error
      if (options.onError) {
        options.onError(err instanceof Error ? err : new Error(errorMessage));
      }

      console.error('❌ Error obteniendo resultados:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [didit, options]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Resetea todo el estado
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSession(null);
    setResults(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    session,
    results,
    
    // Acciones
    createSession,
    getResults,
    clearError,
    reset
  };
}

export default useDiditVerification;
