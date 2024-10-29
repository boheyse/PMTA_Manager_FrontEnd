import React, { useState } from 'react';
import { PlusCircle, Trash2, Search, ChevronRight, ChevronDown, Play, Pause, Square } from 'lucide-react';

type QueueStatus = 'Active' | 'Paused' | 'Stopped';

interface Subdomain {
  name: string;
  ipAddress: string;
  queueStatus: QueueStatus;
  queueName: string;
}

interface Domain {
  domain: string;
  ipAddresses: string[];
  emailsSent: number;
  queue: string;
  subdomains: Subdomain[];
}

export function SendingDomainsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [domains, setDomains] = useState<Domain[]>([
    { 
      domain: 'gleemate.com',
      ipAddresses: ['192.168.1.1', '192.168.1.2'],
      emailsSent: 0,
      queue: 'Delivering',
      subdomains: [
        { 
          name: 'mail.gleemate.com', 
          ipAddress: '192.168.1.1', 
          queueStatus: 'Active',
          queueName: 'gleemate.com-fresh'
        },
        { 
          name: 'news.gleemate.com', 
          ipAddress: '192.168.1.2', 
          queueStatus: 'Paused',
          queueName: 'gleemate.com-unthrottled'
        }
      ]
    },
    { 
      domain: 'demomailtrap.com',
      ipAddresses: ['10.0.0.1'],
      emailsSent: 1,
      queue: 'Delivering',
      subdomains: [
        { 
          name: 'mail.demomailtrap.com', 
          ipAddress: '10.0.0.1', 
          queueStatus: 'Stopped',
          queueName: 'demomailtrap.com-fresh'
        }
      ]
    },
  ]);

  const updateQueueStatus = (domainIndex: number, subdomainIndex: number, newStatus: QueueStatus) => {
    setDomains(prevDomains => {
      const newDomains = [...prevDomains];
      newDomains[domainIndex].subdomains[subdomainIndex].queueStatus = newStatus;
      return newDomains;
    });
  };

  const getStatusColor = (status: QueueStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Stopped':
        return 'bg-red-100 text-red-800';
    }
  };

  const QueueControls = ({ status, onStatusChange }: { 
    status: QueueStatus, 
    onStatusChange: (newStatus: QueueStatus) => void 
  }) => {
    switch (status) {
      case 'Active':
        return (
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('Paused');
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Pause Queue"
            >
              <Pause className="w-4 h-4 text-yellow-600" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('Stopped');
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Stop Queue"
            >
              <Square className="w-4 h-4 text-red-600" />
            </button>
          </div>
        );
      case 'Paused':
        return (
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('Active');
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Start Queue"
            >
              <Play className="w-4 h-4 text-green-600" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('Stopped');
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Stop Queue"
            >
              <Square className="w-4 h-4 text-red-600" />
            </button>
          </div>
        );
      case 'Stopped':
        return (
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('Active');
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Start Queue"
            >
              <Play className="w-4 h-4 text-green-600" />
            </button>
          </div>
        );
    }
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
        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
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
              <th className="text-left p-4">IP Addresses</th>
              <th className="text-left p-4">Emails Sent</th>
              <th className="text-left p-4">Queues</th>
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
                      ? <ChevronDown className="w-4 h-4 text-gray-500" />
                      : <ChevronRight className="w-4 h-4 text-gray-500" />
                    }
                  </td>
                  <td className="p-4 font-medium">{domain.domain}</td>
                  <td className="p-4">{domain.ipAddresses.join(', ')}</td>
                  <td className="p-4">{domain.emailsSent}</td>
                  <td className="p-4">{domain.queue}</td>
                  <td className="p-4">
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {expandedDomains.includes(domain.domain) && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-4">
                      <div className="pl-8">
                        <table className="w-full">
                          <thead>
                            <tr className="text-sm text-gray-500">
                              <th className="text-left py-2">Subdomain</th>
                              <th className="text-left py-2">Queue Status</th>
                              <th className="text-left py-2">Queue Name</th>
                              <th className="text-left py-2">IP Address</th>
                            </tr>
                          </thead>
                          <tbody>
                            {domain.subdomains.map((subdomain, subdomainIndex) => (
                              <tr key={subdomain.name} className="text-sm">
                                <td className="py-2">{subdomain.name}</td>
                                <td className="py-2">
                                  <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(subdomain.queueStatus)}`}>
                                      {subdomain.queueStatus}
                                    </span>
                                    <QueueControls 
                                      status={subdomain.queueStatus}
                                      onStatusChange={(newStatus) => updateQueueStatus(domainIndex, subdomainIndex, newStatus)}
                                    />
                                  </div>
                                </td>
                                <td className="py-2">{subdomain.queueName}</td>
                                <td className="py-2">{subdomain.ipAddress}</td>
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
    </div>
  );
} 