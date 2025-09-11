'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import MainNav from '@/components/navigation/main-nav';
import { AUTH_ROUTES } from '@/lib/routes';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authRoutes = [
    AUTH_ROUTES.LOGIN, 
    AUTH_ROUTES.REGISTER, 
    AUTH_ROUTES.FORGOT_PASSWORD, 
    AUTH_ROUTES.RESET_PASSWORD, 
    AUTH_ROUTES.VERIFY_EMAIL
  ] as const;
  
  const showNav = pathname ? !authRoutes.includes(pathname as any) : true;

  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && <MainNav />}
      <main className={showNav ? 'py-10' : ''}>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
