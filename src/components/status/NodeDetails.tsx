import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings, Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Node } from '../../types/node';
import { DomainHealthGrid } from './DomainHealthGrid';
import { ISPMetrics } from './ISPMetrics';

interface NodeDetailsProps {
  show: boolean;
  onHide: () => void;
  node: Node;
  onUpdate: (updatedNode: Node) => void;
}

export function NodeDetails({ show, onHide, node, onUpdate }: NodeDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNode, setEditedNode] = useState<Node>(node);
  const [activeTab, setActiveTab] = useState('overview');

  if (!node) return null;

  // Mock data for charts
  const deliveryData = [
    { time: '00:00', delivered: 95, bounced: 5 },
    { time: '04:00', delivered: 92, bounced: 8 },
    { time: '08:00', delivered: 98, bounced: 2 },
    { time: '12:00', delivered: 94, bounced: 6 },
    { time: '16:00', delivered: 96, bounced: 4 },
    { time: '20:00', delivered: 93, bounced: 7 },
  ];

  const handleSave = () => {
    onUpdate(editedNode);
    setIsEditing(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {node.status === 'connected' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <h2 className="text-xl font-semibold">{node.name}</h2>
          </div>
          <button onClick={onHide} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            <div className="w-48 border-r p-4 space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('domains')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'domains' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                Domain Health
              </button>
              <button
                onClick={() => setActiveTab('isps')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'isps' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                ISP Metrics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'logs' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                Logs
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Node Information</h3>
                        {isEditing ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Node Name</label>
                              <input
                                type="text"
                                value={editedNode.name}
                                onChange={(e) => setEditedNode({ ...editedNode, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Host Address</label>
                              <input
                                type="text"
                                value={editedNode.host}
                                onChange={(e) => setEditedNode({ ...editedNode, host: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Host:</span> {node.host}
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>{' '}
                              <span className={node.status === 'connected' ? 'text-green-500' : 'text-red-500'}>
                                {node.status}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Uptime:</span> 14 days, 6 hours
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Current Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Delivery Rate</div>
                            <div className="text-xl font-semibold text-green-500">
                              {((node.stats.emailsDelivered / node.stats.emailsSent) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Bounce Rate</div>
                            <div className="text-xl font-semibold text-red-500">
                              {((node.stats.emailsBounced / node.stats.emailsSent) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Open Rate</div>
                            <div className="text-xl font-semibold">{node.stats.uniqueOpenRate}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Click Rate</div>
                            <div className="text-xl font-semibold">{node.stats.clickRate}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Delivery Trends</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={deliveryData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="delivered" stroke="#10B981" name="Delivered %" />
                              <Line type="monotone" dataKey="bounced" stroke="#EF4444" name="Bounced %" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2 text-green-500" />
                            <span>Successfully delivered 1,234 emails</span>
                            <span className="ml-auto text-gray-500">2m ago</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                            <span>Temporary delivery delay to Gmail</span>
                            <span className="ml-auto text-gray-500">15m ago</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Settings className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Configuration updated</span>
                            <span className="ml-auto text-gray-500">1h ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'domains' && <DomainHealthGrid nodes={[node]} />}
              {activeTab === 'isps' && <ISPMetrics nodes={[node]} />}

              {activeTab === 'settings' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Node Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maximum Connections</label>
                      <input type="number" defaultValue={100} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rate Limit (emails/hour)</label>
                      <input type="number" defaultValue={1000} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Retry Interval (minutes)</label>
                      <input type="number" defaultValue={15} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" defaultChecked id="auto-throttle" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="auto-throttle" className="ml-2 block text-sm text-gray-900">
                        Enable Auto-throttling
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-96 overflow-auto">
                  <div>[2024-01-20 10:15:23] Connected to SMTP server</div>
                  <div>[2024-01-20 10:15:24] Starting mail delivery</div>
                  <div>[2024-01-20 10:15:25] Successfully delivered to recipient@example.com</div>
                  <div>[2024-01-20 10:15:26] Queue processed successfully</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Edit Node
              </button>
              <button
                onClick={onHide}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}