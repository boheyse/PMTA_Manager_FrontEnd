import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table } from 'react-bootstrap';
import type { Queue, ISPTarget, QueueType, Subdomain } from '../types/domain';

interface QueueManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  subdomain: Subdomain;
  onSave: (queues: Queue[]) => void;
}

interface RecipientDomainSettings {
  maxSmtpOut?: string;
  maxMsgPerConnection?: string;
  maxMsgRate?: string;
  smtpHosts?: string;
  useStartTLS?: string;
  queueTo?: string;
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
  onSave 
}: QueueManagementModalProps) {
  const [recipientDomains, setRecipientDomains] = useState<RecipientDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  useEffect(() => {
    if (isOpen && subdomain) {
      // Initialize recipient domains from the subdomain data
      const domains = [
        {
          name: 'gmail.rollup',
          settings: {
            maxSmtpOut: '5',
            maxMsgPerConnection: '50',
            maxMsgRate: '1/m',
            smtpHosts: 'aspmx.l.google.com, alt1.aspmx.l.google.com',
            useStartTLS: 'yes'
          }
        },
        {
          name: 'hotmail.rollup',
          settings: {
            maxMsgRate: '120/h',
            smtpHosts: 'lookup-mx:outlook.com'
          }
        },
        {
          name: 'yahooaol.rollup',
          settings: {
            maxSmtpOut: '20',
            maxMsgPerConnection: '20',
            maxMsgRate: '60/h',
            smtpHosts: 'mta5.am0.yahoodns.net, mta6.am0.yahoodns.net'
          }
        }
      ];
      setRecipientDomains(domains);
    }
  }, [isOpen, subdomain]);

  const handleSettingChange = (domainName: string, setting: keyof RecipientDomainSettings, value: string) => {
    setRecipientDomains(prev => prev.map(domain => {
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
              {recipientDomains.map(domain => (
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
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max SMTP Out</Form.Label>
                    <Form.Control
                      type="text"
                      value={recipientDomains.find(d => d.name === selectedDomain)?.settings.maxSmtpOut || ''}
                      onChange={(e) => handleSettingChange(selectedDomain, 'maxSmtpOut', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Messages Per Connection</Form.Label>
                    <Form.Control
                      type="text"
                      value={recipientDomains.find(d => d.name === selectedDomain)?.settings.maxMsgPerConnection || ''}
                      onChange={(e) => handleSettingChange(selectedDomain, 'maxMsgPerConnection', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Message Rate</Form.Label>
                    <Form.Control
                      type="text"
                      value={recipientDomains.find(d => d.name === selectedDomain)?.settings.maxMsgRate || ''}
                      onChange={(e) => handleSettingChange(selectedDomain, 'maxMsgRate', e.target.value)}
                      placeholder="e.g., 60/h, 1/m"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Use StartTLS</Form.Label>
                    <Form.Select
                      value={recipientDomains.find(d => d.name === selectedDomain)?.settings.useStartTLS || ''}
                      onChange={(e) => handleSettingChange(selectedDomain, 'useStartTLS', e.target.value)}
                    >
                      <option value="">Select option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>SMTP Hosts</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={recipientDomains.find(d => d.name === selectedDomain)?.settings.smtpHosts || ''}
                      onChange={(e) => handleSettingChange(selectedDomain, 'smtpHosts', e.target.value)}
                      placeholder="Comma-separated list of SMTP hosts"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}

          <div className="mt-4">
            <h6>All Recipient Domains</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Max Rate</th>
                  <th>Max SMTP Out</th>
                  <th>Messages Per Conn</th>
                </tr>
              </thead>
              <tbody>
                {recipientDomains.map(domain => (
                  <tr key={domain.name}>
                    <td>{domain.name}</td>
                    <td>{domain.settings.maxMsgRate || '-'}</td>
                    <td>{domain.settings.maxSmtpOut || '-'}</td>
                    <td>{domain.settings.maxMsgPerConnection || '-'}</td>
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