import { useState, useEffect, useCallback } from 'react';
import { axiosGet } from '../utils/apiUtils';
import type { PMTANode } from '../types/node';
import type { MonitoringState, MetricsMap } from '../types/monitoring';
import { mockServers, generateMockMetrics } from '../mocks/monitoringData';

const USE_MOCK_DATA = false; // Toggle this to switch between mock and real API

export function useMonitoring(): MonitoringState & {
  fetchServers: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
} {
  const [timeRange, setTimeRange] = useState('2h');
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
      setServers(response);
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
        setIsLoading(false);
        return;
      }

      const metricsPromises = servers.map(server => 
        axiosGet(`/data/stats?server_id=${server.id}&timeframe=${timeRange}&interval=${timeWindow}`)
      );

      const results = await Promise.all(metricsPromises);
      
      const metricsMap: MetricsMap = {};
      results.forEach((result, index) => {
        if (result.status === 'success') {
          metricsMap[servers[index].id] = {
            stats: result.stats,
            start_time: result.start_time,
            end_time: result.end_time,
            interval: result.interval,
            timeframe: result.timeframe,
            server_id: result.server_id,
            status: result.status
          };
        }
      });

      setMetrics(metricsMap);
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error(err);
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