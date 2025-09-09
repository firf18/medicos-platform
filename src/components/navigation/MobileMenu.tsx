'use client';

import { X } from 'lucide-react';
import { NavItems } from './NavItems';
import { NavItem, MobileMenuProps } from './types';

export function MobileMenu({ isOpen, onClose, navItems, isAuthenticated, onSignOut }: MobileMenuProps) {
  if (!isOpen) return null;

  const mobileMenuItems = [
    ...navItems,
    ...(isAuthenticated 
      ? [
          { title: 'Perfil', href: '/profile' },
          { title: 'Configuración', href: '/settings' },
          { 
            title: 'Cerrar sesión', 
            href: '#',
            onClick: onSignOut 
          },
        ]
      : []
    )
  ] as NavItem[];

  return (
    <div 
      className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="container pt-20 pb-8 px-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md text-muted-foreground hover:bg-accent"
          aria-label="Cerrar menú"
        >
          <X className="h-6 w-6" />
        </button>
        
        <NavItems 
          navItems={mobileMenuItems} 
          className="space-y-2"
          itemClassName="py-3 px-4 text-base"
          onItemClick={onClose}
        />
      </div>
    </div>
  );
}
