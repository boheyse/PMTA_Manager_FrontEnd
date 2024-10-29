import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';

export function Header() {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-2">
        <Menu className="w-5 h-5" />
        <span className="text-blue-600">Email API/SMTP</span>
        <ChevronDown className="w-4 h-4" />
        <span className="font-semibold">Stats</span>
      </div>
      
      <div className="flex items-center space-x-6">
        <span className="text-[#1b2a4e] font-medium">Emails Sent: 1,234</span>
        <span className="text-emerald-700 font-medium">Emails Delivered: 1,230</span>
        <span className="text-red-700 font-medium">Emails Bounced: 4</span>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            B
          </div>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}