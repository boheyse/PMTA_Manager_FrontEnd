import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, ChevronRight, ChevronDown, Edit } from 'lucide-react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { DomainModal } from '../components/DomainModal';
import { QueueManagementModal } from '../components/QueueManagementModal';
import { SearchableSelect } from '../components/SearchableSelect';
import type { Domain, QueueStatus, ISPTarget, Subdomain } from '../types/domain';

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
  const [availableIPs, setAvailableIPs] = useState<string[]>([]);
  const [selectedSubdomain, setSelectedSubdomain] = useState<Subdomain | undefined>();

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
      
      const allIPs = new Set<string>();
      data['host-domains'].forEach((hostDomain: any) => {
        hostDomain['virtual-mta-pools'].forEach((pool: any) => {
          (pool['virtual_mtas'] || []).forEach((mta: any) => {
            if (mta.smtp_source?.ip_address) {
              allIPs.add(mta.smtp_source.ip_address);
            }
          });
        });
      });
      setAvailableIPs([...allIPs]);

      const transformedDomains: Domain[] = data['host-domains']
        .filter((hostDomain: any) => hostDomain.name !== '@*')
        .map((hostDomain: any) => {
          const domainName = hostDomain.name.replace('@', '');
          const allVirtualMtas = hostDomain['virtual-mta-pools']
            .flatMap((pool: any) => pool['virtual_mtas'] || []);

          const ipAddresses = [...new Set(
            allVirtualMtas.map((mta: any) => mta.smtp_source.ip_address)
          )];

          const subdomains = allVirtualMtas.map((mta: any) => ({
            name: mta.smtp_source.subdomain,
            ipAddress: mta.smtp_source.ip_address,
            queueStatus: 'Active' as QueueStatus,
            queueName: mta.name,
            recipientDomains: mta['recipient-domains'].map((rd: any) => ({
              name: rd.name,
              settings: rd.settings
            })),
            queues: [
              {
                name: `${domainName}-Gmail-Fresh`,
                ispTarget: 'Gmail' as ISPTarget,
                type: 'Fresh',
                speed: parseInt(mta['recipient-domains']
                  .find((rd: any) => rd.name === 'gmail.rollup')
                  ?.settings.max_msg_rate?.split('/')[0] || '0'),
                messageCount: 0,
                status: 'Active' as QueueStatus
              },
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

          return {
            domain: domainName,
            ipAddresses,
            emailsSent: 0,
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

      await fetchDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete domain');
      console.error('Error deleting domain:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueueManagement = async (domain: Domain, subdomain: Subdomain) => {
    setSelectedDomain(domain);
    setSelectedSubdomain(subdomain);
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
    <div className="p-6">
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
        <SearchableSelect
          options={domains.map(domain => domain.domain)}
          placeholder="Search domains..."
          onChange={(selected) => setSearchTerm(selected[0] || '')}
          className="w-full"
        />
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 w-8"></th>
                <th className="text-left p-4">Domain</th>
                <th className="text-left p-4">IP Addresses</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDomains.map((domain, domainIndex) => (
                <React.Fragment key={domain.domain}>
                  <tr 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleDomain(domain.domain)}
                  >
                    <td className="p-4">
                      {expandedDomains.includes(domain.domain) 
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />
                      }
                    </td>
                    <td className="p-4">{domain.domain}</td>
                    <td className="p-4">{domain.ipAddresses.join(', ')}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(domain);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(domain);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedDomains.includes(domain.domain) && (
                    <tr>
                      <td colSpan={4} className="p-4 bg-gray-50">
                        <div className="pl-8">
                          <table className="w-full">
                            <thead>
                              <tr className="text-sm text-gray-500">
                                <th className="text-left py-2">Subdomain</th>
                                <th className="text-left py-2">Queue Name</th>
                                <th className="text-left py-2">IP Address</th>
                                <th className="text-left py-2">Messages in Queue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {domain.subdomains.map((subdomain, subIndex) => (
                                <tr key={`${domain.domain}-${subdomain.name}-${subIndex}`} className="text-sm">
                                  <td className="py-2">{subdomain.name}</td>
                                  <td className="py-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQueueManagement(domain, subdomain);
                                      }}
                                      className="text-blue-500 hover:text-blue-700"
                                    >
                                      {subdomain.queueName}
                                    </button>
                                  </td>
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
          </table>
        </div>
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

      {selectedDomain && selectedSubdomain && (
        <QueueManagementModal
          isOpen={isQueueModalOpen}
          onClose={() => {
            setIsQueueModalOpen(false);
            setSelectedDomain(undefined);
            setSelectedSubdomain(undefined);
          }}
          domain={selectedDomain.domain}
          subdomain={selectedSubdomain}
          recipientDomains={selectedSubdomain.recipientDomains}
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