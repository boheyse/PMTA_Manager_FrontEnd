import React from 'react';
import { METRICS } from '../../constants/monitoring';
import type { MetricKey } from '../../types/monitoring';

interface MetricLegendProps {
  visibleMetrics: MetricKey[];
  onToggleMetric: (metric: MetricKey) => void;
}

export function MetricLegend({ visibleMetrics, onToggleMetric }: MetricLegendProps) {
  return (
    <div className="flex justify-center space-x-6 mt-4">
      {METRICS.map(metric => (
        <button
          key={metric.key}
          onClick={() => onToggleMetric(metric.key)}
          className={`flex items-center space-x-2 text-sm transition-opacity ${
            visibleMetrics.includes(metric.key) ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: metric.color }}
          />
          <span>{metric.name}</span>
        </button>
      ))}
    </div>
  );
}