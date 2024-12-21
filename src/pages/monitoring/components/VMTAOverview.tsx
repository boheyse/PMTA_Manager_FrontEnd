import React from 'react';
import type { PMTANode } from '../../../types/node';

interface VMTAOverviewProps {
  server: PMTANode;
}

export function VMTAOverview({ server }: VMTAOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">VMTA Overview</h2>
      <div className="space-y-4">
        {server.pool_types.map(pool => (
          <div key={pool.pool_type} className="p-4 border rounded">
            <h3 className="font-medium mb-2">{pool.pool_type || 'Default'} pool</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Active VMTAs</div>
                <div className="text-lg font-medium">5</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">In Backoff</div>
                <div className="text-lg font-medium text-yellow-600">2</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Disabled</div>
                <div className="text-lg font-medium text-red-600">1</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}