import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings, Mail, AlertTriangle } from 'lucide-react';
import type { Node } from '../../types/node';

interface NodeOverviewProps {
  node: Node;
}

export function NodeOverview({ node }: NodeOverviewProps) {
  // Mock data for charts
  const deliveryData = [
    { time: '00:00', delivered: 95, bounced: 5 },
    { time: '04:00', delivered: 92, bounced: 8 },
    { time: '08:00', delivered: 98, bounced: 2 },
    { time: '12:00', delivered: 94, bounced: 6 },
    { time: '16:00', delivered: 96, bounced: 4 },
    { time: '20:00', delivered: 93, bounced: 7 },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Node Information</h3>
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
  );
}