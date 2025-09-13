'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AUTH_ROUTES } from '@/lib/routes';
import { hasPermission, UserRole } from '@/features/auth/utils/role-utils';
import { AuthLoadingState } from '@/features/auth/components/auth-loading-state';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!isLoading && !isAuthenticated) {
      // Guardar la ruta a la que se intentaba acceder
      const redirectUrl = pathname !== AUTH_ROUTES.LOGIN ? pathname : undefined;
      
      router.push(`${AUTH_ROUTES.LOGIN}${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`);
      
      toast({
        title: 'Acceso denegado',
        description: 'Debes iniciar sesión para acceder a esta página.',
        variant: 'destructive',
      });
    }
    
    // Verificar rol si se requiere uno específico
    if (!isLoading && isAuthenticated && requiredRole && user?.role) {
      const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!hasPermission(user.role, rolesToCheck)) {
        router.push('/auth/unauthorized');
        
        toast({
          title: 'Acceso denegado',
          description: 'No tienes permisos para acceder a esta página.',
          variant: 'destructive',
        });
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, pathname, toast]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading || !isAuthenticated) {
    return <AuthLoadingState message="Verificando acceso..." variant="default" />;
  }

  // Verificar rol si se requiere uno específico
  if (requiredRole && user?.role) {
    const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!hasPermission(user.role, rolesToCheck)) {
      return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Acceso denegado</h1>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta página.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="text-primary hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
}