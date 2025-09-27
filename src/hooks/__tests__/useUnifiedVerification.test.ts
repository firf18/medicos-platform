/**
 * Tests para useUnifiedVerification Hook
 * 
 * @fileoverview Tests unitarios para el hook unificado de verificaciones
 * @compliance HIPAA-compliant testing without PHI data
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUnifiedVerification } from '@/hooks/useUnifiedVerification';

// Mock de los trackers
vi.mock('@/lib/email-verification/verification-tracker', () => ({
  emailVerificationTracker: {
    isEmailVerified: vi.fn(),
    startVerification: vi.fn(),
    markAsVerified: vi.fn(),
    clearVerification: vi.fn()
  }
}));

vi.mock('@/lib/phone-verification/phone-verification-tracker', () => ({
  phoneVerificationTracker: {
    isPhoneVerified: vi.fn(),
    startVerification: vi.fn(),
    markAsVerified: vi.fn(),
    clearVerification: vi.fn()
  }
}));

describe('useUnifiedVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Inicialización', () => {
    it('should initialize with default state when no initial values provided', () => {
      const { result } = renderHook(() => useUnifiedVerification());

      expect(result.current.verificationState).toEqual({
        isEmailVerified: false,
        verifiedEmail: null,
        isPhoneVerified: false,
        verifiedPhone: null
      });
    });

    it('should initialize with provided initial values', () => {
      const { result } = renderHook(() => 
        useUnifiedVerification({
          initialEmail: 'test@example.com',
          initialPhone: '+584121234567'
        })
      );

      expect(result.current.verificationState.verifiedEmail).toBe('test@example.com');
      expect(result.current.verificationState.verifiedPhone).toBe('+584121234567');
    });

    it('should call onVerificationChange when state changes', () => {
      const onVerificationChange = vi.fn();
      
      renderHook(() => 
        useUnifiedVerification({
          onVerificationChange
        })
      );

      expect(onVerificationChange).toHaveBeenCalledWith({
        isEmailVerified: false,
        verifiedEmail: null,
        isPhoneVerified: false,
        verifiedPhone: null
      });
    });
  });

  describe('Acciones de verificación', () => {
    it('should set email as verified', () => {
      const { result } = renderHook(() => useUnifiedVerification());

      act(() => {
        result.current.actions.setEmailVerified('test@example.com');
      });

      expect(result.current.verificationState.isEmailVerified).toBe(true);
      expect(result.current.verificationState.verifiedEmail).toBe('test@example.com');
    });

    it('should set phone as verified', () => {
      const { result } = renderHook(() => useUnifiedVerification());

      act(() => {
        result.current.actions.setPhoneVerified('+584121234567');
      });

      expect(result.current.verificationState.isPhoneVerified).toBe(true);
      expect(result.current.verificationState.verifiedPhone).toBe('+584121234567');
    });

    it('should clear email verification', () => {
      const { result } = renderHook(() => 
        useUnifiedVerification({
          initialEmail: 'test@example.com'
        })
      );

      act(() => {
        result.current.actions.clearEmailVerification();
      });

      expect(result.current.verificationState.isEmailVerified).toBe(false);
      expect(result.current.verificationState.verifiedEmail).toBe(null);
    });

    it('should clear phone verification', () => {
      const { result } = renderHook(() => 
        useUnifiedVerification({
          initialPhone: '+584121234567'
        })
      );

      act(() => {
        result.current.actions.clearPhoneVerification();
      });

      expect(result.current.verificationState.isPhoneVerified).toBe(false);
      expect(result.current.verificationState.verifiedPhone).toBe(null);
    });

    it('should clear all verifications', () => {
      const { result } = renderHook(() => 
        useUnifiedVerification({
          initialEmail: 'test@example.com',
          initialPhone: '+584121234567'
        })
      );

      act(() => {
        result.current.actions.clearAllVerifications();
      });

      expect(result.current.verificationState.isEmailVerified).toBe(false);
      expect(result.current.verificationState.verifiedEmail).toBe(null);
      expect(result.current.verificationState.isPhoneVerified).toBe(false);
      expect(result.current.verificationState.verifiedPhone).toBe(null);
    });
  });

  describe('Utilidades', () => {
    it('should check if specific email is verified', () => {
      const { result } = renderHook(() => 
        useUnifiedVerification({
          initialEmail: 'test@example.com'
        })
      );

      // Simular que el email está verificado
      act(() => {
        result.current.actions.setEmailVerified('test@example.com');
      });

      expect(result.current.isEmailVerified('test@example.com')).toBe(true);
      expect(result.current.isEmailVerified('other@example.com')).toBe(false);
    });

    it('should check if specific phone is verified', () => {
      const { result } = renderHook(() => 
        useUnifiedVerification({
          initialPhone: '+584121234567'
        })
      );

      // Simular que el teléfono está verificado
      act(() => {
        result.current.actions.setPhoneVerified('+584121234567');
      });

      expect(result.current.isPhoneVerified('+584121234567')).toBe(true);
      expect(result.current.isPhoneVerified('+584129876543')).toBe(false);
    });

    it('should get complete verification status', () => {
      const { result } = renderHook(() => 
        useUnifiedVerification({
          initialEmail: 'test@example.com',
          initialPhone: '+584121234567'
        })
      );

      act(() => {
        result.current.actions.setEmailVerified('test@example.com');
        result.current.actions.setPhoneVerified('+584121234567');
      });

      const status = result.current.getVerificationStatus();

      expect(status).toEqual({
        email: {
          verified: true,
          email: 'test@example.com'
        },
        phone: {
          verified: true,
          phone: '+584121234567'
        }
      });
    });
  });

  describe('Sincronización con trackers', () => {
    it('should have refreshVerificationState function available', () => {
      const { result } = renderHook(() => 
        useUnifiedVerification({
          initialEmail: 'test@example.com',
          initialPhone: '+584121234567'
        })
      );

      // Verificar que la función existe
      expect(typeof result.current.actions.refreshVerificationState).toBe('function');
    });
  });

  describe('Callbacks de cambio', () => {
    it('should call onVerificationChange when verification state changes', () => {
      const onVerificationChange = vi.fn();
      const { result } = renderHook(() => 
        useUnifiedVerification({
          onVerificationChange
        })
      );

      act(() => {
        result.current.actions.setEmailVerified('test@example.com');
      });

      expect(onVerificationChange).toHaveBeenCalledWith({
        isEmailVerified: true,
        verifiedEmail: 'test@example.com',
        isPhoneVerified: false,
        verifiedPhone: null
      });
    });
  });
});
