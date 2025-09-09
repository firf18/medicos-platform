'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavLinkProps } from './types';

export function NavLink({ item, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
        className
      )}
    >
      {item.icon && <span className="mr-2">{item.icon}</span>}
      {item.title}
    </Link>
  );
}
