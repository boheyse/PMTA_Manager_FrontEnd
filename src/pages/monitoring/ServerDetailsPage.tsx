import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, Tab } from 'react-bootstrap';
import { TimeRangeSelector } from '../../components/monitoring/TimeRangeSelector';
import { ServerOverview } from './components/ServerOverview';
import { DomainDetails } from './components/DomainDetails';
import { VMTADetails } from './components/VMTADetails';
import type { PMTANode } from '../../types/node';
import type { MetricsMap } from '../../types/monitoring';

interface LocationState {
  servers: PMTANode[];
  metrics: MetricsMap;
  timeRange: string;
  timeWindow: string;
}

export function ServerDetailsPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { servers, metrics, timeRange, timeWindow } = location.state as LocationState;
  // console.log("servers passed in", JSON.stringify(servers));

  if (!serverId || !servers) {
    return <div className="p-6 text-center text-red-600">Invalid server data</div>;
  }

  const server = servers.find(s => {
    return s.id === parseInt(serverId); 
  });

  console.log("server", JSON.stringify(server));

  if (!server) {
    return <div className="p-6 text-center text-red-600">Server not found</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/monitoring')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold">{server.name} - {server.hostname}</h1>
          </div>
          <TimeRangeSelector
            timeRange={timeRange}
            onTimeRangeChange={() => {}} // Read-only in details view
            timeWindow={timeWindow}
            onTimeWindowChange={() => {}} // Read-only in details view
          />
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'overview')}
          className="mb-4"
        >
          <Tab eventKey="overview" title="Overview">
            <ServerOverview
              server={server}
              metrics={metrics[server.id]}
            />
          </Tab>
          <Tab eventKey="domains" title="Domains">
            <DomainDetails
              server={server}
              timeRange={timeRange}
            />
          </Tab>
          <Tab eventKey="vmtas" title="VMTAs">
            <VMTADetails
              server={server}
              timeRange={timeRange}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}