import { useState, useEffect } from 'react';
import { axiosPost } from '../utils/apiUtils';
import type { PMTANode } from '../types/node';

interface DomainStats {
  domain: string;
  total_events: number;
  deliveries: number;
  bounces: number;
}

export function useDomainStats(server: PMTANode) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DomainStats[]>([]);

  useEffect(() => {
    const fetchDomainStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axiosPost('/data/stats2', {
          server_id: server.id,
          timeframe: "2h",
          interval: "5m",
          query_name: "sent_deliveries_bounces_by_domain",
          data_for_query: server.domains
        });

        if (response.status === 'success' && response.query_data) {
          setStats(response.query_data);
        }
      } catch (err) {
        setError('Failed to fetch domain stats');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (server.domains.length > 0) {
      fetchDomainStats();
    }
  }, [server]);

  return { stats, isLoading, error };
}