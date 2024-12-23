import { useState, useEffect } from 'react';
import { axiosPost } from '../utils/apiUtils';
import type { PMTANode } from '../types/node';

interface DomainStats {
  domain: string;
  total_events: number;
  deliveries: number;
  bounces: number;
}

interface UseDomainStatsProps {
  server: PMTANode;
  timeRange: string;
}

export function useDomainStats({ server, timeRange }: UseDomainStatsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DomainStats[]>([]);

  useEffect(() => {
    const fetchDomainStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Create a plain serializable object for the request
        const requestData = {
          server_id: Number(server.id), // Fixed: Use Number() instead of int()
          timeframe: String(timeRange),
          query_name: "sent_deliveries_bounces_by_domain",
          data_for_query: server.domains.map(domain => String(domain.name)) // Simplified array mapping
        };

        const response = await axiosPost('/data/stats2', requestData);

        if (response.status === 'success' && Array.isArray(response.query_data)) {
          // Add null checks and default values
          const processedStats = response.query_data.map(stat => ({
            domain: String(stat.domain || ''),
            total_events: Number(stat.total_events || 0),
            deliveries: Number(stat.deliveries || 0),
            bounces: Number(stat.bounces || 0)
          }));
          setStats(processedStats);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch domain stats';
        setError(errorMessage);
        console.error('Domain stats error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (server.domains && server.domains.length > 0) {
      fetchDomainStats();
    } else {
      setStats([]); // Reset stats if no domains
    }
  }, [server.id, server.domains, timeRange]);

  return { stats, isLoading, error };
}