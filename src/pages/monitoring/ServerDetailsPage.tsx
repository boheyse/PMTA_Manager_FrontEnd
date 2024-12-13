import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, Tab } from 'react-bootstrap';
import { ServerDashboard } from '../../components/monitoring/ServerDashboard';
import { TimeRangeSelector } from '../../components/monitoring/TimeRangeSelector';
import { ServerOverview } from './components/ServerOverview';
import { DomainDetails } from './components/DomainDetails';
import { VMTADetails } from './components/VMTADetails';
import { useMonitoring } from '../../hooks/useMonitoring';

export function ServerDetailsPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!serverId || !servers.length) {
    return null;
  }

  const server = servers.find(s => s.id === serverId);
  if (!server) {
    return (
      <div className="p-6 text-center text-red-600">
        Server not found
      </div>
    );
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
            onTimeRangeChange={setTimeRange}
            timeWindow={timeWindow}
            onTimeWindowChange={setTimeWindow}
          />
        </div>

        {error ? (
          <div className="text-center text-red-600">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
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
            <Tab eventKey="queues" title="Queues">
              <VMTADetails
                server={server}
                timeRange={timeRange}
              />
            </Tab>
          </Tabs>
        )}
      </div>
    </div>
  );
}