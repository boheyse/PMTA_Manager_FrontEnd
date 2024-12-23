import { useState, useEffect, useCallback } from 'react';
import { axiosGet, axiosPost } from '../utils/apiUtils';
import type { PMTANode } from '../types/node';
import type { MonitoringState, MetricsMap } from '../types/monitoring';
import { mockServers, generateMockMetrics } from '../mocks/monitoringData';

const USE_MOCK_DATA = false;

export function useMonitoring(): MonitoringState & {
  fetchServers: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
} {
  const [timeRange, setTimeRange] = useState('1h');
  const [timeWindow, setTimeWindow] = useState('5m');
  const [servers, setServers] = useState<PMTANode[]>([]);
  const [metrics, setMetrics] = useState<MetricsMap>({});
  const [selectedServer, setSelectedServer] = useState<PMTANode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    try {
      if (USE_MOCK_DATA) {
        setServers(mockServers);
        return;
      }

      const response = await axiosGet('/api/v1/servers');
      // Ensure we only store serializable data
      const processedServers = response.map((server: PMTANode) => ({
        ...server,
        id: Number(server.id),
        domains: Array.isArray(server.domains) 
          ? server.domains.map(domain => ({
              name: String(domain.name),
              vmtas: Array.isArray(domain.vmtas) 
                ? domain.vmtas.map(vmta => String(vmta))
                : []
            }))
          : [],
        ip_addresses: Array.from(server.ip_addresses, ip => String(ip)),
        pool_types: server.pool_types.map(pool => ({
          ...pool,
          pool_type: String(pool.pool_type),
          isps: pool.isps.map(isp => ({
            name: String(isp.name),
            settings: isp.settings.map(setting => ({
              key: String(setting.key),
              value: String(setting.value)
            }))
          }))
        }))
      }));
      setServers(processedServers);
    } catch (err) {
      setError('Failed to fetch servers');
      console.error(err);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    if (!servers.length) return;

    setIsLoading(true);
    try {
      if (USE_MOCK_DATA) {
        const mockData = generateMockMetrics();
        setMetrics(mockData);
        return;
      }

      const metricsMap: MetricsMap = {};
      
      // Process each server individually to prevent one failure from affecting others
      await Promise.all(
        servers.map(async (server) => {
          try {
            const requestData = {
              server_id: Number(server.id),
              timeframe: String(timeRange),
              interval: String(timeWindow),
              query_name: "sent_deliveries_bounces_by_timestamp_and_interval"
            };
            
            const result = await axiosPost('/data/stats2', requestData);

            if (result.status === 'success') {
              const stats = result.query_data.map(point => ({
                timestamp: Number(point.bucket),
                sent: Number(point.total_events),
                deliveries: Number(point.deliveries),
                bounces: Number(point.bounces)
              }));

              metricsMap[server.id] = {
                stats,
                start_time: Number(result.start_time),
                end_time: Number(result.end_time),
                interval: String(result.interval),
                timeframe: String(result.timeframe),
                server_id: Number(result.server_id),
                status: String(result.status),
                error: null
              };
            }
          } catch (err) {
            // Handle individual server errors
            metricsMap[server.id] = {
              stats: [],
              start_time: 0,
              end_time: 0,
              interval: timeWindow,
              timeframe: timeRange,
              server_id: server.id,
              status: 'error',
              error: err instanceof Error ? err.message : 'Failed to fetch metrics'
            };
            console.error(`Failed to fetch metrics for server ${server.name}:`, err);
          }
        })
      );

      setMetrics(metricsMap);
    } catch (err) {
      setError('Some servers failed to load metrics');
      console.error('Metrics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [servers, timeRange, timeWindow]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  useEffect(() => {
    if (servers.length > 0) {
      fetchMetrics();
    }
  }, [servers, timeRange, timeWindow, fetchMetrics]);

  return {
    timeRange,
    timeWindow,
    servers,
    metrics,
    selectedServer,
    isLoading,
    error,
    setTimeRange,
    setTimeWindow,
    setServers,
    setMetrics,
    setSelectedServer,
    setIsLoading,
    setError,
    fetchServers,
    fetchMetrics
  };
}