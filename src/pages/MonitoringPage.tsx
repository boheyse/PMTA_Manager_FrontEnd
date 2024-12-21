import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeRangeSelector } from '../components/monitoring/TimeRangeSelector';
import { ServerDashboard } from '../components/monitoring/ServerDashboard';
import { useMonitoring } from '../hooks/useMonitoring';

export function MonitoringPage() {
  const navigate = useNavigate();
  const {
    timeRange,
    timeWindow,
    servers,
    metrics,
    isLoading,
    error,
    setTimeRange,
    setTimeWindow,
  } = useMonitoring();

  const handleServerClick = (serverId: number) => {
    navigate(`/monitoring/${serverId}`, { 
      state: { 
        servers,
        metrics,
        timeRange,
        timeWindow
      } 
    });
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Server Monitoring</h1>
        <TimeRangeSelector
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {servers.map(server => (
          <ServerDashboard
            key={server.id}
            name={server.name}
            hostname={server.hostname}
            metrics={metrics[server.id]}
            onClick={() => handleServerClick(server.id)}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}