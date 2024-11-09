import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { X, Plus, ArrowLeft } from 'lucide-react';
import type { Domain, Queue, QueuePool } from '../types/domain';
import { StringInterpreter } from '../components/StringInterpreter';
import { useSidebar } from '../context/SidebarContext';

interface LocationState {
  domain?: Domain;
  availableIPs: string[];
}

interface ConfigSection {
  key?: string | null;
  content: ConfigContent[];
  name?: string | null;
  type: string;
  index: number;
}

interface ConfigContent {
  key?: string | null;
  type: string;
  value?: string | null;
}

interface ConfigState {
  sections: ConfigSection[];
  editHistory: {
    index: number;
    type: 'add' | 'update' | 'delete';
    timestamp: number;
  }[];
}

interface ConfigResponse {
  data: ConfigSection[];
  status: string;
}

export function DomainEditorPage() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { domain: existingDomain, availableIPs } = location.state as LocationState;
  const { setShowSidebar } = useSidebar();

  const [domain, setDomain] = useState<string>(existingDomain?.domainName || '');
  const [ipAddresses, setIpAddresses] = useState<string[]>(existingDomain?.ipAddresses || []);
  const [queuePools, setQueuePools] = useState<QueuePool[]>([]);
  const [newIP, setNewIP] = useState('');
  const [customIP, setCustomIP] = useState('');
  const [activePoolTab, setActivePoolTab] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainConfig, setDomainConfig] = useState<any>(null);
  const [poolConfigs, setPoolConfigs] = useState<Record<string, any>>({});
  const [configState, setConfigState] = useState<ConfigState>({
    sections: [],
    editHistory: []
  });
  const [activeQueueTab, setActiveQueueTab] = useState<string>('');

  // Hide sidebar when component mounts
  useEffect(() => {
    setShowSidebar(false);
    return () => setShowSidebar(true);
  }, [setShowSidebar]);

  // Initialize queue pools from existing domain
  useEffect(() => {
    if (existingDomain?.queuePools) {
      setQueuePools(existingDomain.queuePools);
      if (existingDomain.queuePools.length > 0) {
        const firstPool = existingDomain.queuePools[0];
        setActivePoolTab(firstPool.queuePoolName);
        fetchDomainConfig(
          existingDomain.domainName,
          firstPool.queuePoolName,
          firstPool.type || ''
        );
      }
    }
  }, [existingDomain]);

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

  const handleAddQueuePool = () => {
    const newPool: QueuePool = {
      queuePoolName: `${domain}-pool-${queuePools.length + 1}`,
      queues: [],
      type: ''
    };
    setQueuePools(prev => [...prev, newPool]);
    setActivePoolTab(newPool.queuePoolName);
  };

  const handleRemoveQueuePool = (poolName: string) => {
    setQueuePools(prev => prev.filter(pool => pool.queuePoolName !== poolName));
  };

  const handleAddQueueToPool = (poolName: string) => {
    setQueuePools(prev => prev.map(pool => {
      if (pool.queuePoolName === poolName) {
        const newQueue: Queue = {
          queueName: '',
          ipAddress: '',
          subdomain: '',
          type: pool.type,
        };
        return {
          ...pool,
          queues: [...pool.queues, newQueue]
        };
      }
      return pool;
    }));
  };

  const fetchDomainConfig = async (domainName: string, poolName: string, poolType: string) => {
    try {
      const fileName = poolType 
        ? `${domainName}-${poolType}.vmta.json`
        : `${domainName}.vmta.json`;

      const response = await fetch(
        `http://127.0.0.1:5000/domain-config/${fileName}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      
      const transformedData: ConfigSection[] = rawData.data.map((section: any) => ({
        name: section.name ?? null,
        content: Array.isArray(section.content) 
          ? section.content.map((item: any) => ({
              key: item?.key ?? null,
              type: item?.type ?? 'unknown',
              value: item?.value ?? null
            }))
          : [],
        index: section.index,
        key: section.key ?? null,
        type: section.type ?? 'unknown'
      }));

      setPoolConfigs(prev => ({
        ...prev,
        [poolName]: {
          data: transformedData,
          status: rawData.status
        }
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch domain configuration');
      console.error('Error fetching domain config:', err);
    }
  };

  // Update the tab change handler
  const handleTabChange = (poolName: string) => {
    setActivePoolTab(poolName);
    const pool = queuePools.find(p => p.queuePoolName === poolName);
    if (pool && existingDomain?.domainName) {
      fetchDomainConfig(existingDomain.domainName, poolName, pool.type || '');
    }
  };

  const handleSettingChange = (
    sectionIndex: number,
    settingIndex: number,
    newValue: string
  ) => {
    setConfigState(prev => {
      const newSections = [...prev.sections];
      const section = newSections[sectionIndex];
      if (section.content[settingIndex]) {
        section.content[settingIndex].value = newValue;
      }

      return {
        sections: newSections,
        editHistory: [
          ...prev.editHistory,
          {
            index: sectionIndex,
            type: 'update',
            timestamp: Date.now()
          }
        ]
      };
    });
  };

  const handleAddSection = (index: number, newSection: ConfigSection) => {
    setConfigState(prev => {
      const newSections = [
        ...prev.sections.slice(0, index),
        newSection,
        ...prev.sections.slice(index)
      ];

      return {
        sections: newSections,
        editHistory: [
          ...prev.editHistory,
          {
            index,
            type: 'add',
            timestamp: Date.now()
          }
        ]
      };
    });
  };

  const getQueueNames = (config: ConfigSection[]): string[] => {
    return config
      .filter(section => section.type === 'section_start' && section.name === 'virtual-mta')
      .map(section => section.name || '');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Editor Section - 65% */}
      <div className="w-[65%] overflow-y-auto p-6">
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

        {/* Domain Settings Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Domain Settings</h2>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label>Domain Name</Form.Label>
              <Form.Control
                type="text"
                value={existingDomain?.domainName || ''}
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

        {/* Queue Pools Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Queue Pools</h2>
            <Button
              variant="outline-primary"
              onClick={handleAddQueuePool}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Queue Pool
            </Button>
          </div>

          <Tabs
            activeKey={activePoolTab}
            onSelect={(k) => k && handleTabChange(k)}
            className="mb-4"
          >
            {queuePools.map((pool) => (
              <Tab
                key={pool.queuePoolName}
                eventKey={pool.queuePoolName}
                title={
                  <div className="flex items-center">
                    {pool.queuePoolName}
                    <Button
                      variant="link"
                      className="ml-2 p-0 text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveQueuePool(pool.queuePoolName);
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                }
              >
                <div className="p-4 border rounded">
                  {poolConfigs[pool.queuePoolName] && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Queue Configuration</h3>
                        <Button
                          variant="primary"
                          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handleAddQueueToPool(pool.queuePoolName)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Queue
                        </Button>
                      </div>
                      
                      <Tabs
                        activeKey={activeQueueTab}
                        onSelect={(k) => k && setActiveQueueTab(k)}
                        className="mb-4"
                      >
                        {poolConfigs[pool.queuePoolName].data
                          .filter((section: ConfigSection) => 
                            section.type === 'section_start' && 
                            section.key === 'virtual-mta' &&
                            section.name
                          )
                          .map((section: ConfigSection) => (
                            <Tab
                              key={section.name}
                              eventKey={section.name || ''}
                              title={section.name}
                            >
                              <div className="p-4 border rounded mt-4">
                                {/* Queue settings will go here in future */}
                                <pre className="text-sm">
                                  {JSON.stringify(section.content, null, 2)}
                                </pre>
                              </div>
                            </Tab>
                          ))}
                      </Tabs>
                    </div>
                  )}
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>

      {/* String Interpreter Section - 35% */}
      <div className="w-[35%] border-l border-gray-200 overflow-y-auto">
        <StringInterpreter 
          originalDomain={existingDomain?.domainName || ''} 
          modifiedDomain={domain}
        />
      </div>
    </div>
  );
} 