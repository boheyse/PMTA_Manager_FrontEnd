import React from 'react';
import type { QueuePool, QueueData } from '../../types/domain';

interface QueuesTableProps {
  queuePools: QueuePool[];
  onQueueClick: (queue: QueueData) => void;
}

export function QueuesTable({ queuePools, onQueueClick }: QueuesTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="text-sm text-gray-500">
          <th className="text-left py-2">Pool Name</th>
          <th className="text-left py-2">Queue Name</th>
          <th className="text-left py-2">Subdomain</th>
          <th className="text-left py-2">IP Address</th>
          <th className="text-left py-2">Type</th>
        </tr>
      </thead>
      <tbody>
        {queuePools.flatMap((pool) =>
          pool.queues.info.map((info, infoIndex) => (
            <tr key={`${pool.poolName}-${info.queueName}-${infoIndex}`} className="text-sm">
              <td className="py-2">{pool.poolName}</td>
              <td className="py-2">
                <button
                  onClick={() => onQueueClick(pool.queues)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {info.queueName}
                </button>
              </td>
              <td className="py-2">{info.sourceHost}</td>
              <td className="py-2">{info.ipAddress}</td>
              <td className="py-2">{info.queueType || pool.poolType}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
} 