'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getRoleDisplayName } from '@/features/auth/utils/role-utils';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="container flex h-screen flex-col items-center justify-center space-y-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Acceso denegado</h1>
        <p className="text-lg text-muted-foreground">
          No tienes permisos para acceder a esta página.
        </p>
        {user && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-sm">
              Tu rol actual es: <span className="font-medium">{getRoleDisplayName(user.role as any)}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Contacta con un administrador si crees que deberías tener acceso.
            </p>
          </div>
        )}
        <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
          <Button variant="outline" onClick={() => router.push('/auth/profile')}>
            Ver mi perfil
          </Button>
        </div>
      </div>
    </div>
  );
}