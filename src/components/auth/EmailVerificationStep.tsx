'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationStepProps {
  email: string;
  onVerificationSuccess: (email: string, code: string) => void;
  onResendCode: (email: string) => void;
  isLoading?: boolean;
  error?: string | null;
  canResend?: boolean;
  resendCooldown?: number;
}

export default function EmailVerificationStep({
  email,
  onVerificationSuccess,
  onResendCode,
  isLoading = false,
  error = null,
  canResend = true,
  resendCooldown = 0
}: EmailVerificationStepProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(resendCooldown);
  const { toast } = useToast();

  // Contador para reenvío de código
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Limpiar código cuando cambie el email
  useEffect(() => {
    setVerificationCode('');
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Código inválido',
        description: 'Por favor ingresa un código de 6 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      await onVerificationSuccess(email, verificationCode);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0 || !canResend) return;
    
    try {
      await onResendCode(email);
      setTimeLeft(60); // 60 segundos de cooldown
      toast({
        title: 'Código reenviado',
        description: 'Se ha enviado un nuevo código de verificación.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo reenviar el código. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Verifica tu correo</CardTitle>
        <CardDescription>
          Hemos enviado un código de verificación de 6 dígitos a
        </CardDescription>
        <div className="font-medium text-blue-600">{email}</div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Código de verificación</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              disabled={isLoading || isVerifying}
            />
            <p className="text-sm text-muted-foreground text-center">
              Ingresa el código de 6 dígitos que recibiste por correo
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isVerifying || verificationCode.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verificar código
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              ¿No recibiste el código?
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendCode}
              disabled={!canResend || timeLeft > 0 || isLoading}
              className="w-full"
            >
              {timeLeft > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar en {formatTime(timeLeft)}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar código
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">¿Problemas con la verificación?</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Revisa tu carpeta de spam o correo no deseado</li>
            <li>• Asegúrate de que el correo sea correcto</li>
            <li>• El código expira en 15 minutos</li>
            <li>• Puedes solicitar un nuevo código si es necesario</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
