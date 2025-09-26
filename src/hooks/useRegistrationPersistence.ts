/**
 * Hook personalizado para persistencia del progreso de registro - Red-Salud
 * 
 * Este hook maneja el guardado y recuperación del progreso del registro
 * de médicos en el almacenamiento local del navegador.
 */

import { useState, useEffect, useCallback } from 'react';
import { DoctorRegistrationData, RegistrationProgress } from '@/types/medical/specialties';
import { REGISTRATION_PERSISTENCE_CONFIG, getExpirationTimeMs } from '@/lib/config/registration-persistence';

interface UseRegistrationPersistenceReturn {
  saveProgress: (data: DoctorRegistrationData, progress: RegistrationProgress) => void;
  loadProgress: () => { data: DoctorRegistrationData | null; progress: RegistrationProgress | null };
  clearProgress: () => void;
  hasSavedProgress: boolean;
  isInitialized: boolean; // Nueva propiedad para verificar inicialización
}

const REGISTRATION_STORAGE_KEY = REGISTRATION_PERSISTENCE_CONFIG.storage.keys.registrationData;
const PROGRESS_STORAGE_KEY = REGISTRATION_PERSISTENCE_CONFIG.storage.keys.progressData;
const SESSION_TIMESTAMP_KEY = REGISTRATION_PERSISTENCE_CONFIG.storage.keys.sessionTimestamp;

// Configuración de limpieza automática
const SESSION_TIMEOUT_HOURS = REGISTRATION_PERSISTENCE_CONFIG.cleanup.expirationHours;
const PAGE_RELOAD_CLEAR = REGISTRATION_PERSISTENCE_CONFIG.cleanup.onPageReload;
const NAVIGATION_CLEAR = REGISTRATION_PERSISTENCE_CONFIG.cleanup.onNavigationAway;
const TAB_CHANGE_CLEAR = REGISTRATION_PERSISTENCE_CONFIG.cleanup.onTabChange;
const PAGE_UNLOAD_CLEAR = REGISTRATION_PERSISTENCE_CONFIG.cleanup.onPageUnload;

// Función para verificar si los datos han expirado
function isDataExpired(): boolean {
  try {
    if (typeof window === 'undefined') {
      return true;
    }
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    if (!timestamp) return true;
    
    const savedTime = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
    
    return diffHours > SESSION_TIMEOUT_HOURS;
  } catch (error) {
    console.error('[PERSISTENCE] Error verificando expiración:', error);
    return true; // Si hay error, considerar como expirado
  }
}

// Función para limpiar datos expirados
function clearExpiredData(): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    if (isDataExpired()) {
      localStorage.removeItem(REGISTRATION_STORAGE_KEY);
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      if (process.env.NODE_ENV === 'development') {
        console.log('[PERSISTENCE] Datos expirados eliminados');
      }
    }
  } catch (error) {
    console.error('[PERSISTENCE] Error limpiando datos expirados:', error);
  }
}

