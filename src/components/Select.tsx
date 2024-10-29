import React from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SelectProps {
  options: string[];
  defaultValue: string;
}

export function Select({ options, defaultValue }: SelectProps) {
  return (
    <div className="relative">
      <select className="appearance-none px-3 py-1.5 pr-8 border rounded-lg bg-white">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
    </div>
  );
}