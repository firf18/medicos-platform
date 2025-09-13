'use client';

import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthErrorMessageProps {
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function AuthErrorMessage({ 
  message, 
  type, 
  title,
  onRetry,
  onDismiss
}: AuthErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'success':
        return '¡Éxito!';
      case 'warning':
        return 'Advertencia';
      case 'info':
        return 'Información';
      default:
        return 'Error';
    }
  };

  const getMessage = () => {
    // Mapeo de mensajes de error comunes
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Credenciales de inicio de sesión inválidas. Por favor, verifica tu email y contraseña.',
      'Email not confirmed': 'Tu correo electrónico no ha sido verificado. Por favor, verifica tu bandeja de entrada.',
      'User already registered': 'Ya existe una cuenta con este correo electrónico.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      'Unable to validate email address: invalid format': 'Formato de correo electrónico inválido.',
      'Invalid reset password token': 'El enlace de restablecimiento de contraseña no es válido o ha expirado.',
      'Auth session missing': 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    };

    return errorMessages[message] || message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-md p-4 ${getBackgroundColor()}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : type === 'warning' ? 'text-yellow-800' : type === 'info' ? 'text-blue-800' : 'text-red-800'}`}>
            {getTitle()}
          </h3>
          <div className={`mt-2 text-sm ${type === 'success' ? 'text-green-700' : type === 'warning' ? 'text-yellow-700' : type === 'info' ? 'text-blue-700' : 'text-red-700'}`}>
            <p>{getMessage()}</p>
          </div>
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex space-x-2">
              {onRetry && (
                <button
                  type="button"
                  className={`text-sm font-medium ${type === 'success' ? 'text-green-800 hover:text-green-900' : type === 'warning' ? 'text-yellow-800 hover:text-yellow-900' : type === 'info' ? 'text-blue-800 hover:text-blue-900' : 'text-red-800 hover:text-red-900'}`}
                  onClick={onRetry}
                >
                  Reintentar
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  className={`text-sm font-medium ${type === 'success' ? 'text-green-800 hover:text-green-900' : type === 'warning' ? 'text-yellow-800 hover:text-yellow-900' : type === 'info' ? 'text-blue-800 hover:text-blue-900' : 'text-red-800 hover:text-red-900'}`}
                  onClick={onDismiss}
                >
                  Cerrar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}