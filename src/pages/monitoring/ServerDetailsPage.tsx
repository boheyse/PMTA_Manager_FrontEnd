import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, Tab } from 'react-bootstrap';
import { TimeRangeSelector } from '../../components/monitoring/TimeRangeSelector';
import { ServerOverview } from './components/ServerOverview';
import { DomainDetails } from './components/DomainDetails';
import { VMTADetails } from './components/VMTADetails';
import { IPMappingsView } from './components/IPMappingsView';
import { useServerConnection } from '../../hooks/useServerConnection';
import { axiosPost } from '../../utils/apiUtils';
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

  // Connect to server and get session ID in the background
  const { sessionId, isConnecting, error: connectionError, retryAttempt } = useServerConnection({
    hostname: server.hostname
  });

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const requestData = {
          server_id: Number(serverId),
          timeframe: String(timeRange),
          interval: String(timeWindow),
          query_name: "sent_deliveries_bounces_by_timestamp_and_interval"
        };

        const response = await axiosPost('/data/stats2', requestData);

        if (response.status === 'success') {
          const stats = response.query_data.map(point => ({
            timestamp: Number(point.bucket),
            sent: Number(point.total_events),
            deliveries: Number(point.deliveries),
            bounces: Number(point.bounces)
          }));

          setMetrics(prev => ({
            ...prev,
            [serverId]: {
              stats,
              start_time: Number(response.start_time),
              end_time: Number(response.end_time),
              interval: String(response.interval),
              timeframe: String(response.timeframe),
              server_id: Number(response.server_id),
              status: String(response.status)
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

    fetchMetrics();
  }, [serverId, timeRange, timeWindow]);

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

        {/* Show connection retry status */}
        {connectionError && retryAttempt > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">Connection issue: {connectionError}</p>
              <p className="text-sm mt-1">
                Attempting to reconnect... (Attempt {retryAttempt}/3)
              </p>
            </div>
            {isConnecting && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-700 border-t-transparent"></div>
            )}
          </div>
        )}

        {/* Show metrics error if any */}
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
              timeRange={timeRange}
            />
          </Tab>
          <Tab eventKey="domains" title="Domains">
            <DomainDetails
              server={server}
              timeRange={timeRange}
            />
          </Tab>
          <Tab eventKey="ip-addresses" title="IP Addresses">
            <IPMappingsView
              server={server}
              sessionId={sessionId}
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