import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { SearchableSelect } from './SearchableSelect';

interface AddQueueModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (ipAddress: string, queueType: string) => void;
  availableIPs: string[];
  domainName: string;
}

export function AddQueueModal({ 
  show, 
  onHide, 
  onSubmit, 
  availableIPs,
  domainName 
}: AddQueueModalProps) {
  const [selectedIP, setSelectedIP] = useState<string>('');
  const [queueType, setQueueType] = useState<string>('default');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert 'default' to empty string as per requirements
    const finalQueueType = queueType === 'default' ? '' : queueType;
    onSubmit(selectedIP, finalQueueType);
    onHide();
    // Reset form
    setSelectedIP('');
    setQueueType('default');
  };

  const handleIPChange = (selected: string[]) => {
    setSelectedIP(selected[0] || '');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Queue</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-4">
            <Form.Label>IP Address</Form.Label>
            <SearchableSelect
              options={availableIPs}
              placeholder="Select IP address..."
              onChange={handleIPChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Queue Type</Form.Label>
            <Form.Control
              type="text"
              value={queueType}
              onChange={(e) => setQueueType(e.target.value)}
              placeholder="Enter queue type (default = empty)"
            />
            <Form.Text className="text-muted">
              Leave as "default" for standard queue, or enter a type (e.g., "fresh")
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={!selectedIP}
          >
            Add Queue
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 