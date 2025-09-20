// Componente para mostrar el indicador de fortaleza de contraseña
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle } from 'lucide-react';
import type { PasswordStrength } from './utils';

interface PasswordStrengthIndicatorProps {
  passwordStrength: PasswordStrength;
  password: string;
  fieldTouched: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  passwordStrength, 
  password, 
  fieldTouched 
}) => {
  // Mostrar solo si hay una contraseña o si el campo fue tocado
  if (!password && !fieldTouched) {
    return null;
  }

  // Obtener clases CSS para la barra de progreso
  const getProgressClassName = () => {
    if (passwordStrength.score >= 75) return '[&>div]:bg-green-500';
    if (passwordStrength.score >= 50) return '[&>div]:bg-yellow-500';
    if (passwordStrength.score > 0) return '[&>div]:bg-red-500';
    return '[&>div]:bg-gray-300';
  };

  // Obtener clases CSS para el texto de fortaleza
  const getStrengthTextClassName = () => {
    if (passwordStrength.score >= 75) return 'text-green-600';
    if (passwordStrength.score >= 50) return 'text-yellow-600';
    if (passwordStrength.score > 0) return 'text-red-600';
    return 'text-gray-500';
  };

  // Obtener texto de fortaleza
  const getStrengthText = () => {
    if (passwordStrength.score >= 75) return 'Fuerte';
    if (passwordStrength.score >= 50) return 'Media';
    if (passwordStrength.score > 0) return 'Débil';
    return 'Ingresa contraseña';
  };

  return (
    <div className="space-y-2">
      {/* Indicador de fortaleza */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">Fortaleza de contraseña</span>
        <span className={`font-medium ${getStrengthTextClassName()}`}>
          {getStrengthText()}
        </span>
      </div>
      <Progress 
        value={passwordStrength.score || 0} 
        className={`h-2 ${getProgressClassName()}`} 
      />
      
      {/* Debug info - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400">
          Score: {passwordStrength.score}, Valid: {passwordStrength.isValid ? 'Yes' : 'No'}
        </div>
      )}
      
      {/* Requisitos de contraseña */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium text-blue-800">Requisitos de contraseña profesional:</span>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              { check: password.length >= 6, text: 'Mínimo 6 caracteres' },
              { check: /[A-Z]/.test(password), text: 'Una letra mayúscula' },
              { check: /[a-z]/.test(password), text: 'Una letra minúscula' },
              { check: /\d/.test(password), text: 'Un número' }
            ].map((req, index) => (
              <div key={index} className={`flex items-center ${req.check ? 'text-green-600' : 'text-gray-500'}`}>
                {req.check ? (
                  <CheckCircle className="h-3 w-3 mr-2" />
                ) : (
                  <div className="w-3 h-3 mr-2 border border-gray-300 rounded-full" />
                )}
                {req.text}
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Los caracteres especiales son opcionales pero recomendados para mayor seguridad.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PasswordStrengthIndicator;