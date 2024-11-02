import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import type { Domain, QueueStatus, Subdomain } from '../types/domain';
import { SearchableSelect } from '../components/SearchableSelect';
import { recipientDomainSettings } from '../config/recipientDomainSettings';

interface LocationState {
  domain?: Domain;
  availableIPs: string[];
}

export function DomainEditorPage() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { domain: existingDomain, availableIPs } = location.state as LocationState;

  const [activeTab, setActiveTab] = useState<string>('domain');
  const [domain, setDomain] = useState<string>(existingDomain?.domain || '');
  const [ipAddresses, setIpAddresses] = useState<string[]>(existingDomain?.ipAddresses || []);
  const [subdomains, setSubdomains] = useState<Subdomain[]>(existingDomain?.subdomains || []);
  const [newIP, setNewIP] = useState('');
  const [customIP, setCustomIP] = useState('');
  const [selectedSubdomain, setSelectedSubdomain] = useState<string | null>(null);

  // Initialize the first subdomain tab if exists
  useState(() => {
    if (subdomains.length > 0) {
      setSelectedSubdomain(subdomains[0].name);
      setActiveTab(subdomains[0].name);
    }
  }, []);

  const handleAddIP = () => {
    const ipToAdd = newIP || customIP;
    if (ipToAdd && !ipAddresses.includes(ipToAdd)) {
      setIpAddresses(prev => [...prev, ipToAdd]);
      setNewIP('');
      setCustomIP('');
    }
  };

  const handleRemoveIP = (ip: string) => {
    setIpAddresses(prev => prev.filter(existingIP => existingIP !== ip));
  };

  const handleAddSubdomain = () => {
    const newSubdomain: Subdomain = {
      name: '',
      ipAddress: '',
      queueStatus: 'Active',
      queueName: '',
      queues: [],
      recipientDomains: []
    };
    setSubdomains(prev => [...prev, newSubdomain]);
  };

  const handleRemoveSubdomain = (index: number) => {
    setSubdomains(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const method = domainId ? 'PUT' : 'POST';
      const url = domainId 
        ? `http://localhost:5000/domains/${domainId}`
        : 'http://localhost:5000/domains';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          ipAddresses,
          subdomains
        }),
      });

      if (!response.ok) throw new Error('Failed to save domain');
      
      navigate('/sending-domains');
    } catch (error) {
      console.error('Error saving domain:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/sending-domains')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold">
          {domainId ? 'Edit Domain' : 'Add New Domain'}
        </h1>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'domain')}
        className="mb-4"
      >
        <Tab eventKey="domain" title="Domain Settings">
          <div className="bg-white rounded-lg shadow p-6">
            <Form>
              <Form.Group className="mb-4">
                <Form.Label>Domain Name</Form.Label>
                <Form.Control
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>IP Addresses</Form.Label>
                <Row>
                  <Col md={5}>
                    <Form.Select
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                      className="mb-2"
                    >
                      <option value="">Select an IP address</option>
                      {availableIPs
                        .filter(ip => !ipAddresses.includes(ip))
                        .map(ip => (
                          <option key={ip} value={ip}>{ip}</option>
                        ))}
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

              <div className="mb-4">
                <div className="d-flex flex-wrap gap-2 border rounded p-2">
                  {ipAddresses.length === 0 ? (
                    <span className="text-muted">No IP addresses selected</span>
                  ) : (
                    ipAddresses.map(ip => (
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
              </div>
            </Form>
          </div>
        </Tab>

        {subdomains.map((subdomain, index) => (
          <Tab 
            key={subdomain.queueName || index} 
            eventKey={subdomain.queueName || `new-${index}`}
            title={
              <div className="d-flex align-items-center">
                <span>{subdomain.queueName || `New Subdomain ${index + 1}`}</span>
                {subdomains.length > 1 && (
                  <Button
                    variant="link"
                    className="p-0 ms-2 text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSubdomain(index);
                    }}
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            }
          >
            <div className="bg-white rounded-lg shadow p-6">
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subdomain Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={subdomain.name}
                        onChange={(e) => {
                          const newSubdomains = [...subdomains];
                          newSubdomains[index].name = e.target.value;
                          setSubdomains(newSubdomains);
                        }}
                        placeholder="mail.example.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>IP Address</Form.Label>
                      <Form.Select
                        value={subdomain.ipAddress}
                        onChange={(e) => {
                          const newSubdomains = [...subdomains];
                          newSubdomains[index].ipAddress = e.target.value;
                          setSubdomains(newSubdomains);
                        }}
                      >
                        <option value="">Select IP address</option>
                        {ipAddresses.map(ip => (
                          <option key={ip} value={ip}>{ip}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4">
                  <h6 className="mb-3">Recipient Domains</h6>
                  {subdomain.recipientDomains.map((rd, rdIndex) => (
                    <div key={rd.name} className="border rounded p-3 mb-3">
                      <Form.Group className="mb-3">
                        <Form.Label>Domain</Form.Label>
                        <Form.Control
                          type="text"
                          value={rd.name}
                          onChange={(e) => {
                            const newSubdomains = [...subdomains];
                            newSubdomains[index].recipientDomains[rdIndex].name = e.target.value;
                            setSubdomains(newSubdomains);
                          }}
                        />
                      </Form.Group>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Form.Label className="mb-0">Settings</Form.Label>
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => {
                              const newSubdomains = [...subdomains];
                              const settings = newSubdomains[index].recipientDomains[rdIndex].settings;
                              settings['new-setting'] = '';
                              setSubdomains(newSubdomains);
                            }}
                          >
                            <Plus size={16} className="me-1" />
                            Add Setting
                          </Button>
                        </div>

                        {Object.entries(rd.settings).map(([key, value]) => (
                          <Row key={key} className="mb-2">
                            <Col md={6}>
                              <SearchableSelect
                                options={Object.keys(recipientDomainSettings)}
                                placeholder="Select setting"
                                onChange={(selected) => {
                                  const newSubdomains = [...subdomains];
                                  const settings = newSubdomains[index].recipientDomains[rdIndex].settings;
                                  delete settings[key];
                                  settings[selected[0]] = value;
                                  setSubdomains(newSubdomains);
                                }}
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Control
                                type="text"
                                value={value}
                                onChange={(e) => {
                                  const newSubdomains = [...subdomains];
                                  newSubdomains[index].recipientDomains[rdIndex].settings[key] = e.target.value;
                                  setSubdomains(newSubdomains);
                                }}
                                placeholder={recipientDomainSettings[key as keyof typeof recipientDomainSettings]?.syntax || "Enter value"}
                              />
                            </Col>
                          </Row>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      const newSubdomains = [...subdomains];
                      newSubdomains[index].recipientDomains.push({
                        name: '',
                        settings: {}
                      });
                      setSubdomains(newSubdomains);
                    }}
                  >
                    Add Recipient Domain
                  </Button>
                </div>
              </Form>
            </div>
          </Tab>
        ))}
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline-primary"
          onClick={handleAddSubdomain}
        >
          Add Subdomain
        </Button>
        <div className="space-x-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/sending-domains')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
} 