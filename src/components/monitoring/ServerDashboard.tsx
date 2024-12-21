import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Server, Eye } from 'lucide-react';
import { MetricChart } from './MetricChart';
import type { ServerMetrics } from '../../types/monitoring';
import { MetricKey } from '../../constants/monitoring';

interface ServerDashboardProps {
  name: string;
  hostname: string;
  metrics: ServerMetrics;
  onClick?: () => void;
  isLoading?: boolean;
}

export function ServerDashboard({ name, hostname, metrics, onClick, isLoading }: ServerDashboardProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<MetricKey[]>(['sent', 'delivered', 'bounced']);

  const handleMetricToggle = (metric: MetricKey) => {
    setVisibleMetrics(prev => {
      if (prev.includes(metric)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== metric);
      }
      return [...prev, metric];
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 relative">
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

      <div className="h-[300px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        <MetricChart 
          data={metrics?.stats || []} 
          visibleMetrics={visibleMetrics}
          onToggleMetric={handleMetricToggle}
        />
      </div>
    </div>
  );
}