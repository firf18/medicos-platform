'use client';

import { useEffect, useState } from 'react';

interface EmailVerificationLoadingProps {
  email: string;
  onResend?: () => void;
}

export default function EmailVerificationLoading({ email, onResend }: EmailVerificationLoadingProps) {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    if (onResend) {
      onResend();
      setCountdown(60);
      setCanResend(false);
    }
  };

  return (
    <div className="text-center space-y-4">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Código Enviado
        </h3>
        <p className="text-gray-600 text-sm">
          Hemos enviado un código de verificación a:
        </p>
        <p className="font-semibold text-blue-600 text-sm">
          {email}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-blue-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">
            {canResend ? 'Puedes reenviar el código' : `Reenviar en ${countdown}s`}
          </span>
        </div>
      </div>

      {canResend && (
        <button
          onClick={handleResend}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
        >
          Reenviar código
        </button>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Revisa tu bandeja de entrada y spam</p>
        <p>• El código expira en 10 minutos</p>
        <p>• Usa solo números, sin espacios</p>
      </div>
    </div>
  );
}