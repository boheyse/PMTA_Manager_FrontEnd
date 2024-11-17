import React from 'react';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Node } from '../../types/node';

interface NodeStatsProps {
  node: Node;
}

export function NodeStats({ node }: NodeStatsProps) {
  const navigate = useNavigate();

  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-2 w-1/4">
            {node.status === 'connected' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <h3 className="text-sm font-medium truncate">{node.name}</h3>
          </div>
          <div className="grid grid-cols-4 gap-4 flex-1">
            <div className="text-sm">
              <div className="text-gray-500">Sent</div>
              <div className="font-medium">{node.stats.emailsSent.toLocaleString()}</div>
            </div>
            <div className="text-sm">
              <div className="text-gray-500">Delivery Rate</div>
              <div className="font-medium">
                {((node.stats.emailsDelivered / node.stats.emailsSent) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-sm">
              <div className="text-gray-500">Bounce Rate</div>
              <div className="font-medium">
                {((node.stats.emailsBounced / node.stats.emailsSent) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-sm">
              <div className="text-gray-500">Spam Rate</div>
              <div className="font-medium">{node.stats.spamComplaints}%</div>
            </div>
          </div>
        </div>
        <button 
          className="text-blue-500 hover:text-blue-600 text-sm flex items-center"
          onClick={() => navigate(`/node/${node.id}`)}
        >
          Details <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}