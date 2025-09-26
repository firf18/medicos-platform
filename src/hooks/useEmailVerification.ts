/**
 * Email Verification Hook
 * @fileoverview Hook para manejar la verificación de email con código
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { emailVerificationTracker } from '@/lib/email-verification/verification-tracker';

interface EmailVerificationState {
  isVerifying: boolean;
  isVerified: boolean;
  verificationCode: string;
  error: string | null;
  isSendingCode: boolean;
  codeSent: boolean;
  retryAfter: number | null;
  attemptCount: number;
  lastAttemptTime: number | null;
}

interface UseEmailVerificationProps {
  email: string;
  onVerificationComplete?: () => void;
  onVerificationError?: (error: string) => void;
}

export const useEmailVerification = ({ 
  email, 
  onVerificationComplete, 
  onVerificationError 
}: UseEmailVerificationProps) => {
  // Inicializar tracker de verificación
  React.useEffect(() => {
    if (email) {
      emailVerificationTracker.startVerification(email);
    }
  }, [email]);
  const [state, setState] = useState<EmailVerificationState>({
    isVerifying: false,
    isVerified: false,
    verificationCode: '',
    error: null,
    isSendingCode: false,
    codeSent: false,
    retryAfter: null,
    attemptCount: 0,
    lastAttemptTime: null
  });

  const supabase = createClient();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Client-side rate limiting configuration
  const RATE_LIMIT_CONFIG = {
    MAX_ATTEMPTS_PER_MINUTE: 1, // Reduce to 1 attempt per minute for testing
    MAX_ATTEMPTS_PER_HOUR: 5,   // Reduce to 5 attempts per hour for testing
    COOLDOWN_BASE_SECONDS: 60,  // Match Supabase's default 60 seconds
    COOLDOWN_MULTIPLIER: 1,     // No progressive cooldown for testing
    MAX_COOLDOWN_SECONDS: 60    // Maximum 60 seconds
  };

  // Calculate cooldown time based on attempt count
  const calculateCooldownTime = (attemptCount: number): number => {
    const baseCooldown = RATE_LIMIT_CONFIG.COOLDOWN_BASE_SECONDS;
    const multiplier = Math.pow(RATE_LIMIT_CONFIG.COOLDOWN_MULTIPLIER, Math.max(0, attemptCount - 1));
    const calculatedCooldown = baseCooldown * multiplier;
    return Math.min(calculatedCooldown, RATE_LIMIT_CONFIG.MAX_COOLDOWN_SECONDS);
  };

  // Check if we should allow sending based on client-side rate limiting
  const canSendCode = useCallback((): { canSend: boolean; reason?: string } => {
    const now = Date.now();
    const { attemptCount, lastAttemptTime } = state;

    // If we have a retry after time set, check if it's passed
    if (state.retryAfter && state.retryAfter > now) {
      const remainingTime = Math.ceil((state.retryAfter - now) / 1000);
      return { 
        canSend: false, 
        reason: `Espera ${remainingTime} segundos antes de intentar nuevamente.` 
      };
    }

    // Check attempt limits
    if (attemptCount >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_HOUR) {
      return { 
        canSend: false, 
        reason: 'Has excedido el límite de intentos por hora. Intenta más tarde.' 
      };
    }

    // If we have a last attempt time, check if we're within the minute limit
    if (lastAttemptTime) {
      const timeSinceLastAttempt = now - lastAttemptTime;
      const oneMinute = 60 * 1000;
      
      if (timeSinceLastAttempt < oneMinute && attemptCount >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_MINUTE) {
        const remainingTime = Math.ceil((oneMinute - timeSinceLastAttempt) / 1000);
        return { 
          canSend: false, 
          reason: `Demasiados intentos recientes. Espera ${remainingTime} segundos.` 
        };
      }
    }

    return { canSend: true };
  }, [state]);

  const sendVerificationCode = useCallback(async () => {
    if (!email) {
      setState(prev => ({ ...prev, error: 'Email es requerido' }));
      return;
    }

    // Check client-side rate limiting first
    const rateLimitCheck = canSendCode();
    if (!rateLimitCheck.canSend) {
      setState(prev => ({ ...prev, error: rateLimitCheck.reason || 'Rate limit exceeded' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isSendingCode: true, 
      error: null,
      attemptCount: prev.attemptCount + 1,
      lastAttemptTime: Date.now()
    }));

    try {
      // Usar Supabase Auth nativo para enviar código de verificación
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar rate limit específicamente
        if (response.status === 429 || data.rateLimited) {
          const cooldownSeconds = data.waitTime || 30;
          const retryAfter = data.retryAfter || (Date.now() + (cooldownSeconds * 1000));
          
          setState(prev => ({ 
            ...prev, 
            retryAfter,
            error: data.error || `Demasiados intentos. Espera ${cooldownSeconds} segundos antes de intentar nuevamente.`,
            isSendingCode: false
          }));
          
          // Set up automatic retry countdown
          if (retryTimeoutRef.current) {
            clearInterval(retryTimeoutRef.current);
          }
          
          retryTimeoutRef.current = setInterval(() => {
            setState(prev => {
              if (prev.retryAfter && prev.retryAfter <= Date.now()) {
                clearInterval(retryTimeoutRef.current!);
                retryTimeoutRef.current = null;
                return { ...prev, retryAfter: null, error: null };
              }
              return prev;
            });
          }, 1000);
          
          // Don't call onVerificationError for rate limiting - it's handled by the UI
          return;
        }
        
        // For other errors, call the error handler
        const errorMessage = data.error || 'Error enviando código de verificación';
        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isSendingCode: false 
        }));
        onVerificationError?.(errorMessage);
        return;
      }

      setState(prev => ({ 
        ...prev, 
        codeSent: true,
        isSendingCode: false,
        error: null,
        retryAfter: null,
        attemptCount: 0,
        lastAttemptTime: null
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error enviando código';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isSendingCode: false 
      }));
      onVerificationError?.(errorMessage);
    }
  }, [email, onVerificationError, canSendCode, state.attemptCount]);

  const verifyCode = useCallback(async (verificationCode?: string) => {
    if (!email) {
      setState(prev => ({ ...prev, error: 'Email es requerido' }));
      return;
    }

    const code = verificationCode || state.verificationCode;
    if (!code) {
      setState(prev => ({ ...prev, error: 'Código de verificación es requerido' }));
      return;
    }

    // Registrar intento de verificación en el tracker
    emailVerificationTracker.recordVerificationAttempt(email, code);

    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      // Verificar el código OTP
      const response = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          code: code
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error verificando código');
      }

      // SOLO marcar como verificado en el tracker después de verificación exitosa
      emailVerificationTracker.markAsVerified(email, 'code');

      setState(prev => ({ 
        ...prev, 
        isVerified: true,
        isVerifying: false,
        error: null
      }));
      
      console.log('🎉 Hook: Verificación completada, llamando onVerificationComplete');
      console.log('🔍 Hook: onVerificationComplete es:', typeof onVerificationComplete);
      if (onVerificationComplete) {
        console.log('🔍 Hook: Ejecutando callback...');
        onVerificationComplete();
        console.log('✅ Hook: Callback ejecutado');
      } else {
        console.log('❌ Hook: onVerificationComplete es undefined');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error verificando código';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isVerifying: false 
      }));
      onVerificationError?.(errorMessage);
    }
  }, [email, state.verificationCode, onVerificationComplete, onVerificationError]);

  const resetVerification = useCallback(() => {
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearInterval(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setState({
      isVerifying: false,
      isVerified: false,
      verificationCode: '',
      error: null,
      isSendingCode: false,
      codeSent: false,
      retryAfter: null,
      attemptCount: 0,
      lastAttemptTime: null
    });
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearInterval(retryTimeoutRef.current);
      }
    };
  }, []);

  const updateVerificationCode = useCallback((code: string) => {
    setState(prev => ({ ...prev, verificationCode: code }));
  }, []);

  return {
    ...state,
    sendVerificationCode,
    verifyCode,
    resetVerification,
    updateVerificationCode
  };
};
