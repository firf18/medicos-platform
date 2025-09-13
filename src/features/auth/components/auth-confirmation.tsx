'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface AuthConfirmationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissTime?: number;
}

export function AuthConfirmation({ 
  type, 
  title, 
  message, 
  onDismiss,
  autoDismiss = false,
  dismissTime = 5000
}: AuthConfirmationProps) {
  // Auto-dismiss después de un tiempo si se especifica
  if (autoDismiss && onDismiss) {
    setTimeout(onDismiss, dismissTime);
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      default:
        return 'text-blue-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`border rounded-md p-4 ${getBackgroundColor()}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTitleColor()}`}>
            {title}
          </h3>
          <div className={`mt-1 text-sm ${getMessageColor()}`}>
            <p>{message}</p>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 ${getTitleColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              onClick={onDismiss}
            >
              <span className="sr-only">Cerrar</span>
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}