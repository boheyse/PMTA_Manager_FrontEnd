import React from 'react';
import { METRICS } from '../../constants/monitoring';
import { formatMetricValue } from '../../utils/monitoring';
import type { MetricKey } from '../../types/monitoring';

interface MetricTooltipProps {
  active: boolean;
  payload: any[];
  label: string;
  visibleMetrics: MetricKey[];
}

export function MetricTooltip({ active, payload, label, visibleMetrics }: MetricTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border rounded shadow-lg">
      <p className="text-sm text-gray-600 mb-2">
        {new Date(label).toLocaleString()}
      </p>
      {payload.map((entry: any) => {
        const metric = METRICS.find(m => m.key === entry.dataKey);
        if (!metric || !visibleMetrics.includes(metric.key)) return null;

        return (
          <div key={entry.dataKey} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              {metric.name}: {formatMetricValue(entry.value, entry.dataKey, payload[0].payload)}
            </span>
          </div>
        );
      })}
    </div>
  );
}