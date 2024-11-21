import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { SearchableSelect } from '../components/SearchableSelect';
import type { Domain } from '../types/domain';
import { getMappedDomainData } from './util/DomainsUtil';

interface IPMapping {
  ipAddress: string;
  domains: {
    domainName: string;
    poolName: string;
    queueName: string;
  }[];
  uniqueDomains: string[];
}

export function IPAddressesPage() {
  const [ipMappings, setIPMappings] = useState<IPMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIPs, setExpandedIPs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIPMappings();
  }, []);

  const fetchIPMappings = async () => {
    try {
      setIsLoading(true);
      const domains = await getMappedDomainData();
      const mappings = buildIPMappings(domains);
      setIPMappings(mappings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IP mappings');
    } finally {
      setIsLoading(false);
    }
  };

  const buildIPMappings = (domains: Domain[]): IPMapping[] => {
    const mappings: { [key: string]: IPMapping } = {};

    domains.forEach(domain => {
      domain.queuePools.forEach(pool => {
        pool.queues.forEach(queue => {
          queue.info.forEach(info => {
            if (!mappings[info.ipAddress]) {
              mappings[info.ipAddress] = {
                ipAddress: info.ipAddress,
                domains: [],
                uniqueDomains: []
              };
            }
            
            mappings[info.ipAddress].domains.push({
              domainName: domain.domainName,
              poolName: pool.poolName,
              queueName: info.queueName
            });

            // Add to unique domains if not already present
            if (!mappings[info.ipAddress].uniqueDomains.includes(domain.domainName)) {
              mappings[info.ipAddress].uniqueDomains.push(domain.domainName);
            }
          });
        });
      });
    });

    return Object.values(mappings).sort((a, b) => 
      a.ipAddress.localeCompare(b.ipAddress)
    );
  };

  const toggleIP = (ipAddress: string) => {
    setExpandedIPs(prev =>
      prev.includes(ipAddress)
        ? prev.filter(ip => ip !== ipAddress)
        : [...prev, ipAddress]
    );
  };

  const filteredIPs = ipMappings.filter(mapping =>
    mapping.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.uniqueDomains.some(domain =>
      domain.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">IP Addresses</h1>
      </div>

      <div className="mb-6">
        <SearchableSelect
          options={ipMappings.map(ip => ip.ipAddress)}
          placeholder="Search IP address"
          onChange={(selected) => setSearchTerm(selected[0] || '')}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 w-8"></th>
                <th className="text-left p-4">IP Address</th>
                <th className="text-left p-4">Assigned Domains</th>
                <th className="text-left p-4">Total Unique Domains</th>
              </tr>
            </thead>
            <tbody>
              {filteredIPs.map((mapping) => (
                <React.Fragment key={mapping.ipAddress}>
                  <tr 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleIP(mapping.ipAddress)}
                  >
                    <td className="p-4">
                      {expandedIPs.includes(mapping.ipAddress) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </td>
                    <td className="p-4">{mapping.ipAddress}</td>
                    <td className="p-4">
                      {mapping.uniqueDomains.slice(0, 3).join(', ')}
                      {mapping.uniqueDomains.length > 3 && '...'}
                    </td>
                    <td className="p-4">{mapping.uniqueDomains.length}</td>
                  </tr>
                  {expandedIPs.includes(mapping.ipAddress) && (
                    <tr>
                      <td colSpan={4} className="bg-gray-50 p-4">
                        <table className="w-full">
                          <thead>
                            <tr className="text-sm text-gray-500">
                              <th className="text-left py-2">Domain</th>
                              <th className="text-left py-2">Pool Name</th>
                              <th className="text-left py-2">Queue Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mapping.domains.map((domain, idx) => (
                              <tr key={`${domain.domainName}-${idx}`} className="text-sm">
                                <td className="py-2">{domain.domainName}</td>
                                <td className="py-2">{domain.poolName}</td>
                                <td className="py-2">{domain.queueName}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}