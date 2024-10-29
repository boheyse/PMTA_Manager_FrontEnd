import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  placeholder: string;
}

export function SearchableSelect({ options, placeholder }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(placeholder);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between w-full px-3 py-2 border rounded-lg bg-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <div className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full bg-transparent border-none focus:outline-none"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}