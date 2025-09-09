'use client';

import { NavItem, NavItemsProps } from './types';
import { NavLink } from './NavLink';

export function NavItems({ navItems, className = '', itemClassName = '', onItemClick }: NavItemsProps) {
  return (
    <nav className={className}>
      <ul className="flex flex-col md:flex-row md:items-center gap-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <NavLink 
              item={item} 
              className={itemClassName}
              onClick={onItemClick}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
