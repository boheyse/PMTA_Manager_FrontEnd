import React from 'react';
import { ServerDashboard } from '../../../components/monitoring/ServerDashboard';
import { DomainOverview } from './DomainOverview';
import { VMTAOverview } from './VMTAOverview';
import type { PMTANode } from '../../../types/node';
import type { ServerMetrics } from '../../../types/monitoring';

interface ServerOverviewProps {
  server: PMTANode;
  metrics: ServerMetrics;
}

export function ServerOverview({ server, metrics }: ServerOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ServerDashboard
            name={server.name}
            hostname={server.hostname}
            metrics={metrics || {
              sent: [],
              deliveryRate: [],
              bounceRate: []
            }}
          />
        </div>
        <div className="space-y-6">
          <DomainOverview server={server} />
          <VMTAOverview server={server} />
        </div>
      </div>
    </div>
  );
}