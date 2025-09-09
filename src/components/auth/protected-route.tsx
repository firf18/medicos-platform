'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'doctor' | 'patient';
  loadingComponent?: React.ReactNode;
  unauthorizedRedirect?: string;
};

export function ProtectedRoute({
  children,
  requiredRole,
  loadingComponent = (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
  unauthorizedRedirect = '/login',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Not authenticated, redirect to login
      router.push(unauthorizedRedirect);
    } else if (!isLoading && isAuthenticated && requiredRole && role !== requiredRole) {
      // Authenticated but wrong role, redirect to dashboard or home
      const roleBasedRedirect = role ? `/${role}/dashboard` : '/';
      router.push(roleBasedRedirect);
    }
  }, [isLoading, isAuthenticated, role, requiredRole, router, unauthorizedRedirect]);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return <>{loadingComponent}</>;
  }

  return <>{children}</>;
}
