import React from 'react';
import { METRICS } from '../../constants/monitoring';
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
        {new Date(label * 1000).toLocaleString()}
      </p>
      {payload.map((entry: any) => {
        const metric = METRICS.find(m => {
          if (entry.dataKey === 'deliveries') return m.key === 'delivered';
          if (entry.dataKey === 'bounces') return m.key === 'bounced';
          return m.key === entry.dataKey;
        });
        
        if (!metric || !visibleMetrics.includes(metric.key)) return null;

        return (
          <div key={entry.dataKey} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              {metric.name}: {entry.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}