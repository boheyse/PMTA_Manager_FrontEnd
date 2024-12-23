import { useState, useEffect } from 'react';
import { axiosPost } from '../utils/apiUtils';
import type { PMTANode } from '../types/node';
import { debug } from '../utils/debug';

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
        // Log the incoming server domains structure
        debug.log('Raw server domains:', server.domains);

        const domainNames = server.domains.map(domain => String(domain.name));
        console.log('Extracted domain names:', domainNames);

        const requestData = {
          server_id: Number(server.id),
          timeframe: String(timeRange),
          query_name: "sent_deliveries_bounces_by_domain",
          data_for_query: domainNames
        };

        // Log the full request data
        debug.log('Domain stats request:', {
          ...requestData,
          server_name: server.name,
          domain_count: domainNames.length
        });

        const response = await axiosPost('/data/stats2', requestData);

        // Log the response structure
        console.log('Domain stats response:', {
          status: response.status,
          data_length: response.query_data?.length || 0,
          sample_data: response.query_data?.[0],
          timeframe: response.timeframe
        });

        if (response.status === 'success' && Array.isArray(response.query_data)) {
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
        console.error('Domain stats error:', {
          error: err,
          server_id: server.id,
          server_name: server.name,
          domain_count: server.domains?.length || 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (server.domains && server.domains.length > 0) {
      fetchDomainStats();
    } else {
      console.log('No domains found for server:', {
        server_id: server.id,
        server_name: server.name
      });
      setStats([]); // Reset stats if no domains
    }
  }, [server.id, server.domains, timeRange]);

  return { stats, isLoading, error };
}