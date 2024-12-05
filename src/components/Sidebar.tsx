import React from 'react';
import { Home, BarChart2, Mail, Network, Globe, Ban, InboxIcon, Inbox, FileText, Server, Globe2, LogOut } from 'lucide-react';
import { NavLink } from './NavLink';
import { useSidebar } from '../context/SidebarContext';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

export function Sidebar() {
  const { showSidebar } = useSidebar();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!showSidebar) return null;

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      navigate('/login');
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };
  
  return (
    <div className="w-64 bg-[#1b2a4e] min-h-screen text-gray-300 p-4 flex flex-col">
      <div className="flex items-center mb-8">
        <Network className="w-8 h-8 text-emerald-500" />
        <span className="ml-2 text-xl font-semibold text-white">PMTA Manager</span>
      </div>
      
      <nav className="space-y-2 flex-1">
        <NavLink to="/" icon={<Home size={20} />} text="Monitoring" />
        <NavLink to="/domain-registrar" icon={<Globe2 size={20} />} text="Domain Registrar" />
        <NavLink to="/manage-server" icon={<Server size={20} />} text="Manage Server" />
        <NavLink to="/mailboxes" icon={<Inbox size={20} />} text="Mailboxes" />
        <NavLink to="/mailbox-providers" icon={<Mail size={20} />} text="Mailbox Providers" />
        <NavLink to="/bounces" icon={<Ban size={20} />} text="Bounces" />
        <NavLink to="/email-logs" icon={<InboxIcon size={20} />} text="Email Logs" />
      </nav>

      <div className="pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 p-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-2 w-full flex items-center space-x-3 p-2 text-gray-300 hover:bg-blue-600/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}