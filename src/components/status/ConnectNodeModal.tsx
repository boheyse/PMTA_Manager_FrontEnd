import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface ConnectNodeModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (node: { name: string; host: string }) => void;
}

export function ConnectNodeModal({ show, onHide, onSubmit }: ConnectNodeModalProps) {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, host });
    setName('');
    setHost('');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Connect New Node</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Node Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter node name"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Host Address</Form.Label>
            <Form.Control
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Enter host address (e.g., http://localhost:8080)"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Connect
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}