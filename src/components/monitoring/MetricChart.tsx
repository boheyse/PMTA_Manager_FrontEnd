import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { METRICS } from '../../constants/monitoring';
import { MetricTooltip } from './MetricTooltip';
import { MetricLegend } from './MetricLegend';
import type { MetricKey } from '../../types/monitoring';

interface MetricDataPoint {
  timestamp: string;
  sent: number;
  delivered: number;
  bounced: number;
}

interface MetricChartProps {
  data: MetricDataPoint[];
  title?: string;
  visibleMetrics: MetricKey[];
  onToggleMetric: (metric: MetricKey) => void;
}

export function MetricChart({ data, title, visibleMetrics, onToggleMetric }: MetricChartProps) {
  return (
    <div className="flex flex-col h-full">
      {title && <div className="text-lg font-medium text-gray-700 mb-2">{title}</div>}
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={
              (props) => <MetricTooltip {...props} visibleMetrics={visibleMetrics} />
            } />
            {METRICS.map(metric => (
              visibleMetrics.includes(metric.key) && (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  dot={false}
                  strokeWidth={2}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <MetricLegend 
        visibleMetrics={visibleMetrics} 
        onToggleMetric={onToggleMetric}
      />
    </div>
  );
}