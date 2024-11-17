import React from 'react';
import type { Node } from '../../types/node';

interface NodeLogsProps {
  node: Node;
}

export function NodeLogs({ node }: NodeLogsProps) {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-96 overflow-auto">
      <div>[2024-01-20 10:15:23] Connected to SMTP server</div>
      <div>[2024-01-20 10:15:24] Starting mail delivery</div>
      <div>[2024-01-20 10:15:25] Successfully delivered to recipient@example.com</div>
      <div>[2024-01-20 10:15:26] Queue processed successfully</div>
    </div>
  );
}