// Función para detectar recarga de página
function isPageReload(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return navigationEntries.length > 0 && navigationEntries[0].type === 'reload';
  } catch (error) {
    try {
      const reloadFlag = sessionStorage.getItem('page_reload_detected');
      if (!reloadFlag) {
        sessionStorage.setItem('page_reload_detected', 'true');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

// Función para cifrar datos sensibles
function encryptData(data: string, key: string): string {
  try {
    // En una implementación real, usaríamos una biblioteca de cifrado como crypto-js
    // Por ahora, usamos una implementación simple de ofuscación
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(key);
    
    // XOR simple con la clave
    const encrypted = new Uint8Array(dataBuffer.length);
    for (let i = 0; i < dataBuffer.length; i++) {
      encrypted[i] = dataBuffer[i] ^ keyBuffer[i % keyBuffer.length];
    }
    
    // Convertir a base64 para almacenamiento
    return btoa(String.fromCharCode(...encrypted));
  } catch (error) {
    console.error('[PERSISTENCE] Error cifrando datos:', error);
    return data; // Devolver datos sin cifrar en caso de error
  }
}

// Función para descifrar datos sensibles
function decryptData(encryptedData: string, key: string): string {
  try {
    // Decodificar desde base64
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const keyBuffer = new TextEncoder().encode(key);
    
    // XOR simple con la clave
    const decrypted = new Uint8Array(encryptedBuffer.length);
    for (let i = 0; i < encryptedBuffer.length; i++) {
      decrypted[i] = encryptedBuffer[i] ^ keyBuffer[i % keyBuffer.length];
    }
    
    // Convertir a string
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('[PERSISTENCE] Error descifrando datos:', error);
    return encryptedData; // Devolver datos sin descifrar en caso de error
  }
}

// Campos sensibles que deben cifrarse
const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'phone',
  'email',
  'licenseNumber'
  // Excluimos identityVerification por ser un objeto complejo
];

// Generar clave de cifrado basada en el ID del usuario o timestamp
function generateEncryptionKey(): string {
  // En una implementación real, esto sería más seguro
  return 'red-salud-encryption-key-' + new Date().toISOString().slice(0, 10);
}

export function useRegistrationPersistence(): UseRegistrationPersistenceReturn {
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const encryptionKey = generateEncryptionKey();

  // ============================================================================
  // FUNCIONES PRINCIPALES - Declaradas primero para evitar errores de referencia
  // ============================================================================

  // Cifrar campos sensibles
  const encryptSensitiveFields = useCallback((data: DoctorRegistrationData): any => {
    const encryptedData: any = { ...data };
    
    SENSITIVE_FIELDS.forEach(field => {
      if (field in encryptedData && encryptedData[field]) {
        const value = encryptedData[field];
        if (typeof value === 'string') {
          encryptedData[field] = encryptData(value, encryptionKey);
        }
      }
    });
    
    return encryptedData;
  }, [encryptionKey]);

  // Descifrar campos sensibles
  const decryptSensitiveFields = useCallback((data: any): DoctorRegistrationData => {
    const decryptedData: any = { ...data };
    
    SENSITIVE_FIELDS.forEach(field => {
      if (field in decryptedData && decryptedData[field]) {
        const value = decryptedData[field];
        if (typeof value === 'string') {
          decryptedData[field] = decryptData(value, encryptionKey);
        }
      }
    });
    
    return decryptedData as DoctorRegistrationData;
  }, [encryptionKey]);

  // Limpiar progreso guardado - DECLARADA ANTES DE CUALQUIER useEffect
  const clearProgress = useCallback((): void => {
    try {
      // Validación de seguridad: verificar que estamos en el cliente
      if (typeof window === 'undefined') {
        console.warn('[PERSISTENCE] clearProgress llamado en el servidor, ignorando');
        return;
      }
      
      localStorage.removeItem(REGISTRATION_STORAGE_KEY);
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      setHasSavedProgress(false);
      
      if (REGISTRATION_PERSISTENCE_CONFIG.environment.verboseLogging) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PERSISTENCE] Progreso de registro eliminado');
        }
      }
    } catch (error) {
      console.error('[PERSISTENCE] Error eliminando progreso:', error);
    }
  }, []);

  // Guardar progreso en localStorage
  const saveProgress = useCallback((
    data: DoctorRegistrationData, 
    progress: RegistrationProgress
  ): void => {
    try {
      // Validación de seguridad: verificar que estamos en el cliente
      if (typeof window === 'undefined') {
        console.warn('[PERSISTENCE] saveProgress llamado en el servidor, ignorando');
        return;
      }
      
      // Validación de datos de entrada
      if (!data || !progress) {
        console.warn('[PERSISTENCE] Datos o progreso inválidos para guardar');
        return;
      }
      
      // Cifrar campos sensibles
      const encryptedData = encryptSensitiveFields(data);
      
      // Agregar timestamp de actualización
      const dataWithTimestamp = {
        ...encryptedData,
        updatedAt: new Date().toISOString()
      };
      
      // Guardar datos del registro
      localStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(dataWithTimestamp));
      
      // Guardar progreso del registro
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      
      // Guardar timestamp de sesión para control de expiración
      localStorage.setItem(SESSION_TIMESTAMP_KEY, new Date().toISOString());
      
      setHasSavedProgress(true);
      
      // Logging reducido para evitar spam en consola
      if (REGISTRATION_PERSISTENCE_CONFIG.environment.verboseLogging && 
          process.env.NODE_ENV === 'development') {
        console.log('[PERSISTENCE] Progreso de registro guardado');
      }
    } catch (error) {
      console.error('[PERSISTENCE] Error guardando progreso:', error);
    }
  }, [encryptSensitiveFields]);

  // Cargar progreso desde localStorage
  const loadProgress = useCallback((): { 
    data: DoctorRegistrationData | null; 
    progress: RegistrationProgress | null 
  } => {
    try {
      if (typeof window === 'undefined') {
        return { data: null, progress: null };
      }
      // Limpiar datos expirados antes de cargar
      clearExpiredData();
      
      // Verificar si es una recarga de página y limpiar si está configurado
      if (PAGE_RELOAD_CLEAR && isPageReload()) {
        if (REGISTRATION_PERSISTENCE_CONFIG.environment.verboseLogging) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[PERSISTENCE] Recarga de página detectada, limpiando datos');
          }
        }
        clearProgress();
        return { data: null, progress: null };
      }
      
      const savedData = localStorage.getItem(REGISTRATION_STORAGE_KEY);
      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      
      if (!savedData || !savedProgress) {
        return { data: null, progress: null };
      }
      
      const data = JSON.parse(savedData);
      const progress = JSON.parse(savedProgress) as RegistrationProgress;
      
      // Descifrar campos sensibles
      const decryptedData = decryptSensitiveFields(data);
      
      if (REGISTRATION_PERSISTENCE_CONFIG.environment.verboseLogging) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PERSISTENCE] Progreso de registro cargado');
        }
      }
      
      return { data: decryptedData, progress };
    } catch (error) {
      console.error('[PERSISTENCE] Error cargando progreso:', error);
      return { data: null, progress: null };
    }
  }, [decryptSensitiveFields, clearProgress]);

  // ============================================================================
  // EFECTOS - Declarados después de todas las funciones para evitar errores de referencia
  // ============================================================================

  // Verificar si hay progreso guardado al cargar
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(REGISTRATION_STORAGE_KEY);
        const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
        setHasSavedProgress(!!(savedData && savedProgress));
      }
      setIsInitialized(true);
      
      if (REGISTRATION_PERSISTENCE_CONFIG.environment.verboseLogging) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PERSISTENCE] Hook inicializado correctamente');
        }
      }
    } catch (error) {
      console.error('[PERSISTENCE] Error inicializando hook:', error);
      setIsInitialized(true); // Marcar como inicializado incluso si hay error
    }
  }, []);

  // Detectar navegación fuera del registro y limpiar datos si está configurado
  useEffect(() => {
    if (!NAVIGATION_CLEAR && !TAB_CHANGE_CLEAR && !PAGE_UNLOAD_CLEAR) return;
    
    const handleBeforeUnload = () => {
      if (PAGE_UNLOAD_CLEAR) {
        if (REGISTRATION_PERSISTENCE_CONFIG.environment.verboseLogging) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[PERSISTENCE] Página se está cerrando, limpiando datos');
          }
        }
        clearProgress();
      }
    };
    
    const handleVisibilityChange = () => {
      if (TAB_CHANGE_CLEAR && document.hidden) {
        if (REGISTRATION_PERSISTENCE_CONFIG.environment.verboseLogging) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[PERSISTENCE] Pestaña oculta, limpiando datos');
          }
        }
        clearProgress();
      }
    };
    
    if (PAGE_UNLOAD_CLEAR) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    if (TAB_CHANGE_CLEAR) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      if (PAGE_UNLOAD_CLEAR) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      if (TAB_CHANGE_CLEAR) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [clearProgress]);

  // ============================================================================
  // RETORNO DEL HOOK - Todas las funciones ya están declaradas
  // ============================================================================

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasSavedProgress,
    isInitialized
  };
}