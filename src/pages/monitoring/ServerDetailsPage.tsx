import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, Tab } from 'react-bootstrap';
import { TimeRangeSelector } from '../../components/monitoring/TimeRangeSelector';
import { ServerOverview } from './components/ServerOverview';
import { DomainDetails } from './components/DomainDetails';
import { VMTADetails } from './components/VMTADetails';
import { axiosGet } from '../../utils/apiUtils';
import type { PMTANode } from '../../types/node';
import type { MetricsMap, ServerMetrics } from '../../types/monitoring';

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
  const [timeRange, setTimeRange] = useState(location.state?.timeRange || '1h');
  const [timeWindow, setTimeWindow] = useState(location.state?.timeWindow || '5m');
  const [metrics, setMetrics] = useState<MetricsMap>(location.state?.metrics || {});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { servers } = location.state as LocationState;

  if (!serverId || !servers) {
    return <div className="p-6 text-center text-red-600">Invalid server data</div>;
  }

  const server = servers.find(s => s.id === parseInt(serverId));

  if (!server) {
    return <div className="p-6 text-center text-red-600">Server not found</div>;
  }

  // Function to fetch updated metrics
  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosGet(
        `/data/stats?server_id=${serverId}&timeframe=${timeRange}&interval=${timeWindow}`
      );
      
      if (response.status === 'success') {
        setMetrics(prev => ({
          ...prev,
          [serverId]: {
            stats: response.stats,
            start_time: response.start_time,
            end_time: response.end_time,
            interval: response.interval,
            timeframe: response.timeframe,
            server_id: response.server_id,
            status: response.status
          }
        }));
      }
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update metrics when timeRange or timeWindow changes
  useEffect(() => {
    fetchMetrics();
  }, [timeRange, timeWindow]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  const handleTimeWindowChange = (window: string) => {
    setTimeWindow(window);
  };

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
            onTimeRangeChange={handleTimeRangeChange}
            timeWindow={timeWindow}
            onTimeWindowChange={handleTimeWindowChange}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'overview')}
          className="mb-4"
        >
          <Tab eventKey="overview" title="Overview">
            <ServerOverview
              server={server}
              metrics={metrics[server.id]}
              isLoading={isLoading}
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