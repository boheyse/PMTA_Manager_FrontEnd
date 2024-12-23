import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { SearchableSelect } from './SearchableSelect';

interface AddQueueModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (queueName: string, ipAddress: string, subDomain: string, domainKey: string, poolType: string) => void;
  availableIPs: string[];
  domainName: string;
  poolType: string;
}

export function AddQueueModal({ 
  show, 
  onHide, 
  onSubmit, 
  availableIPs,
  domainName,
  poolType
}: AddQueueModalProps) {
  const [selectedIP, setSelectedIP] = useState<string>('');
  const [subDomain, setSubDomain] = useState<string>(domainName);
  const [domainKey, setDomainKey] = useState<string>('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queueName = poolType ? `${selectedIP}-${domainName}-${poolType}` : `${selectedIP}-${domainName}`;
    onSubmit(queueName, selectedIP, subDomain, domainKey, poolType);
    onHide();
    // Reset form
    setSelectedIP('');
    setSubDomain(domainName);
    setDomainKey('0');
  };

  const handleIPChange = (selected: string[]) => {
    setSelectedIP(selected[0] || '');
  };

  // Update subDomain when domainName prop changes
  useEffect(() => {
    setSubDomain(domainName);
  }, [domainName]);

  const domainKeyPath = `/etc/pmta/dkim/${domainKey}.${domainName}`;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" dialogClassName="modal-90w">
      <style>
        {`
          .modal-90w {
            width: 90%;
            max-width: 1200px;
          }
          .modal-90w .modal-content {
            min-height: 400px;
          }
          .modal-body {
            padding: 2rem;
          }
        `}
      </style>
      <Modal.Header closeButton>
        <Modal.Title>Add New Queue</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>IP Address</Form.Label>
                <SearchableSelect
                  options={availableIPs}
                  placeholder="Select IP address..."
                  onChange={handleIPChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Queue Type</Form.Label>
                <Form.Control
                  type="text"
                  value={poolType}
                  disabled
                />
                <Form.Text className="text-muted">
                  Auto-generated from selected pool
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Subdomain</Form.Label>
                <Form.Control
                  type="text"
                  value={subDomain}
                  onChange={(e) => setSubDomain(e.target.value)}
                  placeholder="Enter subdomain"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label>Domain Key</Form.Label>
                <Form.Control
                  type="text"
                  value={domainKey}
                  onChange={(e) => setDomainKey(e.target.value)}
                  placeholder="Enter domain key"
                />
                <Form.Text className="text-muted">
                  Default is 0
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Domain Key Path</Form.Label>
                <Form.Control
                  type="text"
                  value={domainKeyPath}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  Auto-generated
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
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