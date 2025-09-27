/**
 * useUnifiedVerification Hook - Red-Salud Platform
 * 
 * Hook unificado para manejar el estado de verificación de email y teléfono.
 * Combina trackers y contexto en una sola fuente de verdad.
 * 
 * @compliance HIPAA-compliant verification state management
 * @version 1.0.0
 * @created 2024-01-15
 */

import { useState, useCallback, useEffect } from 'react';
import { emailVerificationTracker } from '@/lib/email-verification/verification-tracker';
import { phoneVerificationTracker } from '@/lib/phone-verification/phone-verification-tracker';

// Tipos para el hook
export interface VerificationState {
  isEmailVerified: boolean;
  verifiedEmail: string | null;
  isPhoneVerified: boolean;
  verifiedPhone: string | null;
}

export interface VerificationActions {
  setEmailVerified: (email: string) => void;
  setPhoneVerified: (phone: string) => void;
  clearEmailVerification: () => void;
  clearPhoneVerification: () => void;
  clearAllVerifications: () => void;
  refreshVerificationState: () => void;
}

export interface UseUnifiedVerificationProps {
  initialEmail?: string | null;
  initialPhone?: string | null;
  onVerificationChange?: (state: VerificationState) => void;
}

export interface UseUnifiedVerificationReturn {
  // Estado actual de verificación
  verificationState: VerificationState;
  
  // Acciones para modificar el estado
  actions: VerificationActions;
  
  // Utilidades
  isEmailVerified: (email: string) => boolean;
  isPhoneVerified: (phone: string) => boolean;
  getVerificationStatus: () => {
    email: { verified: boolean; email: string | null };
    phone: { verified: boolean; phone: string | null };
  };
}

/**
 * Hook unificado para manejo de verificaciones
 */
