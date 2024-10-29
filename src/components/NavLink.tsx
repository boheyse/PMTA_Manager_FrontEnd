import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';

interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  to: string;
}

export function NavLink({ icon, text, to }: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'hover:bg-blue-600/10 text-gray-300'
        }`
      }
    >
      {icon}
      <span>{text}</span>
    </RouterNavLink>
  );
}