import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Plus, Server, Search, Trash2 } from 'lucide-react';
import type { PMTANode } from '../types/node';
import { DomainDetailsModal } from '../components/server-manager/DomainDetailsModal';
import { SendingDomainsPage } from './SendingDomainsPage';
import { TemplatesPage } from './TemplatesPage';
import { Navigation } from '../components/server-manager/Navigation';
import { axiosGet, axiosDelete } from '../utils/apiUtils';
import { toast } from 'react-toastify';

export function ServerManagerPage() {
  const [nodes, setNodes] = useState<PMTANode[]>([]);
  const [selectedNode, setSelectedNode] = useState<PMTANode | null>(null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeServer, setActiveServer] = useState<PMTANode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setIsLoading(true);
        const response = await axiosGet('/api/v1/servers');
        setNodes(response);
      } catch (err) {
        console.error('Failed to fetch servers:', err);
        setError('Failed to load servers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
  }, []);

  const handleNodeSelect = (node: PMTANode) => {
    setSelectedNode(node);
    if (!node.setup_complete) {
      navigate('/server-wizard', { 
        state: { 
          serverName: node.name,
          hostname: node.hostname,
          nodeId: node.id
        } 
      });
    }
  };

  const handleConnect = () => {
    if (selectedNode && selectedNode.setup_complete) {
      setActiveServer(selectedNode);
    }
  };

  const handleDeleteServer = async (nodeId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this server? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await axiosDelete(`/api/v1/server/${nodeId}`);
      toast.success('Server deleted successfully', {
        autoClose: 2000,
      });
      
      // Remove the server from the local state
      setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
      
      // Reset selections if the deleted server was selected
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      if (activeServer?.id === nodeId) {
        setActiveServer(null);
      }
    } catch (error) {
      console.error('Failed to delete server:', error);
      toast.error('Failed to delete server. Please try again.');
    }
  };

  const handleDomainClick = (domain: string) => {
    setSelectedDomain(domain);
    setShowDomainModal(true);
  };

  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderServerContent = () => {
    if (isLoading) {
      return <div className="p-6 text-center">Loading servers...</div>;
    }

    if (error) {
      return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    if (activeServer && activeServer.setup_complete) {
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
                        <div className="text-sm text-gray-500">{node.hostname}</div>
                        {!node.setup_complete && (
                          <div className="text-sm text-orange-500">Setup required</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        node.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex items-center space-x-2">
                        {selectedNode?.id === node.id && node.setup_complete && (
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteServer(node.id);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                          title="Delete Server"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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
  };

  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/" element={renderServerContent()} />
        <Route path="/templates" element={<TemplatesPage />} />
      </Routes>
    </div>
  );
}