import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface NavItem {
  title: string;
  href: string;
  roles?: UserRole[];
  icon?: React.ReactNode;
  children?: NavItem[];
}

export interface NavLinkProps {
  item: NavItem;
  className?: string;
  onClick?: () => void;
}

export interface UserMenuProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  isAuthenticated: boolean;
  onSignOut: () => Promise<void>;
}

export interface NavItemsProps {
  navItems: NavItem[];
  className?: string;
  itemClassName?: string;
  onItemClick?: () => void;
}
