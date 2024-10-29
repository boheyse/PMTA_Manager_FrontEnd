import React from 'react';

interface LinkProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

export function Link({ icon, text, active }: LinkProps) {
  return (
    <a
      href="#"
      className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'hover:bg-blue-600/10 text-gray-300'
      }`}
    >
      {icon}
      <span>{text}</span>
    </a>
  );
}