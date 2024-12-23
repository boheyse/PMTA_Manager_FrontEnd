import type { PMTANode } from './node';

export interface MetricDataPoint {
  timestamp: number;
  sent: number;
  deliveries: number;
  bounces: number;
}

export interface MetricData {
  stats: Array<{
    timestamp: number;
    sent: number;
    deliveries: number;
    bounces: number;
  }>;
  start_time: number;
  end_time: number;
  interval: string;
  timeframe: string;
  server_id: number;
  status: string;
  error: string | null;
}

export interface MetricsMap {
  [key: number]: MetricData;
}

export interface TimeRange {
  value: string;
  label: string;
}

export interface TimeWindow {
  value: string;
  label: string;
}

export interface MonitoringState {
  timeRange: string;
  timeWindow: string;
  servers: PMTANode[];
  metrics: MetricsMap;
  selectedServer: PMTANode | null;
  isLoading: boolean;
  error: string | null;
}

export interface MonitoringActions {
  setTimeRange: (range: string) => void;
  setTimeWindow: (window: string) => void;
  setServers: (servers: PMTANode[]) => void;
  setMetrics: (metrics: MetricsMap) => void;
  setSelectedServer: (server: PMTANode | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}