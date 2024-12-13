import React, { useState } from 'react';
import { Server, Eye } from 'lucide-react';
import { MetricChart } from './MetricChart';
import type { ServerMetrics } from '../../types/monitoring';
import type { MetricKey } from '../../types/monitoring';

interface ServerDashboardProps {
  name: string;
  hostname: string;
  metrics: ServerMetrics;
  onClick?: () => void;
}

export function ServerDashboard({ name, hostname, metrics, onClick }: ServerDashboardProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<MetricKey[]>(['sent', 'delivered', 'bounced']);

  // Transform metrics into chart data format
  const chartData = metrics.sent.map((point, index) => ({
    timestamp: point.timestamp,
    sent: point.value,
    delivered: (metrics.deliveryRate[index]?.value / 100) * point.value,
    bounced: (metrics.bounceRate[index]?.value / 100) * point.value
  }));

  const handleMetricToggle = (metric: MetricKey) => {
    setVisibleMetrics(prev => {
      if (prev.includes(metric)) {
        // If it's the only visible metric, don't remove it
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== metric);
      }
      return [...prev, metric];
    });
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">{name} - {hostname}</h2>
        </div>
        {onClick && (
          <button
            onClick={onClick}
            className="text-blue-500 hover:text-blue-600"
            title="View server details"
          >
            <Eye className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="h-[300px]">
        <MetricChart 
          data={chartData} 
          visibleMetrics={visibleMetrics}
          onToggleMetric={handleMetricToggle}
        />
      </div>
    </div>
  );
}