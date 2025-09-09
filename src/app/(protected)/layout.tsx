'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import MainNav from '@/components/navigation/main-nav';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Loader2 } from 'lucide-react';
import { toast } from '../../components/ui/use-toast';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ 
  children
}: ProtectedLayoutProps) {
  const allowedRoles = ['patient', 'doctor', 'admin'];
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      toast({
        title: 'Acceso no autorizado',
        description: 'Por favor inicia sesión para continuar',
        variant: 'destructive',
      });
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isLoading && isAuthenticated && user?.role && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role if not authorized
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permiso para acceder a esta sección',
        variant: 'destructive',
      });
      
      // Redirect to role-specific dashboard or home
      const roleBasedRedirect = `/${user.role}/dashboard`;
      router.push(roleBasedRedirect);
    }
  }, [isLoading, isAuthenticated, user?.role, router, pathname, allowedRoles]);

  // Show loading state while checking auth
  if (isLoading || (!isAuthenticated && !isLoading) || (isAuthenticated && user?.role && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Test component to verify rendering
  const TestBanner = () => (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
      <p className="font-bold">¡Componente de prueba!</p>
      <p>Si ves este mensaje, el layout se está renderizando correctamente.</p>
      <p>Estado de autenticación: {isAuthenticated ? 'Autenticado' : 'No autenticado'}</p>
      <p>Rol del usuario: {user?.role || 'No definido'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TestBanner />
      <MainNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
