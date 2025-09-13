'use client'

import { EmailVerificationForm } from '@/features/auth/components/email-verification-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Verificar correo electrónico</CardTitle>
          <CardDescription>
            Estamos verificando tu dirección de correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailVerificationForm />
        </CardContent>
      </Card>
    </div>
  );
}
