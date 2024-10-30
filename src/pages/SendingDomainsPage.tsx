import React, { useState } from 'react';
import { PlusCircle, Trash2, Search, ChevronRight, ChevronDown, Play, Pause, Square, Edit, AlertCircle } from 'lucide-react';
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

  const [domains, setDomains] = useState<Domain[]>([
    { 
      domain: 'test.com',
      ipAddresses: ['192.168.1.1', '192.168.1.2'],
      emailsSent: 0,
      queue: 'Delivering',
      healthStatus: 'healthy',
      ispStatus: {
        'Gmail': 'Active',
        'Yahoo/AOL': 'Active',
        'Hotmail': 'Active'
      },
      subdomains: [
        { 
          name: 'mail.test.com', 
          ipAddress: '192.168.1.1', 
          queueStatus: 'Active',
          queueName: 'test.com-fresh',
          queues: [
            {
              name: 'Gmail-Fresh',
              ispTarget: 'Gmail',
              type: 'Fresh',
              speed: 1000,
              messageCount: 500,
              status: 'Active'
            },
            {
              name: 'Gmail-Engaged',
              ispTarget: 'Gmail',
              type: 'Engaged',
              speed: 2000,
              messageCount: 200,
              status: 'Active'
            }
          ]
        }
      ]
    }
  ]);

  const availableIPs = ['192.168.1.1', '192.168.1.2', '10.0.0.1', '10.0.0.2'];

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

  const handleQueueManagement = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsQueueModalOpen(true);
  };

  const handleSaveQueues = (domainIndex: number, queues: Domain['subdomains'][0]['queues']) => {
    setDomains(prevDomains => {
      const newDomains = [...prevDomains];
      newDomains[domainIndex].subdomains[0].queues = queues;
      return newDomains;
    });
  };

  const handleSave = (formData: DomainFormData) => {
    if (editingDomain) {
      // Update existing domain
      setDomains(prevDomains => 
        prevDomains.map(domain => 
          domain.domain === editingDomain.domain
            ? {
                ...domain,
                domain: formData.domain,
                subdomains: formData.subdomains.map(sub => ({
                  ...sub,
                  queueStatus: sub.queueStatus || 'Active'
                }))
              }
            : domain
        )
      );
    } else {
      // Add new domain
      setDomains(prevDomains => [
        ...prevDomains,
        {
          domain: formData.domain,
          ipAddresses: [...new Set(formData.subdomains.map(sub => sub.ipAddress))],
          emailsSent: 0,
          queue: 'Delivering',
          healthStatus: 'healthy',
          ispStatus: {
            'Gmail': 'Active',
            'Yahoo/AOL': 'Active',
            'Hotmail': 'Active'
          },
          subdomains: formData.subdomains.map(sub => ({
            ...sub,
            queueStatus: sub.queueStatus || 'Active'
          }))
        }
      ]);
    }
    setEditingDomain(undefined);
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

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
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
                  <td className="p-4">
                    <AlertCircle className={`w-5 h-5 ${getHealthStatusColor(domain.healthStatus)}`} />
                  </td>
                  <td className="p-4">{domain.ipAddresses.join(', ')}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {(Object.entries(domain.ispStatus) as [ISPTarget, QueueStatus][]).map(([isp, status]) => (
                        <button
                          key={isp}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when clicking ISP status
                            toggleISPStatus(domainIndex, isp);
                          }}
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
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking buttons
                          handleQueueManagement(domain);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Manage Queues
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking buttons
                          handleEdit(domain);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking buttons
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
        </table>
      </div>

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