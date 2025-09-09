'use client';

import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { NavLink } from './NavLink';
import { NavItem } from './types';

const userMenuItems: NavItem[] = [
  { 
    title: 'Perfil', 
    href: '/profile', 
    icon: <UserIcon className="mr-2 h-4 w-4" /> 
  },
  { 
    title: 'Configuración', 
    href: '/settings', 
    icon: <Settings className="mr-2 h-4 w-4" /> 
  },
  { 
    title: 'Cerrar sesión', 
    href: '/logout', 
    icon: <LogOut className="mr-2 h-4 w-4" /> 
  },
];

interface UserMenuProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const userRole = user?.user_metadata?.role || 'patient';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center gap-2 p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Menú de usuario"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.first_name} />
            <AvatarFallback>
              {user?.user_metadata?.first_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium">
            {user?.user_metadata?.first_name || 'Usuario'}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium">
          <div className="truncate">{user?.email}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {userRole}
          </div>
        </div>
        <div className="border-t my-1" />
        {userMenuItems.map((item) =>
          item.title === 'Cerrar sesión' ? (
            <DropdownMenuItem
              key={item.href}
              onSelect={onSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              {item.icon}
              {item.title}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={item.href} asChild>
              <NavLink 
                item={item} 
                className="w-full cursor-pointer"
              />
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
