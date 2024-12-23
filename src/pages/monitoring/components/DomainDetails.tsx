import React from 'react';
import type { PMTANode } from '../../../types/node';

interface DomainDetailsProps {
  server: PMTANode;
  timeRange: string;
}

export function DomainDetails({ server, timeRange }: DomainDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-6">
        {server.domains.map(domain => (
          <div key={domain.name} className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">{domain.name}</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-500">Messages Sent</div>
                <div className="text-2xl font-medium">12,345</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Delivery Rate</div>
                <div className="text-2xl font-medium text-green-600">98.5%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Bounce Rate</div>
                <div className="text-2xl font-medium text-red-600">1.5%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Spam Complaints</div>
                <div className="text-2xl font-medium text-yellow-600">0.1%</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Mailbox Provider Performance</h4>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Provider</th>
                    <th className="py-2">Messages</th>
                    <th className="py-2">Delivery Rate</th>
                    <th className="py-2">Bounce Rate</th>
                    <th className="py-2">Spam Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Gmail</td>
                    <td>5,432</td>
                    <td className="text-green-600">99.1%</td>
                    <td className="text-red-600">0.9%</td>
                    <td className="text-yellow-600">0.05%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Yahoo</td>
                    <td>3,456</td>
                    <td className="text-green-600">98.2%</td>
                    <td className="text-red-600">1.8%</td>
                    <td className="text-yellow-600">0.12%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Outlook</td>
                    <td>2,789</td>
                    <td className="text-green-600">97.5%</td>
                    <td className="text-red-600">2.5%</td>
                    <td className="text-yellow-600">0.15%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}