import React from 'react';

interface DomainStatsTableProps {
  stats: {
    domain: string;
    total_events: number;
    deliveries: number;
    bounces: number;
  }[];
}

export function DomainStatsTable({ stats }: DomainStatsTableProps) {
  return (
    <table className="w-full min-w-[600px]">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2 px-4 font-medium text-gray-600">Domain</th>
          <th className="py-2 px-4 font-medium text-gray-600">Messages Sent</th>
          <th className="py-2 px-4 font-medium text-gray-600">Deliveries</th>
          <th className="py-2 px-4 font-medium text-gray-600">Bounces</th>
        </tr>
      </thead>
      <tbody>
        {stats.map(stat => {
          const deliveryRate = ((stat.deliveries / stat.total_events) * 100).toFixed(1);
          const bounceRate = ((stat.bounces / stat.total_events) * 100).toFixed(1);
          
          return (
            <tr key={stat.domain} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{stat.domain}</td>
              <td className="py-2 px-4">{stat.total_events.toLocaleString()}</td>
              <td className="py-2 px-4 text-green-600">{deliveryRate}%</td>
              <td className="py-2 px-4 text-red-600">{bounceRate}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}