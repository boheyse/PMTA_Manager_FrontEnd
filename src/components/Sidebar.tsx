import React from 'react';
import { Home, BarChart2, Mail, Network, Globe, Ban, InboxIcon, Inbox } from 'lucide-react';
import { NavLink } from './NavLink';

export function Sidebar() {
  return (
    <div className="w-64 bg-[#1b2a4e] min-h-screen text-gray-300 p-4">
      <div className="flex items-center mb-8">
        <Network className="w-8 h-8 text-emerald-500" />
        <span className="ml-2 text-xl font-semibold text-white">PMTA Manager</span>
      </div>
      
      <nav className="space-y-2">
        <NavLink to="/" icon={<Home size={20} />} text="Home" />
        <NavLink to="/stats" icon={<BarChart2 size={20} />} text="Stats" />
        <NavLink to="/sending-domains" icon={<Globe size={20} />} text="Sending Domains" />
        <NavLink to="/ip-addresses" icon={<Network size={20} />} text="IP Addresses" />
        <NavLink to="/mailboxes" icon={<Inbox size={20} />} text="Mailboxes" />
        <NavLink to="/mailbox-providers" icon={<Mail size={20} />} text="Mailbox Providers" />
        <NavLink to="/bounces" icon={<Ban size={20} />} text="Bounces" />
        <NavLink to="/email-logs" icon={<InboxIcon size={20} />} text="Email Logs" />
      </nav>
    </div>
  );
}