import { ResendVerificationForm } from '@/features/auth/components/resend-verification-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { AUTH_ROUTES } from '@/lib/routes';

export default function ResendVerificationPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Reenviar verificación</CardTitle>
          <CardDescription>
            ¿No recibiste el correo de verificación? Te enviaremos uno nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResendVerificationForm />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link href={AUTH_ROUTES.LOGIN} className="text-primary hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}