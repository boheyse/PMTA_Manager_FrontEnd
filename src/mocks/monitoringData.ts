import { addHours, subHours, format } from 'date-fns';
import type { MetricDataPoint, ServerMetrics, MetricsMap } from '../types/monitoring';
import type { PMTANode } from '../types/node';

// Helper function to generate random metric data
function generateMetricData(
  startDate: Date,
  hours: number,
  baseValue: number,
  variance: number,
  minValue = 0,
  maxValue = 100
): MetricDataPoint[] {
  const data: MetricDataPoint[] = [];
  let currentDate = startDate;
  let currentValue = baseValue;

  for (let i = 0; i < hours * 12; i++) { // 5-minute intervals
    currentValue = Math.max(minValue, Math.min(maxValue,
      currentValue + (Math.random() - 0.5) * variance
    ));

    data.push({
      timestamp: currentDate.toISOString(),
      value: Number(currentValue.toFixed(2))
    });

    currentDate = addHours(currentDate, 1/12); // Add 5 minutes
  }

  return data;
}

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
  },
  {
    id: 'server3',
    name: 'Development PMTA',
    hostname: 'pmta-dev.example.com',
    description: 'Development server',
    setup_complete: true,
    ip_addresses: ['192.168.1.5'],
    domains: ['dev.example.com'],
    pool_types: [],
    status: 'connected'
  }
];

// Generate mock metrics for each server
export function generateMockMetrics(startDate: Date = new Date()): MetricsMap {
  const metricsMap: MetricsMap = {};

  mockServers.forEach((server, index) => {
    // Generate different base values for each server
    const baseMultiplier = 1 - (index * 0.2); // Decreasing performance for each server

    metricsMap[server.id] = {
      sent: generateMetricData(
        subHours(startDate, 24),
        24,
        10000 * baseMultiplier, // Base messages sent
        1000, // Variance in messages
        0, // Min value
        20000 // Max value
      ),
      deliveryRate: generateMetricData(
        subHours(startDate, 24),
        24,
        98 * baseMultiplier, // Base delivery rate
        2, // Variance
        80, // Min value
        100 // Max value
      ),
      bounceRate: generateMetricData(
        subHours(startDate, 24),
        24,
        2 * (2 - baseMultiplier), // Base bounce rate (inverse relationship)
        0.5, // Variance
        0, // Min value
        10 // Max value
      )
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