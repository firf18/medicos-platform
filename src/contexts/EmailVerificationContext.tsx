'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EmailVerificationContextType {
  isEmailVerified: boolean;
  setIsEmailVerified: (verified: boolean) => void;
  verifiedEmail: string | null;
  setVerifiedEmail: (email: string | null) => void;
  isPhoneVerified: boolean;
  setIsPhoneVerified: (verified: boolean) => void;
  verifiedPhone: string | null;
  setVerifiedPhone: (phone: string | null) => void;
  clearVerificationState: () => void;
}

const EmailVerificationContext = createContext<EmailVerificationContextType | undefined>(undefined);

export const useEmailVerification = () => {
  const context = useContext(EmailVerificationContext);
  if (context === undefined) {
    throw new Error('useEmailVerification must be used within an EmailVerificationProvider');
  }
  return context;
};

interface EmailVerificationProviderProps {
  children: ReactNode;
}

const VERIFICATION_STORAGE_KEY = 'doctor-registration-verification';

export const EmailVerificationProvider: React.FC<EmailVerificationProviderProps> = ({ children }) => {
  // Cargar estado inicial desde localStorage
  const [isEmailVerified, setIsEmailVerified] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.isEmailVerified || false;
      }
    } catch (error) {
      console.error('Error loading email verification state:', error);
    }
    return false;
  });

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.verifiedEmail || null;
      }
    } catch (error) {
      console.error('Error loading verified email:', error);
    }
    return null;
  });

  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.isPhoneVerified || false;
      }
    } catch (error) {
      console.error('Error loading phone verification state:', error);
    }
    return false;
  });

  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.verifiedPhone || null;
      }
    } catch (error) {
      console.error('Error loading verified phone:', error);
    }
    return null;
  });

  // Persistir cambios en localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('🔧 Contexto: Estado de verificación actualizado:', {
      isEmailVerified,
      verifiedEmail,
      isPhoneVerified,
      verifiedPhone
    });
    
    try {
      const verificationData = {
        isEmailVerified,
        verifiedEmail,
        isPhoneVerified,
        verifiedPhone,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verificationData));
    } catch (error) {
      console.error('Error saving verification state:', error);
    }
  }, [isEmailVerified, verifiedEmail, isPhoneVerified, verifiedPhone]);

  // Función para limpiar el estado de verificación
  const clearVerificationState = () => {
    setIsEmailVerified(false);
    setVerifiedEmail(null);
    setIsPhoneVerified(false);
    setVerifiedPhone(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(VERIFICATION_STORAGE_KEY);
    }
  };

  const value = {
    isEmailVerified,
    setIsEmailVerified,
    verifiedEmail,
    setVerifiedEmail,
    isPhoneVerified,
    setIsPhoneVerified,
    verifiedPhone,
    setVerifiedPhone,
    clearVerificationState,
  };

  return (
    <EmailVerificationContext.Provider value={value}>
      {children}
    </EmailVerificationContext.Provider>
  );
};
