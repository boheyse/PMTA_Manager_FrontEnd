import React from 'react';
import type { PMTANode } from '../../../types/node';

interface DomainOverviewProps {
  server: PMTANode;
}

export function DomainOverview({ server }: DomainOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Domain Overview</h2>
      <div className="space-y-4">
        {server.domains.map(domain => (
          <div key={domain} className="p-4 border rounded">
            <h3 className="font-medium mb-2">{domain}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Messages Sent</div>
                <div className="text-lg font-medium">12,345</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Delivery Rate</div>
                <div className="text-lg font-medium text-green-600">98.5%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Bounce Rate</div>
                <div className="text-lg font-medium text-red-600">1.5%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}