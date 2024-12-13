import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="bg-white border-b mb-6">
      <nav className="container mx-auto px-6">
        <ul className="flex space-x-8">
          <li>
            <Link
              to="/manage-server"
              className={`inline-block py-4 border-b-2 ${
                isActive('/manage-server')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Servers
            </Link>
          </li>
          <li>
            <Link
              to="/manage-server/templates"
              className={`inline-block py-4 border-b-2 ${
                isActive('/manage-server/templates')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Templates
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}