export const useUnifiedVerification = ({
  initialEmail = null,
  initialPhone = null,
  onVerificationChange
}: UseUnifiedVerificationProps = {}): UseUnifiedVerificationReturn => {

  // ============================================================================
  // ESTADO UNIFICADO DE VERIFICACIÓN
  // ============================================================================

  const [verificationState, setVerificationState] = useState<VerificationState>(() => {
    // Inicializar estado con valores iniciales proporcionados
    // Los trackers se sincronizarán después
    return {
      isEmailVerified: false,
      verifiedEmail: initialEmail,
      isPhoneVerified: false,
      verifiedPhone: initialPhone
    };
  });

  // ============================================================================
  // ACCIONES PARA MODIFICAR EL ESTADO
  // ============================================================================

  /**
   * Marcar email como verificado
   */
  const setEmailVerified = useCallback((email: string) => {
    // Actualizar tracker
    emailVerificationTracker.startVerification(email);
    emailVerificationTracker.markAsVerified(email, 'manual');
    
    // Actualizar estado unificado
    setVerificationState(prev => ({
      ...prev,
      isEmailVerified: true,
      verifiedEmail: email
    }));
  }, []);

  /**
   * Marcar teléfono como verificado
   */
  const setPhoneVerified = useCallback((phone: string) => {
    // Actualizar tracker
    phoneVerificationTracker.startVerification(phone);
    phoneVerificationTracker.markAsVerified(phone, 'manual');
    
    // Actualizar estado unificado
    setVerificationState(prev => ({
      ...prev,
      isPhoneVerified: true,
      verifiedPhone: phone
    }));
  }, []);

  /**
   * Limpiar verificación de email
   */
  const clearEmailVerification = useCallback(() => {
    if (verificationState.verifiedEmail) {
      emailVerificationTracker.clearVerification(verificationState.verifiedEmail);
    }
    
    setVerificationState(prev => ({
      ...prev,
      isEmailVerified: false,
      verifiedEmail: null
    }));
  }, [verificationState.verifiedEmail]);

  /**
   * Limpiar verificación de teléfono
   */
  const clearPhoneVerification = useCallback(() => {
    if (verificationState.verifiedPhone) {
      phoneVerificationTracker.clearVerification(verificationState.verifiedPhone);
    }
    
    setVerificationState(prev => ({
      ...prev,
      isPhoneVerified: false,
      verifiedPhone: null
    }));
  }, [verificationState.verifiedPhone]);

  /**
   * Limpiar todas las verificaciones
   */
  const clearAllVerifications = useCallback(() => {
    clearEmailVerification();
    clearPhoneVerification();
  }, [clearEmailVerification, clearPhoneVerification]);

  /**
   * Refrescar estado de verificación desde trackers
   */
  const refreshVerificationState = useCallback(() => {
    const emailVerified = verificationState.verifiedEmail ? 
      emailVerificationTracker.isEmailVerified(verificationState.verifiedEmail) : false;
    
    const phoneVerified = verificationState.verifiedPhone ? 
      phoneVerificationTracker.isPhoneVerified(verificationState.verifiedPhone) : false;

    setVerificationState(prev => ({
      ...prev,
      isEmailVerified: emailVerified,
      isPhoneVerified: phoneVerified
    }));
  }, [verificationState.verifiedEmail, verificationState.verifiedPhone]);

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Verificar si un email específico está verificado
   */
  const isEmailVerified = useCallback((email: string): boolean => {
    return emailVerificationTracker.isEmailVerified(email) || 
           (verificationState.isEmailVerified && verificationState.verifiedEmail === email);
  }, [verificationState.isEmailVerified, verificationState.verifiedEmail]);

  /**
   * Verificar si un teléfono específico está verificado
   */
  const isPhoneVerified = useCallback((phone: string): boolean => {
    return phoneVerificationTracker.isPhoneVerified(phone) || 
           (verificationState.isPhoneVerified && verificationState.verifiedPhone === phone);
  }, [verificationState.isPhoneVerified, verificationState.verifiedPhone]);

  /**
   * Obtener estado completo de verificación
   */
  const getVerificationStatus = useCallback(() => {
    return {
      email: {
        verified: verificationState.isEmailVerified,
        email: verificationState.verifiedEmail
      },
      phone: {
        verified: verificationState.isPhoneVerified,
        phone: verificationState.verifiedPhone
      }
    };
  }, [verificationState]);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  /**
   * Notificar cambios en el estado de verificación
   */
  useEffect(() => {
    if (onVerificationChange) {
      onVerificationChange(verificationState);
    }
  }, [verificationState, onVerificationChange]);

  /**
   * Sincronizar con trackers al cambiar email/teléfono inicial
   */
  useEffect(() => {
    if (initialEmail && initialEmail !== verificationState.verifiedEmail) {
      const isVerified = emailVerificationTracker.isEmailVerified(initialEmail);
      if (isVerified) {
        setVerificationState(prev => ({
          ...prev,
          isEmailVerified: true,
          verifiedEmail: initialEmail
        }));
      }
    }
  }, [initialEmail, verificationState.verifiedEmail]);

  useEffect(() => {
    if (initialPhone && initialPhone !== verificationState.verifiedPhone) {
      const isVerified = phoneVerificationTracker.isPhoneVerified(initialPhone);
      if (isVerified) {
        setVerificationState(prev => ({
          ...prev,
          isPhoneVerified: true,
          verifiedPhone: initialPhone
        }));
      }
    }
  }, [initialPhone, verificationState.verifiedPhone]);

  // ============================================================================
  // RETORNO DEL HOOK
  // ============================================================================

  const actions: VerificationActions = {
    setEmailVerified,
    setPhoneVerified,
    clearEmailVerification,
    clearPhoneVerification,
    clearAllVerifications,
    refreshVerificationState
  };

  return {
    verificationState,
    actions,
    isEmailVerified,
    isPhoneVerified,
    getVerificationStatus
  };
};

export default useUnifiedVerification;
