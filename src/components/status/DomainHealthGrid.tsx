import React, { useState } from 'react';
import { PauseCircle, PlayCircle, AlertTriangle, RotateCw, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import type { Node } from '../../types/node';

interface DomainHealthGridProps {
  nodes: Node[];
}

interface QueueStatus {
  name: string;
  status: 'delivering' | 'paused' | 'backoff' | 'bouncing';
  messagesInQueue: number;
  deliveryRate: number;
  bounceRate: number;
}

interface DomainHealth {
  domain: string;
  status: 'delivering' | 'paused' | 'backoff' | 'bouncing';
  queueSize: number;
  deliveryRate: number;
  bounceRate: number;
  queues: QueueStatus[];
}

export function DomainHealthGrid({ nodes }: DomainHealthGridProps) {
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);

  // Mock domain health data
  const domains: DomainHealth[] = [
    {
      domain: 'gleemate.com',
      status: 'delivering',
      totalQueueSize: 1250,
      deliveryRate: 98.5,
      bounceRate: 1.5,
      queues: [
        {
          name: '154.22.55.8-gleemate.com',
          status: 'delivering',
          messagesInQueue: 500,
          deliveryRate: 99.1,
          bounceRate: 0.9
        },
        {
          name: '154.22.55.3-gleemate.com-fresh',
          status: 'backoff',
          messagesInQueue: 750,
          deliveryRate: 97.8,
          bounceRate: 2.2
        }
      ]
    },
    {
      domain: 'test.com',
      status: 'backoff',
      totalQueueSize: 3420,
      deliveryRate: 85.2,
      bounceRate: 14.8,
      queues: [
        {
          name: '154.22.55.8-test.com-fresh',
          status: 'backoff',
          messagesInQueue: 2000,
          deliveryRate: 84.5,
          bounceRate: 15.5
        },
        {
          name: '154.22.55.12-test.com-fresh',
          status: 'delivering',
          messagesInQueue: 1420,
          deliveryRate: 97.2,
          bounceRate: 2.8
        }
      ]
    }
  ];

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const getStatusIcon = (status: DomainHealth['status']) => {
    switch (status) {
      case 'delivering':
        return <PlayCircle className="w-5 h-5 text-green-500" />;
      case 'paused':
        return <PauseCircle className="w-5 h-5 text-yellow-500" />;
      case 'backoff':
        return <RotateCw className="w-5 h-5 text-orange-500" />;
      case 'bouncing':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: DomainHealth['status']) => {
    switch (status) {
      case 'delivering':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'backoff':
        return 'Backoff';
      case 'bouncing':
        return 'Bouncing';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Domain Health</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-8"></th>
              <th className="text-left p-4">Domain</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Queue Size</th>
              <th className="text-left p-4">Delivery Rate</th>
              <th className="text-left p-4">Bounce Rate</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <React.Fragment key={domain.domain}>
                <tr 
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleDomain(domain.domain)}
                >
                  <td className="p-4">
                    {expandedDomains.includes(domain.domain) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </td>
                  <td className="p-4">{domain.domain}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(domain.status)}
                      <span>{getStatusText(domain.status)}</span>
                    </div>
                  </td>
                  <td className="p-4">{domain.totalQueueSize.toLocaleString()}</td>
                  <td className="p-4">{domain.deliveryRate}%</td>
                  <td className="p-4">{domain.bounceRate}%</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {domain.status === 'paused' ? (
                        <button className="text-green-500 hover:text-green-600">
                          <PlayCircle className="w-5 h-5" />
                        </button>
                      ) : (
                        <button className="text-yellow-500 hover:text-yellow-600">
                          <PauseCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedDomains.includes(domain.domain) && (
                  <tr>
                    <td colSpan={7} className="bg-gray-50 p-4">
                      <table className="w-full">
                        <thead>
                          <tr className="text-sm text-gray-500">
                            <th className="text-left py-2">Queue</th>
                            <th className="text-left py-2">Status</th>
                            <th className="text-left py-2">Messages in Queue</th>
                            <th className="text-left py-2">Delivery Rate</th>
                            <th className="text-left py-2">Bounce Rate</th>
                            <th className="text-left py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {domain.queues.map((queue, idx) => (
                            <tr key={`${domain.domain}-${queue.name}-${idx}`} className="text-sm border-t">
                              <td className="py-2">{queue.name}</td>
                              <td className="py-2">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(queue.status)}
                                  <span>{getStatusText(queue.status)}</span>
                                </div>
                              </td>
                              <td className="py-2">{queue.messagesInQueue.toLocaleString()}</td>
                              <td className="py-2">{queue.deliveryRate}%</td>
                              <td className="py-2">{queue.bounceRate}%</td>
                              <td className="py-2">
                                <div className="flex space-x-2">
                                  {queue.status === 'paused' ? (
                                    <button className="text-green-500 hover:text-green-600">
                                      <PlayCircle className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button className="text-yellow-500 hover:text-yellow-600">
                                      <PauseCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button className="text-red-500 hover:text-red-600" title="Empty Queue">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
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
  );
}