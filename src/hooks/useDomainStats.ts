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
        const domainNames = server.domains.map(domain => String(domain.name));
        debug.log(`Fetching stats for ${server.name}`, {
          domains: domainNames,
          timeRange,
          serverId: server.id
        });

        const requestData = {
          server_id: Number(server.id),
          timeframe: String(timeRange),
          query_name: "sent_deliveries_bounces_by_domain",
          data_for_query: domainNames
        };

        debug.log(`Request payload for ${server.name}`, requestData);

        const response = await axiosPost('/data/stats2', requestData);

        debug.log(`Response for ${server.name}`, {
          status: response.status,
          domains_returned: response.query_data?.length || 0,
          first_domain: response.query_data?.[0]?.domain,
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
        debug.error(`Failed to fetch stats for ${server.name}`, {
          error: err,
          server_id: server.id,
          domain_count: server.domains?.length || 0,
          timeRange
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (server.domains && server.domains.length > 0) {
      fetchDomainStats();
    } else {
      debug.warn(`No domains found for server ${server.name}`, {
        server_id: server.id,
        timeRange
      });
      setStats([]);
    }
  }, [server.id, server.domains, timeRange, server.name]);

  return { stats, isLoading, error };
}