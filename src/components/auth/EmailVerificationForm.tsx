'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client'; // Usar nuestro cliente personalizado
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { InformationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface EmailVerificationFormProps {
  email: string;
  userType: 'patient' | 'doctor';
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function EmailVerificationForm({ 
  email, 
  userType, 
  onSuccess, 
  onError 
}: EmailVerificationFormProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos (900 segundos)
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationMethod, setVerificationMethod] = useState<'otp' | 'link'>('otp');
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient(); // Usar nuestro cliente con limpieza automática

  // Timer para expiración del código
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        
        // Mostrar advertencia cuando quedan 2 minutos
        if (timeLeft === 120) {
          setShowExpirationWarning(true);
          console.log('⚠️ El código expirará en 2 minutos');
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      setShowExpirationWarning(false);
      console.log('⏰ El código ha expirado');
    }
  }, [timeLeft]);

  // Timer para cooldown de reenvío
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Si se pega un código completo
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((digit, i) => {
        if (i < 6 && /^\d$/.test(digit)) {
          newCode[i] = digit;
        }
      });
      setCode(newCode);
      
      // Enfocar el último input lleno o el siguiente vacío
      const nextEmptyIndex = newCode.findIndex(digit => digit === '');
      const targetIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      onError('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 Verificando código OTP...');
      console.log('📧 Email:', email);
      console.log('🔢 Código:', fullCode);
      
      // Usar la nueva API de verificación
      const response = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: fullCode
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error en verificación:', result);
        
        // Manejar errores específicos
        if (result.expired) {
          onError('El código ha expirado. Solicita uno nuevo.');
          // Auto-solicitar nuevo código si está expirado
          setTimeout(() => {
            if (!resendLoading && timeLeft <= 0) {
              console.log('🔄 Solicitando automáticamente un nuevo código...');
              handleResendCode();
            }
          }, 2000);
          return;
        }

        if (result.invalid) {
          onError('Código incorrecto. Verifica los 6 dígitos.');
          // Limpiar el código en caso de error
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
          return;
        }

        if (result.tooManyAttempts) {
          onError('Demasiados intentos. Espera unos minutos e intenta de nuevo.');
          return;
        }

        throw new Error(result.error || 'Error verificando código');
      }

      console.log('✅ Verificación exitosa:', result);
      console.log('👤 Usuario ID:', result.user.id);
      console.log('📧 Email confirmado:', result.user.emailConfirmed);
      
      onSuccess();
      
    } catch (error: any) {
      console.error('💥 Error en verificación:', error);
      
      const errorMessage = error?.message || 'Error desconocido al verificar el código';
      onError(errorMessage);
      
      // Limpiar el código en caso de error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);

    try {
      console.log('🔄 Solicitando nuevo código OTP...');
      console.log('📧 Email:', email);
      
      // Usar la nueva API de envío
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error reenviando código:', result);
        
        // Manejar errores específicos
        if (result.rateLimited) {
          throw new Error('Demasiados intentos. Espera unos minutos antes de solicitar otro código.');
        }

        if (result.otpDisabled) {
          throw new Error('OTP no está habilitado. Contacta al administrador.');
        }

        if (result.emailNotAuthorized) {
          throw new Error('Email no autorizado. Contacta al administrador.');
        }

        throw new Error(result.error || 'Error reenviando código');
      }

      console.log('✅ Código reenviado exitosamente');
      
      setVerificationMethod('otp');
      // Reiniciar timers con tiempo extendido
      setTimeLeft(900); // 15 minutos
      setCanResend(false);
      setResendCooldown(60); // 1 minuto de cooldown
      
      // Limpiar código actual
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
    } catch (error: any) {
      console.error('❌ Error reenviando código:', error);
      
      const errorMessage = error?.message || 'Error al reenviar el código';
      onError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Verificar Email
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Ingresa el código de 6 dígitos enviado a:
        </p>
        <p className="font-semibold text-blue-600 break-all">{email}</p>
        
        {/* Advertencia de expiración */}
        {showExpirationWarning && timeLeft > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm font-medium">
                ⚠️ El código expirará en {formatTime(timeLeft)}. ¡Date prisa!
              </p>
            </div>
          </div>
        )}
        
        {/* Mensaje de código expirado */}
        {timeLeft === 0 && (
          <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 text-sm font-medium">
                  ⏰ El código ha expirado
                </p>
                <p className="text-red-700 text-xs mt-1">
                  Solicita un nuevo código para continuar
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {verificationMethod === 'link' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Verificación por enlace</p>
                <p>También se envió un enlace de verificación. Revisa tu correo y haz clic en él, o ingresa el código abajo.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Código de Verificación
            </label>
            
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-blue-500"
                  disabled={loading}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>
                {timeLeft > 0 ? `Expira en ${formatTime(timeLeft)}` : 'Código expirado'}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || code.join('').length !== 6 || timeLeft === 0}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Verificando...</span>
              </div>
            ) : (
              'Verificar Código'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            {timeLeft === 0 ? '¡El código ha expirado!' : '¿No recibiste el código?'}
          </p>
          <Button
            variant="ghost"
            onClick={handleResendCode}
            disabled={resendLoading || (!canResend && resendCooldown === 0 && timeLeft > 0)}
            className={`text-sm font-medium ${
              timeLeft === 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700 px-6 py-2' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            {resendLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Reenviando...</span>
              </div>
            ) : resendCooldown > 0 ? (
              `Reenviar en ${resendCooldown}s`
            ) : timeLeft === 0 ? (
              '🔄 Solicitar nuevo código'
            ) : canResend ? (
              'Reenviar código'
            ) : (
              'Reenviar código'
            )}
          </Button>
          
          {timeLeft === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Los códigos expiran por seguridad. Solicita uno nuevo.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
