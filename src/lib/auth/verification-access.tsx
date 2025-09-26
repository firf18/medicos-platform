/**
 * 🔐 LÓGICA DE ACCESO PARA USUARIOS VERIFICADOS Y EN REVISIÓN
 * 
 * Permite acceso tanto para usuarios verificados como en revisión
 * según los requerimientos del negocio
 */

'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Tipos para estados de verificación
export type VerificationStatus = 'verified' | 'in_review' | 'pending' | 'failed' | 'expired';

export interface VerificationAccess {
  canAccessDashboard: boolean;
  canAccessFullFeatures: boolean;
  canAccessLimitedFeatures: boolean;
  accessLevel: 'full' | 'limited' | 'none';
  message?: string;
}

export interface VerificationContextType {
  checkVerificationAccess: (status: VerificationStatus) => VerificationAccess;
  handleVerificationComplete: (status: VerificationStatus, results?: any) => void;
  getAccessMessage: (status: VerificationStatus) => string;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function useVerificationAccess() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerificationAccess must be used within a VerificationProvider');
  }
  return context;
}

// Función para determinar acceso basado en estado de verificación
export function getVerificationAccess(status: VerificationStatus): VerificationAccess {
  switch (status) {
    case 'verified':
      return {
        canAccessDashboard: true,
        canAccessFullFeatures: true,
        canAccessLimitedFeatures: true,
        accessLevel: 'full',
        message: 'Acceso completo - Verificación aprobada'
      };
    
    case 'in_review':
      return {
        canAccessDashboard: true,
        canAccessFullFeatures: false,
        canAccessLimitedFeatures: true,
        accessLevel: 'limited',
        message: 'Acceso limitado - Verificación en revisión'
      };
    
    case 'pending':
      return {
        canAccessDashboard: false,
        canAccessFullFeatures: false,
        canAccessLimitedFeatures: false,
        accessLevel: 'none',
        message: 'Sin acceso - Verificación pendiente'
      };
    
    case 'failed':
    case 'expired':
      return {
        canAccessDashboard: false,
        canAccessFullFeatures: false,
        canAccessLimitedFeatures: false,
        accessLevel: 'none',
        message: 'Sin acceso - Verificación fallida o expirada'
      };
    
    default:
      return {
        canAccessDashboard: false,
        canAccessFullFeatures: false,
        canAccessLimitedFeatures: false,
        accessLevel: 'none',
        message: 'Sin acceso - Estado de verificación desconocido'
      };
  }
}

// Función para obtener mensaje de acceso
export function getAccessMessage(status: VerificationStatus): string {
  switch (status) {
    case 'verified':
      return '¡Bienvenido! Tu verificación ha sido aprobada y tienes acceso completo a todas las funciones.';
    
    case 'in_review':
      return 'Tu verificación está siendo revisada. Tienes acceso limitado mientras se procesa tu solicitud.';
    
    case 'pending':
      return 'Tu verificación está pendiente. Completa el proceso para acceder a la plataforma.';
    
    case 'failed':
      return 'Tu verificación fue rechazada. Contacta a soporte para más información.';
    
    case 'expired':
      return 'Tu verificación ha expirado. Inicia una nueva verificación para continuar.';
    
    default:
      return 'Estado de verificación desconocido. Contacta a soporte.';
  }
}

// Hook para manejar verificación completada
export function useVerificationHandler() {
  const handleVerificationComplete = useCallback((status: VerificationStatus, results?: any) => {
    const access = getVerificationAccess(status);
    const message = getAccessMessage(status);
    
    // Mostrar toast según el resultado
    if (status === 'verified') {
      toast({
        title: 'Verificación Aprobada',
        description: message,
        variant: 'default'
      });
    } else if (status === 'in_review') {
      toast({
        title: 'Verificación en Revisión',
        description: message,
        variant: 'default'
      });
    } else if (status === 'failed') {
      toast({
        title: 'Verificación Rechazada',
        description: message,
        variant: 'destructive'
      });
    } else if (status === 'expired') {
      toast({
        title: 'Verificación Expirada',
        description: message,
        variant: 'destructive'
      });
    }
    
    // Log del resultado
    console.log('🔐 Verificación completada:', {
      status,
      access,
      results,
      timestamp: new Date().toISOString()
    });
    
    return access;
  }, []);
  
  return { handleVerificationComplete };
}

// Componente Provider para el contexto
interface VerificationProviderProps {
  children: ReactNode;
}

export function VerificationProvider({ children }: VerificationProviderProps) {
  const checkVerificationAccess = useCallback((status: VerificationStatus) => {
    return getVerificationAccess(status);
  }, []);
  
  const handleVerificationComplete = useCallback((status: VerificationStatus, results?: any) => {
    const access = getVerificationAccess(status);
    const message = getAccessMessage(status);
    
    // Mostrar toast según el resultado
    if (status === 'verified') {
      toast({
        title: 'Verificación Aprobada',
        description: message,
        variant: 'default'
      });
    } else if (status === 'in_review') {
      toast({
        title: 'Verificación en Revisión',
        description: message,
        variant: 'default'
      });
    } else if (status === 'failed') {
      toast({
        title: 'Verificación Rechazada',
        description: message,
        variant: 'destructive'
      });
    } else if (status === 'expired') {
      toast({
        title: 'Verificación Expirada',
        description: message,
        variant: 'destructive'
      });
    }
    
    return access;
  }, []);
  
  const getAccessMessage = useCallback((status: VerificationStatus) => {
    return getAccessMessage(status);
  }, []);
  
  const value: VerificationContextType = {
    checkVerificationAccess,
    handleVerificationComplete,
    getAccessMessage
  };
  
  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
}

// Hook para verificar acceso en componentes
export function useAccessControl(verificationStatus: VerificationStatus) {
  const access = getVerificationAccess(verificationStatus);
  const message = getAccessMessage(verificationStatus);
  
  return {
    ...access,
    message,
    isVerified: verificationStatus === 'verified',
    isInReview: verificationStatus === 'in_review',
    isPending: verificationStatus === 'pending',
    isFailed: verificationStatus === 'failed' || verificationStatus === 'expired'
  };
}

// Componente para mostrar estado de acceso
interface AccessStatusProps {
  verificationStatus: VerificationStatus;
  className?: string;
}

export function AccessStatus({ verificationStatus, className = '' }: AccessStatusProps) {
  const access = useAccessControl(verificationStatus);
  
  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'in_review':
        return 'text-orange-600 bg-orange-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return '✅';
      case 'in_review':
        return '⏳';
      case 'pending':
        return '⏸️';
      case 'failed':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '❓';
    }
  };
  
  return (
    <div className={`p-3 rounded-lg ${getStatusColor()} ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getStatusIcon()}</span>
        <div>
          <p className="font-medium">{access.message}</p>
          <p className="text-sm opacity-75">
            Nivel de acceso: {access.accessLevel === 'full' ? 'Completo' : 
                            access.accessLevel === 'limited' ? 'Limitado' : 'Sin acceso'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerificationProvider;
