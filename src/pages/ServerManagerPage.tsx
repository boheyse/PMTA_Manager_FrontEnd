import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Server, Settings, Search, ChevronRight } from 'lucide-react';
import { ConfigureServerModal } from '../components/server-manager/ConfigureServerModal';
import { mockNodes } from '../mocks/nodeData';
import type { Node } from '../types/node';
import { DomainDetailsModal } from '../components/server-manager/DomainDetailsModal';

export function ServerManagerPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeServer, setActiveServer] = useState<Node | null>(null);
  const navigate = useNavigate();

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
    setShowConfigureModal(false);
  };

  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node);
  };

  const handleConnect = () => {
    if (selectedNode) {
      setActiveServer(selectedNode);
    }
  };

  const handleDomainClick = (domain: string) => {
    setSelectedDomain(domain);
    setShowDomainModal(true);
  };

  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mockDomains = [
    'example.com',
    'test.com',
    'demo.com'
  ];

  return (
    <div className="p-6">
      {activeServer && (
        <div className="bg-blue-50 p-4 mb-6 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Active Server:</span>
            <span>{activeServer.name}</span>
          </div>
          <button 
            onClick={() => setActiveServer(null)}
            className="text-blue-500 hover:text-blue-700"
          >
            Disconnect
          </button>
        </div>
      )}

      <div className="flex space-x-6">
        {/* Server List */}
        <div className="w-1/3">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Servers</h2>
              <button
                onClick={() => setShowConfigureModal(true)}
                className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Configure Server
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search servers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => handleNodeSelect(node)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    selectedNode?.id === node.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Server className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{node.name}</div>
                        <div className="text-sm text-gray-500">{node.host}</div>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      node.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Server Details & Domains */}
        <div className="flex-1">
          {selectedNode ? (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Server Details</h2>
                <button
                  onClick={handleConnect}
                  disabled={activeServer?.id === selectedNode.id}
                  className={`px-4 py-2 rounded-lg ${
                    activeServer?.id === selectedNode.id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {activeServer?.id === selectedNode.id ? 'Connected' : 'Connect to Server'}
                </button>
              </div>

              {activeServer?.id === selectedNode.id && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Available Domains</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {mockDomains.map(domain => (
                      <div
                        key={domain}
                        onClick={() => handleDomainClick(domain)}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      >
                        <span>{domain}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Server Selected</h3>
              <p className="text-gray-500">Select a server from the list to view its details</p>
            </div>
          )}
        </div>
      </div>

      <ConfigureServerModal
        show={showConfigureModal}
        onHide={() => setShowConfigureModal(false)}
        onSubmit={handleAddNode}
      />

      <DomainDetailsModal
        show={showDomainModal}
        onHide={() => setShowDomainModal(false)}
        domain={selectedDomain}
        onEditQueue={() => {
          setShowDomainModal(false);
          navigate(`/domain-editor/${selectedDomain}`);
        }}
      />
    </div>
  );
}