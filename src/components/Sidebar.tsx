import React from 'react';
import { Home, BarChart2, Mail, Network, Globe, Ban, InboxIcon, Inbox, FileText, Server, Globe2 } from 'lucide-react';
import { NavLink } from './NavLink';
import { useSidebar } from '../context/SidebarContext';

export function Sidebar() {
  const { showSidebar } = useSidebar();

  if (!showSidebar) return null;
  
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
        <button className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-blue-600/10 transition-colors">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            B
          </div>
          <span className="flex-1 text-left">Profile</span>
        </button>
      </div>
    </div>
  );
}