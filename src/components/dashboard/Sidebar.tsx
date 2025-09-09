'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Calendar, Stethoscope, User, Settings, FileText } from 'lucide-react';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('admin' | 'doctor' | 'patient')[];
};

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const navigation: NavigationItem[] = [
    {
      name: 'Resumen',
      href: `/${role}/dashboard`,
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ['admin', 'doctor', 'patient'],
    },
    {
      name: 'Mi Agenda',
      href: `/${role}/appointments`,
      icon: <Calendar className="h-5 w-5" />,
      roles: ['doctor', 'patient'],
    },
    {
      name: 'Pacientes',
      href: '/doctor/patients',
      icon: <Users className="h-5 w-5" />,
      roles: ['doctor'],
    },
    {
      name: 'Médicos',
      href: '/patient/doctors',
      icon: <Stethoscope className="h-5 w-5" />,
      roles: ['patient'],
    },
    {
      name: 'Historial Médico',
      href: '/patient/medical-history',
      icon: <FileText className="h-5 w-5" />,
      roles: ['patient'],
    },
    {
      name: 'Perfil',
      href: `/${role}/profile`,
      icon: <User className="h-5 w-5" />,
      roles: ['admin', 'doctor', 'patient'],
    },
    {
      name: 'Configuración',
      href: `/${role}/settings`,
      icon: <Settings className="h-5 w-5" />,
      roles: ['admin', 'doctor'],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r bg-background">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-lg font-semibold">Menú</h2>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                  )}
                >
                  <span className="mr-3 flex h-5 w-5 items-center justify-center">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User info and sign out */}
        <div className="border-t p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Usuario'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
