import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { X, Plus, Trash2 } from 'lucide-react';

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (domain: DomainFormData) => void;
  editData?: Domain;
  availableIPs: string[];
}

export interface DomainFormData {
  domain: string;
  subdomains: {
    name: string;
    ipAddress: string;
    queueName: string;
    queueStatus: QueueStatus;
  }[];
}

const initialFormData: DomainFormData = {
  domain: '',
  subdomains: [{
    name: '',
    ipAddress: '',
    queueName: '',
    queueStatus: 'Active' as QueueStatus
  }]
};

export function DomainModal({ isOpen, onClose, onSave, editData, availableIPs }: DomainModalProps) {
  const [formData, setFormData] = useState<DomainFormData>(initialFormData);
  const [customIP, setCustomIP] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          domain: editData.domain,
          subdomains: editData.subdomains.map(sub => ({
            name: sub.name,
            ipAddress: sub.ipAddress,
            queueName: sub.queueName,
            queueStatus: sub.queueStatus
          }))
        });
      } else {
        setFormData(initialFormData);
        setCustomIP('');
      }
    }
  }, [isOpen, editData]);

  const addSubdomain = () => {
    setFormData(prev => ({
      ...prev,
      subdomains: [...prev.subdomains, {
        name: '',
        ipAddress: '',
        queueName: '',
        queueStatus: 'Active' as QueueStatus
      }]
    }));
  };

  const removeSubdomain = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subdomains: prev.subdomains.filter((_, i) => i !== index)
    }));
  };

  const updateSubdomain = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      subdomains: prev.subdomains.map((sub, i) => 
        i === index ? { ...sub, [field]: value } : sub
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editData ? 'Edit Domain' : 'Add New Domain'}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
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

            {formData.subdomains.map((subdomain, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="mb-0">Subdomain {index + 1}</h6>
                  {formData.subdomains.length > 1 && (
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
                        value={subdomain.name}
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
                        value={subdomain.ipAddress}
                        onChange={(e) => updateSubdomain(index, 'ipAddress', e.target.value)}
                      >
                        <option value="">Select IP or enter custom</option>
                        {availableIPs.map(ip => (
                          <option key={ip} value={ip}>{ip}</option>
                        ))}
                      </Form.Select>
                      {subdomain.ipAddress === '' && (
                        <Form.Control
                          type="text"
                          value={customIP}
                          onChange={(e) => {
                            setCustomIP(e.target.value);
                            updateSubdomain(index, 'ipAddress', e.target.value);
                          }}
                          placeholder="Enter custom IP"
                          className="mt-2"
                        />
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Queue Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={subdomain.queueName}
                        onChange={(e) => updateSubdomain(index, 'queueName', e.target.value)}
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
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 