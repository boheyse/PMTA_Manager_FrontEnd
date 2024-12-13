import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Server } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ServerMetrics } from '../../types/monitoring';

interface ServerDetailsModalProps {
  show: boolean;
  onHide: () => void;
  name: string;
  hostname: string;
  metrics: ServerMetrics;
}

const METRICS = [
  { key: 'sent', name: 'Messages Sent', color: '#3B82F6' },
  { key: 'delivered', name: 'Delivered', color: '#10B981' },
  { key: 'bounced', name: 'Bounced', color: '#EF4444' }
] as const;

type MetricKey = typeof METRICS[number]['key'];

export function ServerDetailsModal({ 
  show, 
  onHide, 
  name, 
  hostname, 
  metrics 
}: ServerDetailsModalProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<MetricKey[]>(METRICS.map(m => m.key));

  // Transform metrics into chart data format
  const chartData = metrics.sent.map((point, index) => ({
    timestamp: point.timestamp,
    sent: point.value,
    delivered: (metrics.deliveryRate[index]?.value / 100) * point.value,
    bounced: (metrics.bounceRate[index]?.value / 100) * point.value
  }));

  const toggleMetric = (metric: MetricKey) => {
    setVisibleMetrics(prev => {
      if (prev.includes(metric)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== metric);
      }
      return [...prev, metric];
    });
  };

  const formatValue = (value: number, key: string, payload: any) => {
    if (!payload) return value.toLocaleString();
    
    const sent = payload.sent || 0;
    if (sent === 0) return '0%';

    switch (key) {
      case 'sent':
        return value.toLocaleString();
      case 'delivered':
      case 'bounced':
        return `${((value / sent) * 100).toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
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
                {metric.name}: {formatValue(entry.value, entry.dataKey, payload[0].payload)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-blue-500" />
          <span>{name} - {hostname}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              <Tooltip content={<CustomTooltip />} />
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

        <div className="flex justify-center space-x-6 mt-4">
          {METRICS.map(metric => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
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
      </Modal.Body>
    </Modal>
  );
}