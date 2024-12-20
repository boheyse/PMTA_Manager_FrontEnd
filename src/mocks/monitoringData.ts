import { addMinutes, subHours, format } from 'date-fns';
import type { MetricDataPoint, ServerMetrics, MetricsMap } from '../types/monitoring';
import type { PMTANode } from '../types/node';

// Mock servers data
export const mockServers: PMTANode[] = [
  {
    id: 'server1',
    name: 'Primary PMTA',
    hostname: 'pmta1.example.com',
    description: 'Main production server',
    setup_complete: true,
    ip_addresses: ['192.168.1.1', '192.168.1.2'],
    domains: ['example.com', 'test.com'],
    pool_types: [],
    status: 'connected'
  },
  {
    id: 'server2',
    name: 'Secondary PMTA',
    hostname: 'pmta2.example.com',
    description: 'Backup server',
    setup_complete: true,
    ip_addresses: ['192.168.1.3', '192.168.1.4'],
    domains: ['example.com', 'test.com'],
    pool_types: [],
    status: 'connected'
  }
];

// Generate mock metrics for each server
export function generateMockMetrics(startDate: Date = new Date()): MetricsMap {
  const metricsMap: MetricsMap = {};
  const endTime = Math.floor(Date.now() / 1000);
  const startTime = endTime - 3600; // 1 hour ago

  mockServers.forEach((server, index) => {
    const stats: MetricDataPoint[] = [];
    const baseMultiplier = 1 - (index * 0.2); // Decreasing performance for each server

    // Generate data points every 5 minutes
    for (let timestamp = startTime; timestamp <= endTime; timestamp += 300) {
      const sent = Math.floor(2000 * baseMultiplier + Math.random() * 500);
      const bounces = Math.floor(sent * 0.02); // 2% bounce rate
      const deliveries = sent - bounces;

      stats.push({
        timestamp,
        sent,
        deliveries,
        bounces
      });
    }

    metricsMap[server.id] = {
      stats: stats.reverse(), // Most recent first
      start_time: startTime,
      end_time: endTime,
      interval: '5m',
      timeframe: '1h',
      server_id: parseInt(server.id.replace('server', '')),
      status: 'success'
    };
  });

  return metricsMap;
}

// Example of how to use the mock data
export const mockMetrics = generateMockMetrics();

// Helper function to get metrics for a specific time range
export function getMockMetricsForRange(
  startDate: Date,
  endDate: Date
): MetricsMap {
  return generateMockMetrics(startDate);
}