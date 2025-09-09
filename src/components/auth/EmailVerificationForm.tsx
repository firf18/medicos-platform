'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationMethod, setVerificationMethod] = useState<'otp' | 'link'>('otp');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClientComponentClient();

  // Timer para expiración del código
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
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
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type: 'signup'
      });

      if (error) throw error;

      if (data.user) {
        // Actualizar el perfil del usuario
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            user_type: userType,
            email_verified: true 
          }
        });

        if (updateError) throw updateError;

        onSuccess();
      }
    } catch (error: any) {
      onError(error.message || 'Código inválido o expirado');
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
      // Intentar reenviar como OTP
      const { error: otpError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: undefined // Forzar OTP
        }
      });

      if (otpError) {
        // Si falla, intentar con enlace
        const { error: linkError } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(email)}&type=${userType}`
          }
        });
        
        if (linkError) throw linkError;
        
        setVerificationMethod('link');
        onError('Se envió un enlace de verificación. Si prefieres un código, contacta al soporte.');
      } else {
        setVerificationMethod('otp');
        // Reiniciar timers
        setTimeLeft(600);
        setCanResend(false);
        setResendCooldown(60); // 1 minuto de cooldown
        
        // Limpiar código actual
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      onError(error.message || 'Error al reenviar el código');
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
            ¿No recibiste el código?
          </p>
          <Button
            variant="ghost"
            onClick={handleResendCode}
            disabled={resendLoading || (!canResend && resendCooldown === 0)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {resendLoading ? (
              'Reenviando...'
            ) : resendCooldown > 0 ? (
              `Reenviar en ${resendCooldown}s`
            ) : canResend ? (
              'Reenviar código'
            ) : (
              'Reenviar código'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}