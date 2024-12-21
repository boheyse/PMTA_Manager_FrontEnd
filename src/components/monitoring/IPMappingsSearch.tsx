import React from 'react';
import { Search } from 'lucide-react';

interface IPMappingsSearchProps {
  ipSearchTerm: string;
  domainSearchTerm: string;
  onIPSearchChange: (value: string) => void;
  onDomainSearchChange: (value: string) => void;
}

export function IPMappingsSearch({
  ipSearchTerm,
  domainSearchTerm,
  onIPSearchChange,
  onDomainSearchChange
}: IPMappingsSearchProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search IP addresses..."
          value={ipSearchTerm}
          onChange={(e) => onIPSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search domains..."
          value={domainSearchTerm}
          onChange={(e) => onDomainSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}