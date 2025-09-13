'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { hasPermission, UserRole } from '@/features/auth/utils/role-utils';

export function useProtectedRoute(requiredRoles?: UserRole | UserRole[]) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Si aún se está cargando el estado de autenticación, no hacer nada
    if (isLoading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      const redirectUrl = pathname !== '/login' ? pathname : undefined;
      router.push(`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`);
      
      toast({
        title: 'Acceso denegado',
        description: 'Debes iniciar sesión para acceder a esta página.',
        variant: 'destructive',
      });
      return;
    }

    // Si se requieren roles específicos y el usuario no tiene permiso, redirigir
    if (requiredRoles && user?.role) {
      const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      if (!hasPermission(user.role, rolesToCheck)) {
        router.push('/auth/unauthorized');
        
        toast({
          title: 'Acceso denegado',
          description: 'No tienes permisos para acceder a esta página.',
          variant: 'destructive',
        });
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, pathname, toast]);

  return { isAuthenticated, isLoading, user };
}