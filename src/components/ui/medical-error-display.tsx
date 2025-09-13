/**
 * Componente de Error Médico - Red-Salud
 * 
 * Este componente proporciona una interfaz user-friendly para mostrar errores
 * de validación en formularios médicos, cumpliendo con estándares de UX médica.
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X, RefreshCw, Info } from 'lucide-react';
import { FormattedError } from '@/lib/error-handling/zod-error-formatter';

// ============================================================================
// TIPOS DE PROPS
// ============================================================================

interface MedicalErrorDisplayProps {
  errors: FormattedError[];
  warnings?: FormattedError[];
  title?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

interface FieldErrorDisplayProps {
  error: FormattedError;
  onDismiss?: () => void;
  className?: string;
}

interface ErrorSummaryProps {
  errors: FormattedError[];
  warnings?: FormattedError[];
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL DE ERRORES
// ============================================================================

export function MedicalErrorDisplay({
  errors,
  warnings = [],
  title = 'Error de validación',
  onDismiss,
  onRetry,
  showRetry = false,
  className = ''
}: MedicalErrorDisplayProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errores críticos */}
      {hasErrors && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            {title}
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <div className="space-y-2">
              {errors.map((error, index) => (
                <FieldErrorDisplay
                  key={index}
                  error={error}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
            {showRetry && onRetry && (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reintentar
                </Button>
                {onDismiss && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDismiss}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cerrar
                  </Button>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Advertencias */}
      {hasWarnings && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">
            Advertencias
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-sm">• {warning.message}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE ERROR POR CAMPO
// ============================================================================

export function FieldErrorDisplay({
  error,
  onDismiss,
  className = ''
}: FieldErrorDisplayProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <Info className="h-3 w-3 text-yellow-500" />;
      default:
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      default:
        return 'text-blue-700';
    }
  };

  return (
    <div className={`flex items-start space-x-2 ${className}`}>
      {getSeverityIcon(error.severity)}
      <div className="flex-1">
        <span className={`text-sm font-medium ${getSeverityColor(error.severity)}`}>
          {error.field}:
        </span>
        <span className={`text-sm ml-1 ${getSeverityColor(error.severity)}`}>
          {error.message}
        </span>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE RESUMEN DE ERRORES
// ============================================================================

export function ErrorSummary({
  errors,
  warnings = [],
  className = ''
}: ErrorSummaryProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  const totalIssues = errors.length + warnings.length;
  const criticalErrors = errors.filter(e => e.severity === 'error').length;

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <AlertCircle className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">
          Resumen de validación
        </h3>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        {criticalErrors > 0 && (
          <p>• {criticalErrors} error{criticalErrors > 1 ? 'es' : ''} crítico{criticalErrors > 1 ? 's' : ''} que deben corregirse</p>
        )}
        {warnings.length > 0 && (
          <p>• {warnings.length} advertencia{warnings.length > 1 ? 's' : ''} adicional{warnings.length > 1 ? 'es' : ''}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Total: {totalIssues} problema{totalIssues > 1 ? 's' : ''} encontrado{totalIssues > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE ERROR INLINE PARA CAMPOS
// ============================================================================

export function InlineFieldError({
  error,
  className = ''
}: {
  error: string | null;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div className={`flex items-center space-x-1 mt-1 ${className}`}>
      <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
      <span className="text-sm text-red-600">{error}</span>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE ERROR DE FORMULARIO COMPLETO
// ============================================================================

export function FormErrorDisplay({
  errors,
  warnings = [],
  onDismiss,
  onRetry,
  showRetry = false,
  className = ''
}: {
  errors: FormattedError[];
  warnings?: FormattedError[];
  onDismiss?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Resumen de errores */}
      <ErrorSummary errors={errors} warnings={warnings} />
      
      {/* Lista detallada de errores */}
      <MedicalErrorDisplay
        errors={errors}
        warnings={warnings}
        onDismiss={onDismiss}
        onRetry={onRetry}
        showRetry={showRetry}
      />
    </div>
  );
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default MedicalErrorDisplay;
