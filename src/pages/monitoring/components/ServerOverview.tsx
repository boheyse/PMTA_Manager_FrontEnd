import React from 'react';
import { ServerDashboard } from '../../../components/monitoring/ServerDashboard';
import { DomainOverview } from './DomainOverview';
import { VMTAOverview } from './VMTAOverview';
import type { PMTANode } from '../../../types/node';
import type { ServerMetrics } from '../../../types/monitoring';

interface ServerOverviewProps {
  server: PMTANode;
  metrics: ServerMetrics;
  isLoading: boolean;
  timeRange: string;
}

export function ServerOverview({ server, metrics, isLoading, timeRange }: ServerOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <ServerDashboard
          name={server.name}
          hostname={server.hostname}
          metrics={metrics}
          isLoading={isLoading}
        />
        <VMTAOverview server={server} />
      </div>
      
      <div>
        <DomainOverview 
          server={server} 
          timeRange={timeRange}
        />
      </div>
    </div>
  );
}