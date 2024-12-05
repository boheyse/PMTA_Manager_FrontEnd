import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { Edit2, Trash2 } from 'lucide-react';

interface DomainDetailsModalProps {
  show: boolean;
  onHide: () => void;
  domain: string;
  onEditQueue: () => void;
}

export function DomainDetailsModal({ show, onHide, domain, onEditQueue }: DomainDetailsModalProps) {
  // Mock data for pools and queues
  const mockPools = [
    {
      name: `${domain}-pool`,
      queues: [
        {
          name: `154.22.55.8-${domain}`,
          ipAddress: '154.22.55.8',
          status: 'active',
          messagesInQueue: 1250
        },
        {
          name: `154.22.55.9-${domain}`,
          ipAddress: '154.22.55.9',
          status: 'backoff',
          messagesInQueue: 850
        }
      ]
    },
    {
      name: `${domain}-pool-fresh`,
      queues: [
        {
          name: `154.22.55.10-${domain}-fresh`,
          ipAddress: '154.22.55.10',
          status: 'active',
          messagesInQueue: 2000
        }
      ]
    }
  ];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Domain Details - {domain}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mockPools.map(pool => (
          <div key={pool.name} className="mb-6">
            <h4 className="text-lg font-medium mb-3">{pool.name}</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Queue Name</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Messages</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pool.queues.map(queue => (
                  <tr key={queue.name}>
                    <td>{queue.name}</td>
                    <td>{queue.ipAddress}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        queue.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {queue.status}
                      </span>
                    </td>
                    <td>{queue.messagesInQueue.toLocaleString()}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button 
                          onClick={onEditQueue}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}