import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table } from 'react-bootstrap';
import type { Queue, ISPTarget, QueueType, Subdomain } from '../types/domain';

interface QueueManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  subdomain: Subdomain;
  recipientDomains: {
    name: string;
    settings: {
      [key: string]: string;
    };
  }[];
  onSave: (queues: Queue[]) => void;
}

interface RecipientDomainSettings {
  [key: string]: string;  // This allows for dynamic settings
}

interface RecipientDomain {
  name: string;
  settings: RecipientDomainSettings;
}

export function QueueManagementModal({ 
  isOpen, 
  onClose, 
  domain,
  subdomain,
  recipientDomains,
  onSave 
}: QueueManagementModalProps) {
  const [localRecipientDomains, setLocalRecipientDomains] = useState<RecipientDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  useEffect(() => {
    if (isOpen && recipientDomains) {
      setLocalRecipientDomains(recipientDomains);
    }
  }, [isOpen, recipientDomains]);

  const handleSettingChange = (domainName: string, setting: string, value: string) => {
    setLocalRecipientDomains(prev => prev.map(domain => {
      if (domain.name === domainName) {
        return {
          ...domain,
          settings: {
            ...domain.settings,
            [setting]: value
          }
        };
      }
      return domain;
    }));
  };

  const formatSettingName = (key: string): string => {
    // Convert snake_case or kebab-case to Title Case
    return key
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Queue Settings - {subdomain.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label>Select Recipient Domain</Form.Label>
            <Form.Select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              <option value="">Select a domain</option>
              {localRecipientDomains.map(domain => (
                <option key={domain.name} value={domain.name}>
                  {domain.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedDomain && (
            <div className="border rounded p-3">
              <h6 className="mb-3">Settings for {selectedDomain}</h6>
              <Row>
                {Object.entries(
                  localRecipientDomains.find(d => d.name === selectedDomain)?.settings || {}
                ).map(([key, value]) => (
                  <Col md={6} key={key}>
                    <Form.Group className="mb-3">
                      <Form.Label>{formatSettingName(key)}</Form.Label>
                      <Form.Control
                        type="text"
                        value={value}
                        onChange={(e) => handleSettingChange(selectedDomain, key, e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          <div className="mt-4">
            <h6>All Recipient Domains</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Domain</th>
                  {/* Dynamically generate headers based on available settings */}
                  {Array.from(
                    new Set(
                      localRecipientDomains.flatMap(domain => 
                        Object.keys(domain.settings)
                      )
                    )
                  ).map(setting => (
                    <th key={setting}>{formatSettingName(setting)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {localRecipientDomains.map((domain, index) => (
                  <tr key={`${domain.name}-${index}`}>
                    <td>{domain.name}</td>
                    {Array.from(
                      new Set(
                        localRecipientDomains.flatMap(domain => 
                          Object.keys(domain.settings)
                        )
                      )
                    ).map((setting, settingIndex) => (
                      <td key={`${domain.name}-${setting}-${settingIndex}`}>
                        {domain.settings[setting] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={() => {
            // Transform recipient domains back to queues format if needed
            onSave(subdomain.queues);
            onClose();
          }}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 