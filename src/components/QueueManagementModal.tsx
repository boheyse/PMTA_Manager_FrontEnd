import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Info, Plus } from 'lucide-react';
import type { Queue, ISPTarget, QueueType, Subdomain } from '../types/domain';
import { recipientDomainSettings } from '../config/recipientDomainSettings';
import { SearchableSelect } from './SearchableSelect';

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
  [key: string]: string;
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
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingValue, setNewSettingValue] = useState('');
  const [showNewSettingForm, setShowNewSettingForm] = useState(false);

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

  const handleAddNewSetting = () => {
    if (selectedDomain && newSettingKey && newSettingValue) {
      setLocalRecipientDomains(prev => prev.map(domain => {
        if (domain.name === selectedDomain) {
          return {
            ...domain,
            settings: {
              ...domain.settings,
              [newSettingKey]: newSettingValue
            }
          };
        }
        return domain;
      }));
      setNewSettingKey('');
      setNewSettingValue('');
      setShowNewSettingForm(false);
    }
  };

  const formatSettingName = (key: string): string => {
    return key
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderSettingLabel = (key: string) => (
    <div className="d-flex align-items-center">
      <span>{formatSettingName(key)}</span>
      {recipientDomainSettings[key as keyof typeof recipientDomainSettings] && (
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip>
              <div>
                <strong>Description:</strong> {recipientDomainSettings[key as keyof typeof recipientDomainSettings].description}
                <br />
                <strong>Default:</strong> {recipientDomainSettings[key as keyof typeof recipientDomainSettings].default}
              </div>
            </Tooltip>
          }
        >
          <div className="ms-2 cursor-help">
            <Info size={16} className="text-muted" />
          </div>
        </OverlayTrigger>
      )}
    </div>
  );

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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Settings for {selectedDomain}</h6>
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => setShowNewSettingForm(true)}
                >
                  <Plus className="me-1" size={16} />
                  Add Setting
                </Button>
              </div>

              {showNewSettingForm && (
                <div className="mb-4 p-3 border rounded bg-light">
                  <Row>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>Setting Name</Form.Label>
                        <SearchableSelect
                          options={Object.keys(recipientDomainSettings)}
                          placeholder="Select or type setting name"
                          onChange={(selected) => setNewSettingKey(selected[0] || '')}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>Value</Form.Label>
                        <Form.Control
                          type="text"
                          value={newSettingValue}
                          onChange={(e) => setNewSettingValue(e.target.value)}
                          placeholder={
                            newSettingKey && recipientDomainSettings[newSettingKey as keyof typeof recipientDomainSettings]?.syntax || 
                            "Enter value"
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button
                        variant="primary"
                        onClick={handleAddNewSetting}
                        className="w-100 mb-3"
                      >
                        Add
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}

              <Row>
                {Object.entries(
                  localRecipientDomains.find(d => d.name === selectedDomain)?.settings || {}
                ).map(([key, value]) => (
                  <Col md={6} key={key}>
                    <Form.Group className="mb-3">
                      <Form.Label>{renderSettingLabel(key)}</Form.Label>
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