import { useState, useEffect } from 'react';
import { axiosPost } from '../utils/apiUtils';

interface VMTAInfo {
  name: string;
  rcp: number;
  kb: number;
  pctOfTotal: number;
  conn: number;
  dom: number;
}

interface IPMapping {
  ipAddress: string;
  domains: Set<string>;
  vmtas: VMTAInfo[];
}

export function useIPMappings(sessionId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipMappings, setIPMappings] = useState<IPMapping[]>([]);

  useEffect(() => {
    const fetchIPMappings = async () => {
      if (!sessionId) {
        return; // Silently return if no session ID - will retry when available
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosPost('/api/v1/pmta/command', {
          session_id: sessionId,
          command: 'show vmtas',
          format: 'json'
        });

        // Validate response structure with safe navigation
        const vmtas = response?.data?.vmtas;
        if (!Array.isArray(vmtas)) {
          throw new Error('Invalid response format: vmtas data is not an array');
        }

        const mappings = new Map<string, IPMapping>();

        vmtas.forEach((vmta: any) => {
          // Ensure vmta and vmta.name exist
          if (!vmta?.name) return;

          // Parse IP and domain from VMTA name (format: "IP-domain" or "IP-domain-type")
          const parts = String(vmta.name).split('-');
          if (parts.length < 2) return; // Skip invalid format

          const ipAddress = parts[0];
          // Join all parts except the first and last (in case it's a pool type)
          const domain = parts.slice(1, parts.length > 2 ? -1 : undefined).join('-');

          if (!mappings.has(ipAddress)) {
            mappings.set(ipAddress, {
              ipAddress,
              domains: new Set(),
              vmtas: []
            });
          }

          const mapping = mappings.get(ipAddress)!;
          mapping.domains.add(domain);
          
          // Safely parse numeric values with fallbacks
          mapping.vmtas.push({
            name: String(vmta.name),
            rcp: Number(vmta.rcp) || 0,
            kb: Number(vmta.kb) || 0,
            pctOfTotal: Number(vmta.pctOfTotal) || 0,
            conn: Number(vmta.conn) || 0,
            dom: Number(vmta.dom) || 0
          });
        });

        // Sort mappings by IP address
        const sortedMappings = Array.from(mappings.values())
          .sort((a, b) => a.ipAddress.localeCompare(b.ipAddress));

        setIPMappings(sortedMappings);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch IP mappings';
        setError(errorMessage);
        console.error('IP mappings error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIPMappings();
  }, [sessionId]);

  return { ipMappings, isLoading, error };
}