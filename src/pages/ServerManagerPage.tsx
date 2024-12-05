import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Server, Search } from 'lucide-react';
import { mockNodes } from '../mocks/nodeData';
import type { Node } from '../types/node';
import { DomainDetailsModal } from '../components/server-manager/DomainDetailsModal';
import { SendingDomainsPage } from './SendingDomainsPage';

export function ServerManagerPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeServer, setActiveServer] = useState<Node | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setNodes(mockNodes);
  }, []);

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

  if (activeServer) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 p-4 mb-6 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Active Server:</span>
            <span>{activeServer.name}</span>
          </div>
          <button 
            onClick={() => {
              setActiveServer(null);
              setSelectedNode(null);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            Disconnect
          </button>
        </div>
        <SendingDomainsPage />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Servers</h2>
            <button
              onClick={() => navigate('/server-wizard')}
              className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              PMTA Server Wizard
            </button>
          </div>
        </div>

        <div className="p-4">
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

          <div className="grid grid-cols-1 gap-4">
            {filteredNodes.map(node => (
              <div
                key={node.id}
                onClick={() => handleNodeSelect(node)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedNode?.id === node.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
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
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      node.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {selectedNode?.id === node.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect();
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Connect to Server
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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