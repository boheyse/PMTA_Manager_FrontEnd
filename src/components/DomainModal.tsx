import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Domain, QueueStatus } from '../types/domain';

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (domain: DomainFormData) => void;
  editData?: Domain;
  availableIPs: string[];
}

export interface DomainFormData {
  domain: string;
  ipAddresses: string[];
  queues: {
    name: string;
    ipAddress: string;
    subdomain: string;
    type?: string;
    queueStatus: QueueStatus;
    targetIsps: {
      name: string;
      settings: {
        [key: string]: string;
      };
    }[];
  }[];
}

const initialFormData: DomainFormData = {
  domain: '',
  ipAddresses: [],
  queues: [{
    name: '',
    ipAddress: '',
    subdomain: '',
    type: '',
    queueStatus: 'Active' as QueueStatus,
    targetIsps: []
  }]
};

export function DomainModal({ isOpen, onClose, onSave, editData, availableIPs }: DomainModalProps) {
  const [formData, setFormData] = useState<DomainFormData>(initialFormData);
  const [newIP, setNewIP] = useState('');
  const [customIP, setCustomIP] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          domain: editData.domain,
          ipAddresses: editData.ipAddresses,
          queues: editData.queues.map(queue => ({
            name: queue.name,
            ipAddress: queue.ipAddress,
            subdomain: queue.subdomain,
            type: queue.type,
            queueStatus: queue.queueStatus,
            targetIsps: queue.targetIsps.map(isp => ({
              name: isp.name,
              settings: isp.settings
            }))
          }))
        });
      } else {
        setFormData(initialFormData);
        setCustomIP('');
        setNewIP('');
      }
    }
  }, [isOpen, editData]);

  const handleAddIP = () => {
    const ipToAdd = newIP || customIP;
    if (ipToAdd && !formData.ipAddresses.includes(ipToAdd)) {
      setFormData(prev => ({
        ...prev,
        ipAddresses: [...prev.ipAddresses, ipToAdd]
      }));
      setNewIP('');
      setCustomIP('');
    }
  };

  const handleRemoveIP = (ip: string) => {
    setFormData(prev => ({
      ...prev,
      ipAddresses: prev.ipAddresses.filter(existingIP => existingIP !== ip),
      // Clear IP address from subdomains using this IP
      queues: prev.queues.map(queue => ({
        ...queue,
        ipAddress: queue.ipAddress === ip ? '' : queue.ipAddress
      }))
    }));
  };

  const addSubdomain = () => {
    setFormData(prev => ({
      ...prev,
      queues: [...prev.queues, {
        name: '',
        ipAddress: '',
        subdomain: '',
        type: '',
        queueStatus: 'Active' as QueueStatus,
        targetIsps: []
      }]
    }));
  };

  const removeSubdomain = (index: number) => {
    setFormData(prev => ({
      ...prev,
      queues: prev.queues.filter((_, i) => i !== index)
    }));
  };

  const updateSubdomain = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      queues: prev.queues.map((queue, i) => 
        i === index ? { ...queue, [field]: value } : queue
      )
    }));
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editData ? 'Edit Domain' : 'Add New Domain'}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Domain Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="example.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Add IP Address</Form.Label>
            <Row>
              <Col md={5}>
                <Form.Select
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  className="mb-2"
                >
                  <option value="">Select an IP address</option>
                  {availableIPs
                    .filter(ip => !formData.ipAddresses.includes(ip))
                    .map(ip => (
                      <option key={ip} value={ip}>{ip}</option>
                    ))
                  }
                </Form.Select>
              </Col>
              <Col md={5}>
                <Form.Control
                  type="text"
                  placeholder="Or enter custom IP"
                  value={customIP}
                  onChange={(e) => setCustomIP(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button 
                  variant="primary"
                  onClick={handleAddIP}
                  className="w-100"
                >
                  Add IP
                </Button>
              </Col>
            </Row>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Selected IP Addresses</Form.Label>
            <div className="d-flex flex-wrap gap-2 border rounded p-2">
              {formData.ipAddresses.length === 0 ? (
                <span className="text-muted">No IP addresses selected</span>
              ) : (
                formData.ipAddresses.map(ip => (
                  <Badge 
                    key={ip} 
                    bg="secondary" 
                    className="d-flex align-items-center p-2"
                  >
                    {ip}
                    <Button
                      variant="link"
                      className="p-0 ms-2 text-white"
                      onClick={() => handleRemoveIP(ip)}
                    >
                      <X size={14} />
                    </Button>
                  </Badge>
                ))
              )}
            </div>
          </Form.Group>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Form.Label className="mb-0">Subdomains</Form.Label>
              <Button
                variant="link"
                onClick={addSubdomain}
                className="p-0"
              >
                <Plus className="me-1" size={16} />
                Add Subdomain
              </Button>
            </div>

            {formData.queues.map((queue, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="mb-0">Subdomain {index + 1}</h6>
                  {formData.queues.length > 1 && (
                    <Button
                      variant="link"
                      className="p-0 text-danger"
                      onClick={() => removeSubdomain(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subdomain Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={queue.name}
                        onChange={(e) => updateSubdomain(index, 'name', e.target.value)}
                        placeholder="mail.example.com"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>IP Address</Form.Label>
                      <Form.Select
                        value={queue.ipAddress}
                        onChange={(e) => updateSubdomain(index, 'ipAddress', e.target.value)}
                        required
                      >
                        <option value="">Select IP address</option>
                        {formData.ipAddresses.map(ip => (
                          <option key={ip} value={ip}>{ip}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Queue Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={queue.name}
                        onChange={(e) => updateSubdomain(index, 'name', e.target.value)}
                        placeholder="example.com-fresh"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(formData)}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 