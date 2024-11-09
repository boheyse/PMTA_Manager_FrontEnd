import React from 'react';
import type { QueuePool, Queue } from '../../types/domain';

interface QueuesTableProps {
  queuePools: QueuePool[];
  onQueueClick: (queue: Queue) => void;
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
          pool.queues.map((queue, queueIndex) => (
            <tr key={`${pool.queuePoolName}-${queue.subdomain}-${queueIndex}`} className="text-sm">
              <td className="py-2">{pool.queuePoolName}</td>
              <td className="py-2">
                <button
                  onClick={() => onQueueClick(queue)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {queue.queueName}
                </button>
              </td>
              <td className="py-2">{queue.subdomain}</td>
              <td className="py-2">{queue.ipAddress}</td>
              <td className="py-2">{queue.type || pool.type}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
} 