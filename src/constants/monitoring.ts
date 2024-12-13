import type { TimeRange, TimeWindow } from '../types/monitoring';

export const TIME_RANGES: TimeRange[] = [
  { value: '1h', label: 'Last 1 hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' }
];

export const TIME_WINDOWS: TimeWindow[] = [
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' }
];

export const METRICS = [
  { key: 'sent', name: 'Messages Sent', color: '#3B82F6' },
  { key: 'delivered', name: 'Delivered', color: '#10B981' },
  { key: 'bounced', name: 'Bounced', color: '#EF4444' }
] as const;

export type MetricKey = typeof METRICS[number]['key'];