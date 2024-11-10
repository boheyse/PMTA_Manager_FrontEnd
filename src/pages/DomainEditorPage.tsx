import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { StringInterpreter } from '../components/StringInterpreter';
import type { Domain, QueuePool, Section, Setting } from '../types/domain';
import cloneDeep from 'lodash/cloneDeep';
import { AddQueueModal } from '../components/AddQueueModal';

interface LocationState {
  domain?: Domain;
  availableIPs: string[];
}

export function DomainEditorPage() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { domain: existingDomain, availableIPs } = location.state as LocationState;
  const { setShowSidebar } = useSidebar();

  const [domain, setDomain] = useState(existingDomain?.domainName || '');
  const [ipAddresses, setIpAddresses] = useState(existingDomain?.ipAddresses || []);
  const [newIP, setNewIP] = useState('');
  const [customIP, setCustomIP] = useState('');
  const [activeQueueTab, setActiveQueueTab] = useState<string>('');
  const [poolData, setPoolData] = useState<{ [key: string]: Section[] }>({});
  const [originalPoolData, setOriginalPoolData] = useState<{ [key: string]: Section[] }>({});
  const [poolName, setPoolName] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [originalString, setOriginalString] = useState<string>('');
  const [modifiedString, setModifiedString] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddQueueModal, setShowAddQueueModal] = useState(false);

  useEffect(() => {
    setShowSidebar(false);
    return () => setShowSidebar(true);
  }, [setShowSidebar]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          existingDomain?.queuePools.map(pool => {
            const fileName = pool.type ? `${existingDomain?.domainName}-${pool.type}.vmta.json` : `${existingDomain?.domainName}.vmta.json`;
            return fetch(`http://127.0.0.1:5000/domain-config/${fileName}`);
          }) || []
        );
        const results = await Promise.all(responses.map(res => res.json()));
        const poolDataResult: { [key: string]: Section[] } = {};
        existingDomain?.queuePools.forEach((pool, index) => {
          poolDataResult[pool.queuePoolName] = results[index].status === 'success' ? results[index].data : [];
        });
        setPoolData(poolDataResult);
        setOriginalPoolData(poolDataResult);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [existingDomain]);

  useEffect(() => {
    for (const pool of existingDomain?.queuePools || []) {
      if (pool.queues.some(queue => queue.queueName === activeQueueTab)) {
        setPoolName(pool.queuePoolName);
      }
    }

    
  }, [activeQueueTab]);

  useEffect(() => {
    if (!poolName) return;

    setIsLoading(true);
    
    // Fetch original string
    const fetchOriginal = fetch('http://127.0.0.1:5000/config-string', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: originalPoolData[poolName] || [] }),
    });

    // Fetch modified string
    const fetchModified = fetch('http://127.0.0.1:5000/config-string', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: poolData[poolName] || [] }),
    });

    // Fetch both strings in parallel
    Promise.all([fetchOriginal, fetchModified])
      .then(([originalRes, modifiedRes]) => Promise.all([originalRes.json(), modifiedRes.json()]))
      .then(([originalData, modifiedData]) => {
        setOriginalString(JSON.stringify(originalData['config_string'], null, 2));
        setModifiedString(JSON.stringify(modifiedData['config_string'], null, 2));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching strings:', error);
        setIsLoading(false);
      });
  }, [poolName, poolData]);

  // Function to determine the file name
  const getFileName = (poolName: string): string => {
    // Construct the file name based on your logic
    // For example, using the domain name and pool type
    const pool = existingDomain?.queuePools.find(p => p.queuePoolName === poolName);
    return pool?.type ? `${existingDomain?.domainName}-${pool.type}.vmta.json` : `${existingDomain?.domainName}.vmta.json`;
  };

  function setNestedValue(section: Section, path: any[], value: string) {
    const lastKey = path[path.length - 1];
    const parent = path.slice(0, -1).reduce((acc, key) => {
        if (acc[key] === undefined) {
            acc[key] = typeof key === 'number' ? [] : {}; // Initialize if undefined
        }
        return acc[key];
    }, section);

    parent[lastKey] = value;
  }

  //leaving for testing for now clean up later
  function getNestedValue(section: Section, path: any[]) {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), section);
  }

  const handleUpdate = (poolName: string, index: number, field: [any], value: string) => {
    setPoolData(prevState => {
      const updatedPoolData = cloneDeep(prevState);
      const pool = updatedPoolData[poolName];
      if (pool) {
          const section = pool[index]
          if (section) {
            setNestedValue(section, field, value);
          }
      }
      return updatedPoolData;
  });
  };

  const handleAddTargetISP = (poolName: string, vmtaSection: Section) => {
    setPoolData(prevState => {
      const updatedPoolData = cloneDeep(prevState);
      const pool = updatedPoolData[poolName];
      
      if (!pool) return updatedPoolData;

      // Use getTargetISPs to get all target ISPs organized by VMTA
      const targetISPsByVMTA = getTargetISPs(pool);
      
      // Get target ISPs for current VMTA
      const currentVMTATargetISPs = targetISPsByVMTA[vmtaSection.value || ''] || [];
      console.log(currentVMTATargetISPs);

      // Find the last index from the current VMTA's target ISPs
      const lastIndex = currentVMTATargetISPs.length > 0
        ? Math.max(...currentVMTATargetISPs.flat().map(section => section.index))
        : vmtaSection.index;

      // Create new section indexes
      const newStartIndex = lastIndex + 1;
      const newEndIndex = lastIndex + 2;

      // Update all existing sections that have indexes >= newStartIndex
      pool.forEach(section => {
        if (section.index >= newStartIndex) {
          section.index += 2;
        }
      });

      // Create new domain sections
      const domainSectionStart: Section = {
        key: 'domain',
        type: 'section_start',
        value: 'new-target-isp',
        index: newStartIndex,
        content: []
      };

      const domainSectionEnd: Section = {
        key: 'domain',
        type: 'section_end',
        value: '',
        index: newEndIndex,
        content: []
      };

      // Add new sections to the pool
      pool.push(domainSectionStart);
      pool.push(domainSectionEnd);

      // Sort the pool by index to maintain order
      pool.sort((a, b) => a.index - b.index);

      return updatedPoolData;
    });
  };

  const handleAddSetting = (poolName: string, index: number, field: [any]) => {
    setPoolData(prevState => {
      const updatedPoolData = cloneDeep(prevState);
      const pool = updatedPoolData[poolName];
      if (pool) {
        const section = pool[index];
        if (section) {
          // Initialize content array if it doesn't exist
          if (!section.content) {
            section.content = [];
          }
          
          // Create and add the new setting
          const newSetting: Setting = {
            key: '',
            type: 'setting',
            value: ''
          };
          
          section.content.push(newSetting);
        }
      }
      return updatedPoolData;
    });
  };

  const handleSaveChanges = () => {
    // Logic to save changes
  };

  const handleCancel = () => {
    navigate('/sending-domains');
  };

  function getPoolTypeByName(poolName: string, queuePools: QueuePool[]): string | undefined {
    const pool = queuePools.find(pool => pool.queuePoolName === poolName);
    return pool ? pool.type : undefined;
  }


  function getTargetISPs(sections: Section[]): { [key: string]: Section[] } {
    const targetISPs: { [key: string]: Section[] } = {};
    let currentVMTANode: string = '';
    let currentDomainSection: Section[] = [];

    sections.forEach((section) => {
      if (section.key === 'virtual-mta' && section.type === 'section_start') {
        currentVMTANode = section.value || '';
        targetISPs[currentVMTANode] = [];
      } else if (section.key === 'virtual-mta' && section.type === 'section_end') {
        currentVMTANode = '';
      } else if (currentVMTANode && section.key === 'domain') {
        if (section.type === 'section_start') {
          currentDomainSection = [section];
        } else if (section.type === 'section_end' && currentDomainSection.length > 0) {
          currentDomainSection.push(section);
          targetISPs[currentVMTANode].push(...currentDomainSection);
          currentDomainSection = [];
        }
      }
    });

    return targetISPs;
  }

  const handleAddQueue = (ipAddress: string, queueType: string) => {
    setPoolData(prevState => {
      const updatedPoolData = cloneDeep(prevState);
      
      // Determine the correct pool name based on domain and type
      const effectivePoolName = queueType 
        ? `${existingDomain?.domainName}-pool-${queueType}`
        : `${existingDomain?.domainName}-pool` || '';
      
      // Set the poolName state to trigger the useEffect
      setPoolName(effectivePoolName);
      
      // Initialize the pool if it doesn't exist
      if (!updatedPoolData[effectivePoolName]) {
        updatedPoolData[effectivePoolName] = [];
      }
      
      const pool = updatedPoolData[effectivePoolName];
      
      // Find the last virtual-mta section's index
      const lastVMTAIndex = pool.length > 0 
        ? Math.max(
            ...pool
              .filter(section => section.key === 'virtual-mta')
              .map(section => section.index),
            -1
          )
        : -1;

      // Create new section indexes
      const newStartIndex = lastVMTAIndex + 1;
      const newEndIndex = lastVMTAIndex + 2;

      // Update all existing sections that have indexes >= newStartIndex
      pool.forEach((section: Section) => {
        if (section.index >= newStartIndex) {
          section.index += 2;
        }
      });

      // Create section value based on inputs
      const sectionValue = queueType 
        ? `${ipAddress}-${existingDomain?.domainName}-${queueType}`
        : `${ipAddress}-${existingDomain?.domainName}`;

      // Create new virtual-mta sections
      const vmtaSectionStart: Section = {
        key: 'virtual-mta',
        type: 'section_start',
        value: sectionValue,
        index: newStartIndex,
        content: [{
          "key": "domain-key",
          "type": "setting",
          "value": "102524135452859585361,gleemate.com,/etc/pmta/dkim/102524135452859585361.gleemate.com"
        }, {
          "key": "smtp-source-host",
          "type": "setting",
          "value": `${ipAddress} ${existingDomain?.domainName}`
        }]
      };

      const vmtaSectionEnd: Section = {
        key: 'virtual-mta',
        type: 'section_end',
        value: '',
        index: newEndIndex,
        content: []
      };

      // Add new sections to the pool
      pool.push(vmtaSectionStart);
      pool.push(vmtaSectionEnd);

      // Sort the pool by index to maintain order
      pool.sort((a: Section, b: Section) => a.index - b.index);
      console.log(JSON.stringify(pool, null, 2));


      return updatedPoolData;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-grow overflow-y-auto p-6">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/sending-domains')} className="mr-4 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold">{domainId ? 'Edit Domain' : 'Add New Domain'}</h1>
        </div>

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
                    {availableIPs.filter(ip => !ipAddresses.includes(ip)).map(ip => (
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
                  <Button variant="primary" onClick={() => {
                    const ipToAdd = newIP || customIP;
                    if (ipToAdd && !ipAddresses.includes(ipToAdd)) {
                      setIpAddresses(prev => [...prev, ipToAdd]);
                      setNewIP('');
                      setCustomIP('');
                    }
                  }} className="w-100">Add IP</Button>
                </Col>
              </Row>
            </Form.Group>

            <div className="mb-4">
              <div className="d-flex flex-wrap gap-2 border rounded p-2">
                {ipAddresses.length === 0 ? (
                  <span className="text-muted">No IP addresses selected</span>
                ) : (
                  ipAddresses.map(ip => (
                    <Badge key={ip} bg="secondary" className="d-flex align-items-center p-2">
                      {ip}
                      <Button variant="link" className="p-0 ms-2 text-white" onClick={() => setIpAddresses(prev => prev.filter(existingIP => existingIP !== ip))}>
                        <X size={14} />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </Form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Queues</h2>
          <Button 
            variant="outline-primary" 
            onClick={() => setShowAddQueueModal(true)} 
            size="sm"
            className="mb-4"
          >
            Add Queue
          </Button>
          
          <AddQueueModal
            show={showAddQueueModal}
            onHide={() => setShowAddQueueModal(false)}
            onSubmit={(ipAddress, queueType) => handleAddQueue(ipAddress, queueType)}
            availableIPs={availableIPs}
            domainName={existingDomain?.domainName || ''}
          />

          <Tabs activeKey={activeQueueTab} onSelect={(k) => k && setActiveQueueTab(k)} className="mb-4">
            {Object.entries(poolData).map(([poolName, sections]) => {
              const targetISPs = getTargetISPs(sections);
              return sections.filter(section => section.key === 'virtual-mta').map((section, index) => (
                <Tab key={index} eventKey={section.value} title={section.value}>
                  <div className="p-4 border rounded">
                    <Form>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-4">
                            <Form.Label>Subdomain</Form.Label>
                            <Form.Control
                              type="text"
                              value={section.content?.find(setting => setting.key === 'smtp-source-host')?.value?.split(' ')[1] || ''}
                              onChange={(e) => handleUpdate(poolName, section.index, ['content', index, 'value'], e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-4">
                            <Form.Label>IP Address</Form.Label>
                            <Form.Control
                              type="text"
                              value={section.content?.find(setting => setting.key === 'smtp-source-host')?.value?.split(' ')[0] || ''}
                              onChange={(e) => handleUpdate(poolName, section.index, ['content', index, 'value'], e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-4">
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                              type="text"
                              value={getPoolTypeByName(poolName, existingDomain?.queuePools || [])}
                              onChange={(e) => handleUpdate(poolName, section.index, "type", e.target.value)} // TODO: if the user udpates the type we need to do some special stuff to 
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                    <h4 className="text-lg font-semibold mt-4">Target ISPs</h4>
                    <Button 
                      variant="outline-primary" 
                      onClick={() => handleAddTargetISP(poolName, section)} 
                      size="sm" 
                      className="mb-3"
                    >
                      Add Target ISP
                    </Button>
                    <Tabs>
                      {targetISPs[section?.value]?.map((domainSection, domainIdx) => (
                        <Tab key={domainIdx} eventKey={domainSection.index} title={domainSection.value}>
                          <div className="border rounded p-3 mb-4">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <span>Target ISP Name:</span>
                                <Form.Control
                                  type="text"
                                  value={domainSection.value}
                                  onChange={(e) => {
                                    handleUpdate(poolName, domainSection.index, ["value"], e.target.value);
                                  }}
                                  placeholder="Enter Target ISP"
                                  className="w" // Adjust width as needed
                                />
                              </div>
                              <Button 
                                variant="link" 
                                onClick={() => handleAddSetting(poolName, domainSection.index, ["content"])}
                                className="flex items-center"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Setting
                              </Button>
                            </div>
                            <Form>
                              <div className="d-flex flex-wrap gap-3">
                                {domainSection.content?.map((setting, settingIdx) => (
                                  <div key={settingIdx} className="d-flex align-items-center gap-2 flex-grow-1">
                                    <div style={{ width: '45%' }}>
                                      <Form.Control
                                        type="text"
                                        value={setting.key}
                                        onChange={(e) => handleUpdate(poolName, domainSection.index, ["content", settingIdx, "key"], e.target.value)}
                                        size="sm"
                                        className="bg-light"
                                      />
                                    </div>
                                    <div style={{ width: '45%' }}>
                                      <Form.Control
                                        type="text"
                                        value={setting.value || ''}
                                        onChange={(e) => handleUpdate(poolName, domainSection.index, ["content", settingIdx, "value"], e.target.value)}
                                        size="sm"
                                        className="hover:bg-gray-50 focus:bg-white transition-colors"
                                        style={{ cursor: 'text' }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Form>
                          </div>
                        </Tab>
                      ))}
                    </Tabs>
                  </div>
                </Tab>
              ));
            })}
          </Tabs>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={handleCancel} className="mr-2">Cancel</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </div>

      <div className={`transition-all duration-300 ${isExpanded ? 'w-[1000%]' : 'w-[15%]'} border-l border-gray-200 overflow-y-auto`}>
        <button 
          className="p-2 text-blue-500 hover:underline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'} String Interpreter
        </button>
        {isExpanded && (
          isLoading ? (
            <div className="p-4 text-center">
              <span className="text-gray-600">Loading changes...</span>
            </div>
          ) : (
            <StringInterpreter 
              originalString={originalString}
              modifiedString={modifiedString}
              title={getFileName(poolName)}
            />
          )
        )}
      </div>
    </div> 
  );
} 