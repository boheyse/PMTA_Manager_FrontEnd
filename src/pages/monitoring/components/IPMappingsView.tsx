import React, { useState, useMemo } from 'react';
import { useIPMappings } from '../../../hooks/useIPMappings';
import { IPMappingsTable } from '../../../components/monitoring/IPMappingsTable';
import { IPMappingsSearch } from '../../../components/monitoring/IPMappingsSearch';
import type { PMTANode } from '../../../types/node';

interface IPMappingsViewProps {
  server: PMTANode;
  sessionId: string;
}

export function IPMappingsView({ server, sessionId }: IPMappingsViewProps) {
  const { ipMappings, isLoading, error } = useIPMappings(sessionId);
  const [expandedIPs, setExpandedIPs] = useState<string[]>([]);
  const [ipSearchTerm, setIPSearchTerm] = useState('');
  const [domainSearchTerm, setDomainSearchTerm] = useState('');

  const filteredMappings = useMemo(() => {
    return ipMappings.filter(mapping => {
      const ipMatch = mapping.ipAddress.toLowerCase().includes(ipSearchTerm.toLowerCase());
      const domainMatch = Array.from(mapping.domains).some(domain =>
        domain.toLowerCase().includes(domainSearchTerm.toLowerCase())
      );

      // If both search terms are present, require both to match
      if (ipSearchTerm && domainSearchTerm) {
        return ipMatch && domainMatch;
      }
      // If only one search term is present, match that one
      if (ipSearchTerm) return ipMatch;
      if (domainSearchTerm) return domainMatch;
      // If no search terms, show all
      return true;
    });
  }, [ipMappings, ipSearchTerm, domainSearchTerm]);

  const toggleIP = (ipAddress: string) => {
    setExpandedIPs(prev =>
      prev.includes(ipAddress)
        ? prev.filter(ip => ip !== ipAddress)
        : [...prev, ipAddress]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">IP Address Mappings</h2>
      
      <IPMappingsSearch
        ipSearchTerm={ipSearchTerm}
        domainSearchTerm={domainSearchTerm}
        onIPSearchChange={setIPSearchTerm}
        onDomainSearchChange={setDomainSearchTerm}
      />

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {error ? (
          <div className="text-red-600 p-4">{error}</div>
        ) : (
          <>
            {filteredMappings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No matches found for your search criteria
              </div>
            ) : (
              <IPMappingsTable 
                mappings={filteredMappings}
                expandedIPs={expandedIPs}
                onToggleIP={toggleIP}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}