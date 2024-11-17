import React, { useState, useEffect } from 'react';
import { SearchableSelect } from '../components/SearchableSelect';
import { Plus } from 'lucide-react';
import { ConnectNodeModal } from '../components/status/ConnectNodeModal';
import { NodeStats } from '../components/status/NodeStats';
import { StatCard } from '../components/StatCard';
import { DateRangeSelector } from '../components/status/DateRangeSelector';
import { mockNodes } from '../mocks/nodeData';
import type { Node } from '../types/node';

export function StatusPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>('all');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // Load mock data on component mount
  useEffect(() => {
    setNodes(mockNodes);
  }, []);

  const handleAddNode = (newNode: Omit<Node, 'id' | 'status' | 'stats'>) => {
    const node: Node = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'connected',
      stats: {
        emailsSent: 0,
        emailsDelivered: 0,
        emailsBounced: 0,
        uniqueOpenRate: 0,
        clickRate: 0,
        bounceRate: 0,
        spamComplaints: 0
      },
      ...newNode
    };
    setNodes(prev => [...prev, node]);
    setShowConnectModal(false);
  };

  // Calculate total statistics
  const totalStats = nodes.reduce(
    (acc, node) => ({
      emailsSent: acc.emailsSent + node.stats.emailsSent,
      emailsDelivered: acc.emailsDelivered + node.stats.emailsDelivered,
      emailsBounced: acc.emailsBounced + node.stats.emailsBounced,
      activeNodes: acc.activeNodes + (node.status === 'connected' ? 1 : 0),
      backoffRate: acc.backoffRate + (node.stats.bounceRate > 5 ? 1 : 0),
    }),
    { emailsSent: 0, emailsDelivered: 0, emailsBounced: 0, activeNodes: 0, backoffRate: 0 }
  );

  const filteredNodes = selectedNode === 'all' 
    ? nodes 
    : nodes.filter(node => node.name === selectedNode);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Status Overview</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <SearchableSelect 
          options={['All Nodes', ...nodes.map(node => node.name)]}
          placeholder="All Nodes"
          onChange={(selected) => setSelectedNode(selected[0] || 'all')}
        />
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {nodes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No nodes connected</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by connecting your first node
          </p>
          <button
            onClick={() => setShowConnectModal(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Connect Node
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              title="Total Emails Sent"
              value={totalStats.emailsSent.toLocaleString()}
              info="Total number of emails sent across all nodes"
            />
            <StatCard
              title="Delivery Rate"
              value={`${((totalStats.emailsDelivered / totalStats.emailsSent) * 100).toFixed(1)}%`}
              info="Percentage of successfully delivered emails"
              highlight
            />
            <StatCard
              title="Bounce Rate"
              value={`${((totalStats.emailsBounced / totalStats.emailsSent) * 100).toFixed(1)}%`}
              info="Percentage of bounced emails"
            />
            <StatCard
              title="Active Nodes"
              value={`${totalStats.activeNodes}/${nodes.length}`}
              info="Number of currently connected nodes"
            />
            <StatCard
              title="Backoff Rate"
              value={`${((totalStats.backoffRate / nodes.length) * 100).toFixed(1)}%`}
              info="Percentage of nodes in backoff state"
            />
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Connected Nodes</h2>
            </div>
            <div className="divide-y">
              {filteredNodes.map(node => (
                <NodeStats key={node.id} node={node} />
              ))}
            </div>
          </div>
        </div>
      )}

      <ConnectNodeModal
        show={showConnectModal}
        onHide={() => setShowConnectModal(false)}
        onSubmit={handleAddNode}
      />
    </div>
  );
}