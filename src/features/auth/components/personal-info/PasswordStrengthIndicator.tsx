/**
 * Componente Indicador de Fortaleza de Contraseña
 * 
 * Muestra visualmente la fortaleza de la contraseña
 * con barra de progreso y mensajes informativos.
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface PasswordStrength {
  score: number; // 0-4
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

interface PasswordStrengthIndicatorProps {
  passwordStrength: PasswordStrength;
  password: string;
  fieldTouched: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  passwordStrength, 
  password, 
  fieldTouched 
}) => {
  // No mostrar nada si no se ha tocado el campo o no hay contraseña
  if (!fieldTouched || !password) {
    return null;
  }

  const getStrengthLabel = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'Muy débil';
      case 2:
        return 'Débil';
      case 3:
        return 'Buena';
      case 4:
        return 'Excelente';
      default:
        return 'Desconocida';
    }
  };

  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'text-red-600';
      case 2:
        return 'text-yellow-600';
      case 3:
        return 'text-blue-600';
      case 4:
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIcon = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 2:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 3:
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 4:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const progressPercentage = (passwordStrength.score / 4) * 100;

  return (
    <div className="space-y-3">
      {/* Título */}
      <div className="flex items-center space-x-2">
        <Shield className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          Fortaleza de la contraseña
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon(passwordStrength.score)}
            <span className={`text-sm font-medium ${getStrengthColor(passwordStrength.score)}`}>
              {getStrengthLabel(passwordStrength.score)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {passwordStrength.score}/4
          </span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2"
        />
      </div>

      {/* Errores de validación */}
      {passwordStrength.errors.length > 0 && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <ul className="list-disc list-inside space-y-1">
              {passwordStrength.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Contraseña válida */}
      {passwordStrength.isValid && (
        <Alert className="border-green-200 bg-green-50 py-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            ¡Contraseña segura! Cumple con todos los requisitos de seguridad.
          </AlertDescription>
        </Alert>
      )}

      {/* Criterios de validación visual */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-700">Requisitos:</p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className={`flex items-center space-x-2 ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
            {password.length >= 6 ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span>Al menos 6 caracteres</span>
          </div>
          
          <div className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            {/[A-Z]/.test(password) ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span>Una letra mayúscula</span>
          </div>
          
          <div className={`flex items-center space-x-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            {/[a-z]/.test(password) ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span>Una letra minúscula</span>
          </div>
          
          <div className={`flex items-center space-x-2 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            {/\d/.test(password) ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span>Un número</span>
          </div>
        </div>
      </div>
    </div>
  );
};