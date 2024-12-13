import React from 'react';
import type { PMTANode } from '../../../types/node';

interface VMTADetailsProps {
  server: PMTANode;
  timeRange: string;
}

export function VMTADetails({ server, timeRange }: VMTADetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-6">
        {server.pool_types.map(pool => (
          <div key={pool.pool_type} className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">{pool.pool_type || 'Default'} Pool</h3>
            
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-500">Total VMTAs</div>
                <div className="text-2xl font-medium">8</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Active</div>
                <div className="text-2xl font-medium text-green-600">5</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">In Backoff</div>
                <div className="text-2xl font-medium text-yellow-600">2</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Disabled</div>
                <div className="text-2xl font-medium text-red-600">1</div>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">VMTA Name</th>
                  <th className="py-2">IP Address</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Messages in Queue</th>
                  <th className="py-2">Delivery Rate</th>
                  <th className="py-2">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">vmta1.example.com</td>
                  <td>192.168.1.1</td>
                  <td>
                    <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td>1,234</td>
                  <td className="text-green-600">98.5%</td>
                  <td className="text-red-600">1.5%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">vmta2.example.com</td>
                  <td>192.168.1.2</td>
                  <td>
                    <span className="px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                      Backoff
                    </span>
                  </td>
                  <td>2,345</td>
                  <td className="text-green-600">95.2%</td>
                  <td className="text-red-600">4.8%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">vmta3.example.com</td>
                  <td>192.168.1.3</td>
                  <td>
                    <span className="px-2 py-1 text-sm rounded-full bg-red-100 text-red-800">
                      Disabled
                    </span>
                  </td>
                  <td>0</td>
                  <td className="text-green-600">0%</td>
                  <td className="text-red-600">0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}