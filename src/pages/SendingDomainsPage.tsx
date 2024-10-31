import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Search, ChevronRight, ChevronDown, Play, Pause, Square, Edit, AlertCircle } from 'lucide-react';
import { Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { DomainModal } from '../components/DomainModal';
import { QueueManagementModal } from '../components/QueueManagementModal';
import type { Domain, QueueStatus, ISPTarget } from '../types/domain';

export function SendingDomainsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | undefined>();
  const [selectedDomain, setSelectedDomain] = useState<Domain | undefined>();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableIPs = ['192.168.1.1', '192.168.1.2', '10.0.0.1', '10.0.0.2'];

  // Fetch domains on component mount
  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://127.0.0.1:5000/domains');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API response to match our Domain interface
      const transformedDomains: Domain[] = data['host-domains']
        .filter((hostDomain: any) => hostDomain.name !== '@*') // Filter out wildcard domain
        .map((hostDomain: any) => {
          const domainName = hostDomain.name.replace('@', '');
          const allVirtualMtas = hostDomain['virtual-mta-pools']
            .flatMap((pool: any) => pool['virtual_mtas'] || []);

          // Get unique IP addresses from all virtual MTAs
          const ipAddresses = [...new Set(
            allVirtualMtas.map((mta: any) => mta.smtp_source.ip_address)
          )];

          // Transform subdomains from virtual MTAs
          const subdomains = allVirtualMtas.map((mta: any) => ({
            name: mta.smtp_source.subdomain,
            ipAddress: mta.smtp_source.ip_address,
            queueStatus: 'Active' as QueueStatus, // Default status
            queueName: mta.name,
            queues: [
              // Gmail queue settings
              {
                name: `${domainName}-Gmail-Fresh`,
                ispTarget: 'Gmail' as ISPTarget,
                type: 'Fresh',
                speed: parseInt(mta['recipient-domains']
                  .find((rd: any) => rd.name === 'gmail.rollup')
                  ?.settings.max_msg_rate?.split('/')[0] || '0'),
                messageCount: 0, // This would need to come from another API endpoint
                status: 'Active' as QueueStatus
              },
              // Hotmail queue settings
              {
                name: `${domainName}-Hotmail-Fresh`,
                ispTarget: 'Hotmail' as ISPTarget,
                type: 'Fresh',
                speed: parseInt(mta['recipient-domains']
                  .find((rd: any) => rd.name === 'hotmail.rollup')
                  ?.settings.max_msg_rate?.split('/')[0] || '0'),
                messageCount: 0,
                status: 'Active' as QueueStatus
              },
              // Yahoo/AOL queue settings
              {
                name: `${domainName}-Yahoo/AOL-Fresh`,
                ispTarget: 'Yahoo/AOL' as ISPTarget,
                type: 'Fresh',
                speed: parseInt(mta['recipient-domains']
                  .find((rd: any) => rd.name === 'yahooaol.rollup')
                  ?.settings.max_msg_rate?.split('/')[0] || '0'),
                messageCount: 0,
                status: 'Active' as QueueStatus
              }
            ]
          }));

          // Create the domain object
          return {
            domain: domainName,
            ipAddresses,
            emailsSent: 0, // This would need to come from another API endpoint
            queue: 'Delivering',
            healthStatus: 'healthy',
            ispStatus: {
              'Gmail': 'Active',
              'Yahoo/AOL': 'Active',
              'Hotmail': 'Active'
            },
            subdomains
          };
        });

      setDomains(transformedDomains);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch domains');
      console.error('Error fetching domains:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: DomainFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const method = editingDomain ? 'PUT' : 'POST';
      const url = editingDomain 
        ? `http://localhost:5000/domains/${editingDomain.domain}`
        : 'http://localhost:5000/domains';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the domains list
      await fetchDomains();
      setIsModalOpen(false);
      setEditingDomain(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save domain');
      console.error('Error saving domain:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (domain: Domain) => {
    if (!window.confirm(`Are you sure you want to delete ${domain.domain}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/domains/${domain.domain}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the domains list
      await fetchDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete domain');
      console.error('Error deleting domain:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueueManagement = async (domain: Domain) => {
    setSelectedDomain(domain);
    setIsQueueModalOpen(true);
  };

  const handleSaveQueues = async (domainIndex: number, queues: Domain['subdomains'][0]['queues']) => {
    try {
      setIsLoading(true);
      setError(null);

      const domain = domains[domainIndex];
      const response = await fetch(`http://localhost:5000/domains/${domain.domain}/queues`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queues }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the domains list
      await fetchDomains();
      setIsQueueModalOpen(false);
      setSelectedDomain(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update queues');
      console.error('Error updating queues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatusColor = (status: Domain['healthStatus']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
    }
  };

  const toggleISPStatus = (domainIndex: number, isp: ISPTarget) => {
    setDomains(prevDomains => {
      const newDomains = [...prevDomains];
      const currentStatus = newDomains[domainIndex].ispStatus[isp];
      newDomains[domainIndex].ispStatus[isp] = currentStatus === 'Active' ? 'Paused' : 'Active';
      return newDomains;
    });
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setIsModalOpen(true);
  };

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Sending Domains</h1>
        <button 
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => {
            setEditingDomain(undefined);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Domain
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table hover>
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 w-8"></th>
              <th className="text-left p-4">Domain</th>
              <th className="text-left p-4">Health</th>
              <th className="text-left p-4">IP Addresses</th>
              <th className="text-left p-4">ISP Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain, domainIndex) => (
              <React.Fragment key={domain.domain}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <button onClick={() => toggleDomain(domain.domain)}>
                      {expandedDomains.includes(domain.domain) 
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />
                      }
                    </button>
                  </td>
                  <td className="p-4">{domain.domain}</td>
                  <td className="p-4">
                    <AlertCircle className={`w-5 h-5 ${getHealthStatusColor(domain.healthStatus)}`} />
                  </td>
                  <td className="p-4">{domain.ipAddresses.join(', ')}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {(Object.entries(domain.ispStatus) as [ISPTarget, QueueStatus][]).map(([isp, status]) => (
                        <button
                          key={isp}
                          onClick={() => toggleISPStatus(domainIndex, isp)}
                          className={`px-2 py-1 rounded-full text-xs ${
                            status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {isp}: {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQueueManagement(domain)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Manage Queues
                      </button>
                      <button
                        onClick={() => handleEdit(domain)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedDomains.includes(domain.domain) && (
                  <tr>
                    <td colSpan={6} className="p-4 bg-gray-50">
                      <div className="pl-8">
                        <table className="w-full">
                          <thead>
                            <tr className="text-sm text-gray-500">
                              <th className="text-left py-2">Subdomain</th>
                              <th className="text-left py-2">Queue Status</th>
                              <th className="text-left py-2">Queue Name</th>
                              <th className="text-left py-2">IP Address</th>
                              <th className="text-left py-2">Messages in Queue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {domain.subdomains.map((subdomain) => (
                              <tr key={subdomain.name} className="text-sm">
                                <td className="py-2">{subdomain.name}</td>
                                <td className="py-2">
                                  <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      subdomain.queueStatus === 'Active' 
                                        ? 'bg-green-100 text-green-800'
                                        : subdomain.queueStatus === 'Paused'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {subdomain.queueStatus}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2">{subdomain.queueName}</td>
                                <td className="py-2">{subdomain.ipAddress}</td>
                                <td className="py-2">
                                  {subdomain.queues.reduce((total, queue) => total + queue.messageCount, 0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      )}

      <DomainModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDomain(undefined);
        }}
        onSave={handleSave}
        editData={editingDomain}
        availableIPs={availableIPs}
      />

      {selectedDomain && (
        <QueueManagementModal
          isOpen={isQueueModalOpen}
          onClose={() => {
            setIsQueueModalOpen(false);
            setSelectedDomain(undefined);
          }}
          domain={selectedDomain.domain}
          queues={selectedDomain.subdomains[0].queues}
          onSave={(queues) => {
            const domainIndex = domains.findIndex(d => d.domain === selectedDomain.domain);
            handleSaveQueues(domainIndex, queues);
            setIsQueueModalOpen(false);
          }}
        />
      )}
    </div>
  );
} 