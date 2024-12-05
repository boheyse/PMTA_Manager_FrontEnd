import React, { useState, useEffect } from 'react';
import { NodeStats } from '../components/status/NodeStats';
import { NodeDetails } from '../components/status/NodeDetails';
import { mockNodes } from '../mocks/nodeData';
import type { Node } from '../types/node';

export function MonitoringPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setNodes(mockNodes);
  }, []);

  const handleNodeUpdate = (updatedNode: Node) => {
    setNodes(prev =>
      prev.map(node => (node.id === updatedNode.id ? updatedNode : node))
    );
    setSelectedNode(updatedNode);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Monitoring</h1>
      
      <div className="space-y-4">
        {nodes.map(node => (
          <div
            key={node.id}
            className="bg-white rounded-lg shadow cursor-pointer"
            onClick={() => {
              setSelectedNode(node);
              setShowDetails(true);
            }}
          >
            <NodeStats node={node} />
          </div>
        ))}
      </div>

      {selectedNode && (
        <NodeDetails
          show={showDetails}
          onHide={() => {
            setShowDetails(false);
            setSelectedNode(null);
          }}
          node={selectedNode}
          onUpdate={handleNodeUpdate}
        />
      )}
    </div>
  );
}