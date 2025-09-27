/**
 * Error Message Component
 * @fileoverview Reusable error message component for registration flow
 * @compliance HIPAA-compliant error handling
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ErrorMessageProps {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title, 
  message, 
  type = 'error',
  onRetry,
  className = ''
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 mr-3" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 mr-3" />;
      case 'info':
        return <Info className="h-5 w-5 flex-shrink-0 mt-0.5 mr-3" />;
      default:
        return <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 mr-3" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getTypeStyles()} ${className}`}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
