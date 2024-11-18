import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, Tab } from 'react-bootstrap';
import { useSidebar } from '../context/SidebarContext';
import { NodeOverview } from '../components/status/NodeOverview';
import { DomainHealthGrid } from '../components/status/DomainHealthGrid';
import { ISPMetrics } from '../components/status/ISPMetrics';
import { NodeSettings } from '../components/status/NodeSettings';
import { NodeLogs } from '../components/status/NodeLogs';
import { mockNodes } from '../mocks/nodeData';
import type { Node } from '../types/node';

export function NodeDetailsPage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const { setShowSidebar } = useSidebar();
  const [node, setNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setShowSidebar(false);
    return () => setShowSidebar(true);
  }, [setShowSidebar]);

  useEffect(() => {
    // In a real app, fetch node data from API
    const foundNode = mockNodes.find(n => n.id === nodeId);
    setNode(foundNode || null);
  }, [nodeId]);

  if (!node) {
    return <div>Node not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/status')} 
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold">{node.name}</h1>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'overview')}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Overview">
          <NodeOverview node={node} />
        </Tab>
        <Tab eventKey="domains" title="Domain Health">
          <DomainHealthGrid nodes={[node]} />
        </Tab>
        <Tab eventKey="isps" title="ISP Metrics">
          <ISPMetrics nodes={[node]} />
        </Tab>
        <Tab eventKey="settings" title="Settings">
          <NodeSettings node={node} />
        </Tab>
        <Tab eventKey="logs" title="Logs">
          <NodeLogs node={node} />
        </Tab>
      </Tabs>
    </div>
  );
}