'use client';

import { motion } from 'framer-motion';

interface AuthLoadingStateProps {
  message?: string;
  variant?: 'default' | 'verification' | 'redirect';
}

export function AuthLoadingState({ 
  message = 'Procesando tu solicitud...', 
  variant = 'default' 
}: AuthLoadingStateProps) {
  const getIcon = () => {
    switch (variant) {
      case 'verification':
        return (
          <svg 
            className="h-8 w-8 text-blue-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        );
      case 'redirect':
        return (
          <svg 
            className="h-8 w-8 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 7l5 5m0 0l-5 5m5-5H6" 
            />
          </svg>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        );
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-8 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {getIcon()}
      <p className="text-muted-foreground text-center">{message}</p>
      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>
    </motion.div>
  );
}