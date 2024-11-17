import React, { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { NodeDetails } from './NodeDetails';
import type { Node } from '../../types/node';

interface NodeStatsProps {
  node: Node;
}

export function NodeStats({ node }: NodeStatsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleNodeUpdate = (updatedNode: Node) => {
    // TODO: Implement node update logic
    console.log('Node updated:', updatedNode);
  };

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {node.status === 'connected' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="text-lg font-medium">{node.name}</h3>
            </div>
            <span className="text-gray-500">{node.host}</span>
          </div>
          <button 
            className="text-blue-500 hover:text-blue-600"
            onClick={() => setShowDetails(true)}
          >
            View Details <ArrowRight className="w-4 h-4 inline" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Emails Sent</div>
            <div className="text-lg font-semibold">{node.stats.emailsSent.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Delivery Rate</div>
            <div className="text-lg font-semibold">
              {((node.stats.emailsDelivered / node.stats.emailsSent) * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Bounce Rate</div>
            <div className="text-lg font-semibold">
              {((node.stats.emailsBounced / node.stats.emailsSent) * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Spam Complaints</div>
            <div className="text-lg font-semibold">{node.stats.spamComplaints}%</div>
          </div>
        </div>
      </div>

      <NodeDetails
        show={showDetails}
        onHide={() => setShowDetails(false)}
        node={node}
        onUpdate={handleNodeUpdate}
      />
    </>
  );
}