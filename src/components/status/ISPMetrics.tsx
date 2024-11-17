import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PauseCircle, PlayCircle, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { SearchableSelect } from '../SearchableSelect';
import type { Node } from '../../types/node';

interface ISPMetricsProps {
  nodes: Node[];
}

interface QueueData {
  name: string;
  messagesInQueue: number;
  status: 'active' | 'paused';
}

interface DomainData {
  name: string;
  queues: QueueData[];
  totalInQueue: number;
  status: 'active' | 'paused';
}

interface ISPData {
  name: string;
  status: 'active' | 'paused';
  volume: number;
  deliveryRate: number;
  bounceRate: number;
  deferralRate: number;
  domains: DomainData[];
  totalInQueue: number;
}

export function ISPMetrics({ nodes }: ISPMetricsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'delivery' | 'bounce'>('volume');
  const [expandedISPs, setExpandedISPs] = useState<string[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // Mock ISP data
  const ispData: ISPData[] = [
    {
      name: 'Gmail',
      status: 'active',
      volume: 50000,
      deliveryRate: 98.5,
      bounceRate: 1.5,
      deferralRate: 0.5,
      totalInQueue: 2500,
      domains: [
        {
          name: 'example.com',
          status: 'active',
          totalInQueue: 1500,
          queues: [
            { name: '154.22.55.8-example.com', messagesInQueue: 800, status: 'active' },
            { name: '154.22.55.9-example.com', messagesInQueue: 700, status: 'active' }
          ]
        },
        {
          name: 'test.com',
          status: 'paused',
          totalInQueue: 1000,
          queues: [
            { name: '154.22.55.8-test.com', messagesInQueue: 600, status: 'paused' },
            { name: '154.22.55.9-test.com', messagesInQueue: 400, status: 'active' }
          ]
        }
      ]
    },
    {
      name: 'Yahoo',
      status: 'active',
      volume: 30000,
      deliveryRate: 97.2,
      bounceRate: 2.8,
      deferralRate: 1.2,
      totalInQueue: 1800,
      domains: [
        {
          name: 'example.com',
          status: 'active',
          totalInQueue: 1000,
          queues: [
            { name: '154.22.55.8-example.com', messagesInQueue: 500, status: 'active' },
            { name: '154.22.55.9-example.com', messagesInQueue: 500, status: 'active' }
          ]
        },
        {
          name: 'test.com',
          status: 'active',
          totalInQueue: 800,
          queues: [
            { name: '154.22.55.8-test.com', messagesInQueue: 400, status: 'active' },
            { name: '154.22.55.9-test.com', messagesInQueue: 400, status: 'active' }
          ]
        }
      ]
    }
  ];

  const domains = ['all', ...new Set(ispData.flatMap(isp => isp.domains.map(d => d.name)))];

  const toggleISP = (ispName: string) => {
    setExpandedISPs(prev =>
      prev.includes(ispName)
        ? prev.filter(isp => isp !== ispName)
        : [...prev, ispName]
    );
  };

  const toggleDomain = (domainName: string) => {
    setExpandedDomains(prev =>
      prev.includes(domainName)
        ? prev.filter(d => d !== domainName)
        : [...prev, domainName]
    );
  };

  const getFilteredData = () => {
    if (selectedDomain === 'all') return ispData;
    return ispData.map(isp => ({
      ...isp,
      domains: isp.domains.filter(d => d.name === selectedDomain)
    }));
  };

  const getChartData = () => {
    const data = getFilteredData();
    switch (selectedMetric) {
      case 'volume':
        return data.map(isp => ({
          name: isp.name,
          value: isp.volume
        }));
      case 'delivery':
        return data.map(isp => ({
          name: isp.name,
          value: isp.deliveryRate
        }));
      case 'bounce':
        return data.map(isp => ({
          name: isp.name,
          value: isp.bounceRate
        }));
    }
  };

  const handleEmptyQueue = (ispName: string, domainName?: string, queueName?: string) => {
    console.log(`Emptying queue for ISP: ${ispName}${domainName ? `, Domain: ${domainName}` : ''}${queueName ? `, Queue: ${queueName}` : ''}`);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">ISP Performance</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedMetric('volume')}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedMetric === 'volume' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setSelectedMetric('delivery')}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedMetric === 'delivery' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Delivery
            </button>
            <button
              onClick={() => setSelectedMetric('bounce')}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedMetric === 'bounce' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Bounce
            </button>
          </div>
        </div>
        <div className="h-[calc(100vh-300px)]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Queue Management</h2>
            <SearchableSelect
              options={domains}
              placeholder="Filter by domain"
              onChange={(selected) => setSelectedDomain(selected[0] || 'all')}
            />
          </div>
        </div>
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="w-8"></th>
                <th className="text-left p-4">ISP</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Messages</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredData().map((isp) => (
                <React.Fragment key={isp.name}>
                  <tr 
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleISP(isp.name)}
                  >
                    <td className="p-4">
                      {expandedISPs.includes(isp.name) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </td>
                    <td className="p-4">{isp.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        isp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isp.status}
                      </span>
                    </td>
                    <td className="p-4">{isp.totalInQueue.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className={isp.status === 'active' ? 'text-yellow-500' : 'text-green-500'}>
                          {isp.status === 'active' ? (
                            <PauseCircle className="w-5 h-5" />
                          ) : (
                            <PlayCircle className="w-5 h-5" />
                          )}
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmptyQueue(isp.name);
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedISPs.includes(isp.name) && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50">
                        <table className="w-full">
                          <tbody>
                            {isp.domains.map((domain) => (
                              <React.Fragment key={`${isp.name}-${domain.name}`}>
                                <tr 
                                  className="border-t hover:bg-gray-100 cursor-pointer"
                                  onClick={() => toggleDomain(`${isp.name}-${domain.name}`)}
                                >
                                  <td className="p-4 pl-8">
                                    {expandedDomains.includes(`${isp.name}-${domain.name}`) ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </td>
                                  <td className="p-4">{domain.name}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                      domain.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {domain.status}
                                    </span>
                                  </td>
                                  <td className="p-4">{domain.totalInQueue.toLocaleString()}</td>
                                  <td className="p-4">
                                    <div className="flex space-x-2">
                                      <button className={domain.status === 'active' ? 'text-yellow-500' : 'text-green-500'}>
                                        {domain.status === 'active' ? (
                                          <PauseCircle className="w-4 h-4" />
                                        ) : (
                                          <PlayCircle className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button 
                                        className="text-red-500 hover:text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEmptyQueue(isp.name, domain.name);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {expandedDomains.includes(`${isp.name}-${domain.name}`) && (
                                  <>
                                    {domain.queues.map((queue) => (
                                      <tr key={`${isp.name}-${domain.name}-${queue.name}`} className="border-t bg-gray-100">
                                        <td className="p-4 pl-12"></td>
                                        <td className="p-4 text-sm">{queue.name}</td>
                                        <td className="p-4">
                                          <span className={`px-2 py-1 rounded-full text-sm ${
                                            queue.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {queue.status}
                                          </span>
                                        </td>
                                        <td className="p-4">{queue.messagesInQueue.toLocaleString()}</td>
                                        <td className="p-4">
                                          <div className="flex space-x-2">
                                            <button className={queue.status === 'active' ? 'text-yellow-500' : 'text-green-500'}>
                                              {queue.status === 'active' ? (
                                                <PauseCircle className="w-4 h-4" />
                                              ) : (
                                                <PlayCircle className="w-4 h-4" />
                                              )}
                                            </button>
                                            <button 
                                              className="text-red-500 hover:text-red-600"
                                              onClick={() => handleEmptyQueue(isp.name, domain.name, queue.name)}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}