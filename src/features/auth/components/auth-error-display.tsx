'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AuthErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function AuthErrorDisplay({ error, onRetry, onDismiss }: AuthErrorDisplayProps) {
  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'Invalid login credentials':
        return 'Credenciales de inicio de sesión inválidas. Por favor, verifica tu email y contraseña.';
      case 'Email not confirmed':
        return 'Tu correo electrónico no ha sido verificado. Por favor, verifica tu bandeja de entrada.';
      case 'User already registered':
        return 'Ya existe una cuenta con este correo electrónico.';
      default:
        return error || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    }
  };

  return (
    <Alert variant="destructive">
      <AlertTitle>Error de autenticación</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{getErrorMessage(error)}</p>
        <div className="flex gap-2 mt-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          )}
          {onDismiss && (
            <Button variant="outline" size="sm" onClick={onDismiss}>
              Cerrar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}