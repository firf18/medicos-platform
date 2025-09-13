'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { NavItems } from './NavItems';
import { NavItem, UserRole } from './types';
import { AUTH_ROUTES, PUBLIC_ROUTES, PROTECTED_ROUTES } from '@/lib/routes';

// Navegación principal para usuarios no autenticados
const publicNavItems: NavItem[] = [
  { title: 'Inicio', href: PUBLIC_ROUTES.HOME },
  { title: 'Características', href: PUBLIC_ROUTES.FEATURES },
  { title: 'Precios', href: PUBLIC_ROUTES.PRICING },
  { title: 'Soporte', href: PUBLIC_ROUTES.SUPPORT },
];

// Navegación para usuarios autenticados según su rol
const protectedNavItems: Record<UserRole, NavItem[]> = {
  admin: [
    { title: 'Dashboard', href: PROTECTED_ROUTES.ADMIN.DASHBOARD, icon: '📊' },
    { title: 'Búsqueda', href: '/search', icon: '🔍' },
    { title: 'Usuarios', href: PROTECTED_ROUTES.ADMIN.USERS, icon: '👥' },
    { title: 'Reportes', href: PROTECTED_ROUTES.ADMIN.REPORTS, icon: '📈' },
  ],
  doctor: [
    { title: 'Inicio', href: PROTECTED_ROUTES.DOCTOR.DASHBOARD, icon: '🏠' },
    { title: 'Búsqueda', href: '/search', icon: '🔍' },
    { title: 'Chat', href: '/chat', icon: '💬' },
    { title: 'Citas', href: PROTECTED_ROUTES.DOCTOR.APPOINTMENTS, icon: '📅' },
    { title: 'Pacientes', href: PROTECTED_ROUTES.DOCTOR.PATIENTS, icon: '👥' },
    { title: 'Historial', href: PROTECTED_ROUTES.DOCTOR.RECORDS, icon: '📋' },
  ],
  patient: [
    { title: 'Inicio', href: PROTECTED_ROUTES.PATIENT.DASHBOARD, icon: '🏠' },
    { title: 'Búsqueda', href: '/search', icon: '🔍' },
    { title: 'Chat', href: '/chat', icon: '💬' },
    { title: 'Mis Citas', href: PROTECTED_ROUTES.PATIENT.APPOINTMENTS, icon: '📅' },
    { title: 'Médicos', href: PROTECTED_ROUTES.PATIENT.DOCTORS, icon: '👨\u200d⚕️' },
    { title: 'Historial', href: PROTECTED_ROUTES.PATIENT.RECORDS, icon: '📋' },
  ],
};

export default function MainNav() {
  const { isAuthenticated, user, signOut, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Si aún está cargando, mostrar un esqueleto de navegación
  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-md bg-muted"></div>
            <div className="hidden md:flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-20 rounded bg-muted"></div>
              ))}
            </div>
          </div>
          <div className="h-10 w-24 rounded-md bg-muted"></div>
        </div>
      </header>
    );
  }

  // Determinar las opciones de navegación según el rol del usuario
  const userRole = (user?.user_metadata?.role as UserRole) || 'patient';
  const navItems = isAuthenticated 
    ? protectedNavItems[userRole] || []
    : publicNavItems;
    
  console.log('Estado de autenticación:', { isAuthenticated, userRole, isLoading });

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMobileMenu();
  };

  // Estilos de depuración
  const debugStyles = {
    border: '1px solid red',
    padding: '1rem',
    margin: '0.5rem 0',
  };

  return (
    <>
      <header 
        className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={debugStyles} // Estilo de depuración
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo y menú móvil */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent"
              onClick={toggleMobileMenu}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                MediConectaVE
              </span>
            </Link>

            {/* Navegación principal (escritorio) */}
            <div className="hidden md:block">
              <NavItems navItems={navItems} className="gap-1" />
            </div>
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <UserMenu user={user} onSignOut={handleSignOut} />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
                  <Link href={AUTH_ROUTES.LOGIN}>Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={AUTH_ROUTES.REGISTER}>Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={closeMobileMenu}
        navItems={navItems}
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
      />
    </>
  );
}
