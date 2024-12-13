import type { PMTANode } from './node';

export interface MetricDataPoint {
  timestamp: string;
  value: number;
}

export interface ServerMetrics {
  sent: MetricDataPoint[];
  deliveryRate: MetricDataPoint[];
  bounceRate: MetricDataPoint[];
}

export interface MetricsMap {
  [key: string]: ServerMetrics;
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