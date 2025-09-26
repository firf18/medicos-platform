/**
 * Email Verification Component
 * @fileoverview Componente para verificar email con código
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { useEmailVerification } from '@/hooks/useEmailVerification';

interface EmailVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onVerificationError: (error: string) => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationComplete,
  onVerificationError
}) => {
  // Log solo en desarrollo y con debounce más agresivo
  const [lastLogTime, setLastLogTime] = useState(0);
  useEffect(() => {
    const now = Date.now();
    if (process.env.NODE_ENV === 'development' && (now - lastLogTime > 10000)) {
      console.log('🔍 EmailVerification: Props recibidas:', {
        email,
        onVerificationComplete: typeof onVerificationComplete,
        onVerificationError: typeof onVerificationError
      });
      setLastLogTime(now);
    }
  }, [email, onVerificationComplete, onVerificationError, lastLogTime]);
  const [code, setCode] = useState('');
  
  const {
    isVerifying,
    isVerified,
    error,
    isSendingCode,
    codeSent,
    retryAfter,
    attemptCount,
    lastAttemptTime,
    sendVerificationCode,
    verifyCode,
    resetVerification
  } = useEmailVerification({
    email,
    onVerificationComplete,
    onVerificationError
  });

  const handleSendCode = async () => {
    await sendVerificationCode();
  };

  const handleVerifyCode = async () => {
    console.log('🔍 EmailVerification: Iniciando verificación de código...');
    await verifyCode(code);
  };

  const handleResendCode = async () => {
    resetVerification();
    await sendVerificationCode();
  };

  // Calculate remaining time for retry
  const getRetryTimeRemaining = () => {
    if (!retryAfter) return null;
    const remaining = Math.ceil((retryAfter - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  // Calculate time since last attempt for minute-based rate limiting
  const getTimeSinceLastAttempt = () => {
    if (!lastAttemptTime) return null;
    const timeSince = Math.floor((Date.now() - lastAttemptTime) / 1000);
    return timeSince;
  };

  const retryTimeRemaining = getRetryTimeRemaining();
  const timeSinceLastAttempt = getTimeSinceLastAttempt();
  const isRateLimited = retryAfter && retryAfter > Date.now();
  
  // Determine if we're in a minute-based cooldown
  const isMinuteCooldown = lastAttemptTime && timeSinceLastAttempt && timeSinceLastAttempt < 60;

  if (isVerified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Email Verificado</h3>
              <p className="text-sm">Tu correo electrónico ha sido verificado correctamente.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 text-blue-800">
            <Mail className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Verificación de Email</h3>
              <p className="text-sm">Enviamos un código de verificación a <strong>{email}</strong></p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>{error}</div>
                  
                  {isRateLimited && retryTimeRemaining && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Puedes intentar nuevamente en <strong>{retryTimeRemaining} segundos</strong></span>
                    </div>
                  )}
                  
                  {isMinuteCooldown && !isRateLimited && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Espera <strong>{60 - (timeSinceLastAttempt || 0)} segundos</strong> para el siguiente intento</span>
                    </div>
                  )}
                  
                  {attemptCount > 1 && (
                    <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                      <strong>Intento #{attemptCount}</strong> - Los tiempos de espera aumentan con cada intento para proteger la seguridad
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Send Code Button */}
          {!codeSent && (
            <div className="space-y-2">
              <Button 
                onClick={handleSendCode}
                disabled={isSendingCode || isRateLimited || isMinuteCooldown}
                className="w-full"
              >
                {isSendingCode ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enviando código...
                  </>
                ) : isRateLimited ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Espera {retryTimeRemaining}s para reintentar
                  </>
                ) : isMinuteCooldown ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Espera {60 - (timeSinceLastAttempt || 0)}s (límite por minuto)
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Obtener código de verificación
                  </>
                )}
              </Button>
              
            </div>
          )}

          {/* Code Input */}
          {codeSent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  Código de verificación
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ingresa el código de 6 dígitos"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleVerifyCode}
                  disabled={isVerifying || code.length !== 6}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar código'
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isSendingCode || isRateLimited || isMinuteCooldown}
                  title={
                    isRateLimited ? `Espera ${retryTimeRemaining}s para reintentar` :
                    isMinuteCooldown ? `Espera ${60 - (timeSinceLastAttempt || 0)}s (límite por minuto)` :
                    "Reenviar código"
                  }
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-600 text-center">
                ¿No recibiste el código? Haz clic en el botón de recargar para reenviar.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
