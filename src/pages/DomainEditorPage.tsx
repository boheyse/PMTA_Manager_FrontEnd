import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import type { Domain, QueueStatus, Subdomain, Queue } from '../types/domain';
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

  const [activeTab, setActiveTab] = useState<string>('queue-0');
  const [domain, setDomain] = useState<string>(existingDomain?.domain || '');
  const [ipAddresses, setIpAddresses] = useState<string[]>(existingDomain?.ipAddresses || []);
  const [queues, setQueues] = useState<Queue[]>(existingDomain?.queues || []);
  const [newIP, setNewIP] = useState('');
  const [customIP, setCustomIP] = useState('');
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [activeRecipientDomain, setActiveRecipientDomain] = useState<string>('rd-0');

  // Initialize the first queue tab if exists
  useState(() => {
    if (queues.length > 0) {
      setSelectedQueue(queues[0].name);
      setActiveTab(queues[0].name);
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

  const handleAddQueue = () => {
    const newQueue: Queue = {
      name: '',
      ipAddress: '',
      subdomain: '',
      type: '',
      queueStatus: 'Active',
      targetIsps: []
    };
    const newIndex = queues.length;
    setQueues(prev => [...prev, newQueue]);
    setActiveTab(`queue-${newIndex}`);
  };

  const handleRemoveQueue = (index: number) => {
    setQueues(prev => prev.filter((_, i) => i !== index));
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
          queues
        }),
      });

      if (!response.ok) throw new Error('Failed to save domain');
      
      navigate('/sending-domains');
    } catch (error) {
      console.error('Error saving domain:', error);
    }
  };

  const generateQueueName = (ip: string, domain: string, type: string): string => {
    if (!ip || !domain) return '';
    return type ? `${ip}-${domain}-${type}` : `${ip}-${domain}`;
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

      {/* Fixed Domain Settings Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Domain Settings</h2>
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

      {/* Queues Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">Queues</h2>
        <Button
          variant="outline-primary"
          onClick={handleAddQueue}
          className="mb-4"
        >
          Add Queue
        </Button>

        {queues.length > 0 && (
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'domain')}
            className="mb-4 bg-gray-100 p-3 rounded"
          >
            {queues.map((queue, index) => (
              <Tab 
                key={`queue-${index}`}
                eventKey={`queue-${index}`}
                title={queue.name || `New Queue ${index + 1}`}
              >
                <div className="bg-white rounded-lg shadow p-6">
                  <Form>
                    {/* Display auto-generated queue name */}
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Queue Name (Auto-generated)</Form.Label>
                          <Form.Control
                            type="text"
                            value={queue.name}
                            readOnly
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Subdomain</Form.Label>
                          <Form.Control
                            type="text"
                            value={queue.subdomain || ''}
                            onChange={(e) => {
                              const newQueues = [...queues];
                              newQueues[index] = {
                                ...newQueues[index],
                                subdomain: e.target.value,
                                name: generateQueueName(
                                  newQueues[index].ipAddress,
                                  domain,
                                  newQueues[index].type || ''
                                )
                              };
                              setQueues(newQueues);
                            }}
                            placeholder="mail.example.com"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>IP Address</Form.Label>
                          <Form.Select
                            value={queue.ipAddress || ''}
                            onChange={(e) => {
                              const newQueues = [...queues];
                              newQueues[index] = {
                                ...newQueues[index],
                                ipAddress: e.target.value,
                                name: generateQueueName(
                                  e.target.value,
                                  domain,
                                  newQueues[index].type || ''
                                )
                              };
                              setQueues(newQueues);
                            }}
                          >
                            <option value="">Select IP address</option>
                            {ipAddresses.map(ip => (
                              <option key={ip} value={ip}>{ip}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Type</Form.Label>
                          <Form.Control
                            type="text"
                            value={queue.type || ''}
                            onChange={(e) => {
                              const newQueues = [...queues];
                              newQueues[index] = {
                                ...newQueues[index],
                                type: e.target.value,
                                name: generateQueueName(
                                  newQueues[index].ipAddress,
                                  domain,
                                  e.target.value
                                )
                              };
                              setQueues(newQueues);
                            }}
                            placeholder="ex) unthrottled, fresh, engaged"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="mt-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Target ISPs</h6>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            const newQueues = [...queues];
                            const newIndex = newQueues[index].targetIsps.length;
                            newQueues[index].targetIsps.push({
                              name: '',
                              settings: {}
                            });
                            setQueues(newQueues);
                            setActiveRecipientDomain(`rd-${newIndex}`);
                          }}
                        >
                          Add Target ISP
                        </Button>
                      </div>

                      {queue.targetIsps.length > 0 && (
                        <Tabs
                          activeKey={activeRecipientDomain}
                          onSelect={(k) => setActiveRecipientDomain(k || '')}
                          className="mb-4"
                        >
                          {queue.targetIsps.map((isp, rdIndex) => (
                            <Tab
                              key={`rd-${rdIndex}`}
                              eventKey={`rd-${rdIndex}`}
                              title={isp.name || `New Target ISP ${rdIndex + 1}`}
                            >
                              <div className="border rounded p-3">
                                <Row className="align-items-center mb-3">
                                  <Col md={3}>
                                    <Form.Control
                                      type="text"
                                      value={isp.name}
                                      onChange={(e) => {
                                        const newQueues = [...queues];
                                        newQueues[index].targetIsps[rdIndex].name = e.target.value;
                                        setQueues(newQueues);
                                      }}
                                      placeholder="Enter Target ISP"
                                    />
                                  </Col>
                                  <Col md={9} className="text-end">
                                    <Button
                                      variant="link"
                                      className="p-0"
                                      onClick={() => {
                                        const newQueues = [...queues];
                                        const settings = newQueues[index].targetIsps[rdIndex].settings;
                                        settings[''] = '';
                                        setQueues(newQueues);
                                      }}
                                    >
                                      <Plus size={16} className="me-1" />
                                      Add Setting
                                    </Button>
                                  </Col>
                                </Row>

                                <div className="d-flex flex-wrap gap-3">
                                  {Object.entries(isp.settings).map(([key, value]) => (
                                    <div key={key} className="d-flex align-items-center gap-2" style={{ width: 'calc(50% - 12px)', marginBottom: '8px' }}>
                                      {key === '' ? (
                                        <SearchableSelect
                                          options={Object.keys(recipientDomainSettings)}
                                          placeholder="Select setting"
                                          onChange={(selected) => {
                                            const newQueues = [...queues];
                                            const settings = newQueues[index].targetIsps[rdIndex].settings;
                                            delete settings[''];
                                            settings[selected[0]] = value;
                                            setQueues(newQueues);
                                          }}
                                        />
                                      ) : (
                                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                                          <div style={{ width: '45%' }}>
                                            <Form.Control
                                              type="text"
                                              value={key}
                                              readOnly
                                              size="sm"
                                              className="bg-light"
                                            />
                                          </div>
                                          <div style={{ width: '45%' }}>
                                            <Form.Control
                                              type="text"
                                              value={value}
                                              onChange={(e) => {
                                                const newQueues = [...queues];
                                                newQueues[index].targetIsps[rdIndex].settings[key] = e.target.value;
                                                setQueues(newQueues);
                                              }}
                                              placeholder={recipientDomainSettings[key as keyof typeof recipientDomainSettings]?.syntax || "Enter value"}
                                              size="sm"
                                              className="hover:bg-gray-50 focus:bg-white transition-colors"
                                              style={{ cursor: 'text' }}
                                            />
                                          </div>
                                          <Button
                                            variant="link"
                                            className="text-danger p-0"
                                            onClick={() => {
                                              const newQueues = [...queues];
                                              delete newQueues[index].targetIsps[rdIndex].settings[key];
                                              setQueues(newQueues);
                                            }}
                                          >
                                            <X size={14} />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Tab>
                          ))}
                        </Tabs>
                      )}
                    </div>
                  </Form>
                </div>
              </Tab>
            ))}
          </Tabs>
        )}
      </div>

      <div className="flex justify-end mt-6">
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