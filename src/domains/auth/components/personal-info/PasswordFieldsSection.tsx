/**
 * Password Fields Section Component
 * @fileoverview Password and confirm password fields with strength indicator
 * @compliance HIPAA-compliant password input with security validation
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield, XCircle } from 'lucide-react';
import {
  PersonalInfoFormData,
  PersonalInfoFormErrors,
  FieldTouchedState,
  PasswordVisibilityState,
  PasswordValidationResult
} from '../../types/personal-info.types';
import { getPasswordStrengthMessage } from '../../utils/personal-info-validation';

interface PasswordFieldsSectionProps {
  formData: Pick<PersonalInfoFormData, 'password' | 'confirmPassword'>;
  errors: Pick<PersonalInfoFormErrors, 'password' | 'confirmPassword'>;
  fieldTouched: Pick<FieldTouchedState, 'password' | 'confirmPassword'>;
  passwordVisibility: PasswordVisibilityState;
  passwordValidation: PasswordValidationResult | null;
  onFieldChange: (field: keyof PersonalInfoFormData, value: string) => void;
  onFieldTouch: (field: keyof PersonalInfoFormData) => void;
  onTogglePasswordVisibility: (field: 'password' | 'confirmPassword') => void;
}

export const PasswordFieldsSection: React.FC<PasswordFieldsSectionProps> = ({
  formData,
  errors,
  fieldTouched,
  passwordVisibility,
  passwordValidation,
  onFieldChange,
  onFieldTouch,
  onTogglePasswordVisibility
}) => {
  const getNormalizedScore = () => {
    if (!passwordValidation) return 0;
    const raw = passwordValidation.strength.score; // 0..100
    const normalized = Math.round(Math.max(0, Math.min(100, raw)) / 20); // 0..5
    return normalized;
  };
  const getPasswordFieldClassName = (baseClassName = '') => {
    let className = baseClassName;
    
    if (errors.password) {
      className += ' border-red-500 focus:border-red-500';
    } else if (passwordValidation?.isValid) {
      className += ' border-green-500 focus:border-green-500';
    }
    
    return className;
  };

  const getConfirmPasswordFieldClassName = (baseClassName = '') => {
    let className = baseClassName;
    
    if (errors.confirmPassword) {
      className += ' border-red-500 focus:border-red-500';
    } else if (fieldTouched.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword) {
      className += ' border-green-500 focus:border-green-500';
    }
    
    return className;
  };

  const getPasswordStrengthColor = () => {
    const score = getNormalizedScore();
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-blue-500';
    if (score >= 4) return 'bg-green-500';
    return 'bg-gray-200';
  };

  const getPasswordStrengthProgress = () => {
    if (!passwordValidation) return 0;
    // score viene 0..100 desde validación -> úsalo directo para la barra
    return Math.max(0, Math.min(100, passwordValidation.strength.score));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Seguridad de la Cuenta</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={passwordVisibility.password ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => { onFieldChange('password', e.target.value); onFieldTouch('password'); }}
              onBlur={() => onFieldTouch('password')}
              placeholder="Crear contraseña segura"
              className={getPasswordFieldClassName('pr-10')}
              maxLength={128}
              autoComplete="new-password"
            />
            {/* toggle de visibilidad */}
            <button
              type="button"
              className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
              onClick={() => onTogglePasswordVisibility('password')}
              aria-label={passwordVisibility.password ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {passwordVisibility.password ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              {errors.password ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (passwordValidation?.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : null)}
            </div>
          </div>


          {/* Password Strength Indicator (single progress bar) */}
          {fieldTouched.password && formData.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Seguridad de la contraseña:</span>
                <span className={`font-medium ${passwordValidation?.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordValidation ? getPasswordStrengthMessage(passwordValidation.strength) : 'Evaluando...'}
                </span>
              </div>
              <Progress value={getPasswordStrengthProgress()} className="h-2" />
            </div>
          )}

          {errors.password && fieldTouched.password && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.password}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirmar Contraseña <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={passwordVisibility.confirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => { onFieldChange('confirmPassword', e.target.value); onFieldTouch('confirmPassword'); }}
              onBlur={() => onFieldTouch('confirmPassword')}
              placeholder="Confirme su contraseña"
              className={getConfirmPasswordFieldClassName('pr-10')}
              maxLength={128}
              autoComplete="new-password"
            />
            {/* toggle de visibilidad */}
            <button
              type="button"
              className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
              onClick={() => onTogglePasswordVisibility('confirmPassword')}
              aria-label={passwordVisibility.confirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {passwordVisibility.confirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              {errors.confirmPassword ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (fieldTouched.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : null)}
            </div>
          </div>

          {errors.confirmPassword && fieldTouched.confirmPassword && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.confirmPassword}</AlertDescription>
            </Alert>
          )}

          {fieldTouched.confirmPassword && 
           formData.confirmPassword && 
           formData.password === formData.confirmPassword && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Las contraseñas coinciden
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Password Security Notice (removed per request) */}

      {/* Dynamic Password Requirements (interactive) */}
      {(fieldTouched.password || (passwordValidation && !passwordValidation.isValid)) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Requisitos de contraseña:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li className={`${formData.password.length >= 8 ? 'text-green-700' : 'text-red-700'}`}>
                {formData.password.length >= 8 ? 'Mínimo 8 caracteres (ok)' : 'Mínimo 8 caracteres'}
              </li>
              <li className={`${/[A-Z]/.test(formData.password) ? 'text-green-700' : 'text-red-700'}`}>
                {/[A-Z]/.test(formData.password) ? 'Incluye mayúscula (ok)' : 'Al menos una letra mayúscula'}
              </li>
              <li className={`${/[a-z]/.test(formData.password) ? 'text-green-700' : 'text-red-700'}`}>
                {/[a-z]/.test(formData.password) ? 'Incluye minúscula (ok)' : 'Al menos una letra minúscula'}
              </li>
              <li className={`${/\d/.test(formData.password) ? 'text-green-700' : 'text-red-700'}`}>
                {/\d/.test(formData.password) ? 'Incluye un número (ok)' : 'Al menos un número'}
              </li>
              <li className={`${/[@$!%*?&._-]/.test(formData.password) ? 'text-blue-700' : 'text-gray-600'}`}>
                {/@$!%*?&._-/.test(formData.password)
                  ? 'Buen plus: carácter especial detectado'
                  : 'Opcional: agrega un carácter especial para mayor seguridad'}
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
