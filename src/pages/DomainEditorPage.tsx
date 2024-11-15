import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { StringInterpreter } from '../components/StringInterpreter';
import { createVMTASectionStart, createSectionEnd, getSectionFromFile, createVMTAPoolSectionStart, getLastIndex, createVMTAPoolSetting, getTargetISPs } from '../pages/util/DomainEditorPageUtil';
import type { Domain, QueueInfo, Section, Setting } from '../types/domain';
import cloneDeep from 'lodash/cloneDeep';
import { AddQueueModal } from '../components/AddQueueModal';
import { axiosGet, axiosPost, fetchGet } from '../utils/apiUtils';
import TargetISPTabs2 from '../components/domaineditor/TargetISPTabs2';
import QueueTabs from '../components/domaineditor/QueueTabs';

interface LocationState {
  domain?: Domain;
  allAvailableIPs: string[];
}

export function DomainEditorPage() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { domain: domain, allAvailableIPs: allAvailableIPs } = location.state as LocationState;
  const { setShowSidebar } = useSidebar();

  const [domainName, setDomainName] = useState(domain?.domainName || '');
  const [domainIPAddresses, setDomainIPAddresses] = useState(domain?.ipAddresses || []);
  const [originalPoolData, setOriginalPoolData] = useState(domain?.queuePools || []);
  const [poolData, setPoolData] = useState(domain?.queuePools || []);

  const [selectedPoolName, setSelectedPoolName] = useState<string | null>(null);
  const [selectedQueueName, setSelectedQueueName] = useState<string | null>(null);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [newIP, setNewIP] = useState('');
  const [customIP, setCustomIP] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [originalString, setOriginalString] = useState<string>('');
  const [modifiedString, setModifiedString] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddQueueModal, setShowAddQueueModal] = useState(false);

  // Add new state to track if domain has been added
  const [isDomainAdded, setIsDomainAdded] = useState(!!domain);
  const [showAddButton, setShowAddButton] = useState(false);

  // Get queues for the selected poolName
  const queuesForSelectedPool = poolData.find(
    (pool) => pool.poolName === selectedPoolName
  )?.queues;

  const fileName = poolData.find(
    (pool) => pool.poolName === selectedPoolName
  )?.fileName;

  // Get all queueInfo for the selected queueName
  const queueInfo = queuesForSelectedPool?.flatMap((queue) => queue.info) || [];

  // Get config file sections for the selected poolName
  const queueSections = queuesForSelectedPool?.flatMap((queue) => queue.sections) || [];

  // Get the active queue details for the selected queueName
  const activeQueueDetails = queueInfo.find(
    (queue) => queue.queueName === selectedQueueName
  );

  useEffect(() => {
    setShowSidebar(false);
    return () => setShowSidebar(true);
  }, [setShowSidebar]);

  // Effect for changes in selectedPoolName with a 0.5-second timeout
  useEffect(() => {
    if (!selectedPoolName) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const sectionsForOriginalPoolData = getSectionsByPoolName(originalPoolData, selectedPoolName);
      const sectionsForPoolData = getSectionsByPoolName(poolData, selectedPoolName);

      fetchConfigStrings(sectionsForOriginalPoolData, sectionsForPoolData);
    }, 500); // 0.5-second delay

    return () => clearTimeout(debounceTimeout.current as NodeJS.Timeout); // Cleanup on unmount or dependency change
  }, [selectedPoolName]);

  // Effect for changes in poolData with a 2-second timeout
  useEffect(() => {
    if (!selectedPoolName) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const sectionsForOriginalPoolData = getSectionsByPoolName(originalPoolData, selectedPoolName);
      const sectionsForPoolData = getSectionsByPoolName(poolData, selectedPoolName);

      fetchConfigStrings(sectionsForOriginalPoolData, sectionsForPoolData);
    }, 2000); // 2-second delay

    return () => clearTimeout(debounceTimeout.current as NodeJS.Timeout); // Cleanup on unmount or dependency change
  }, [poolData]);

  // Extract unique poolName for top-level tabs
  let poolNames = Array.from(
    new Set(
      poolData.map((pool) => pool.poolName || "")
    ) 
  );

  const fetchConfigStrings = async (sectionsForOriginalPoolData: Section[], sectionsForPoolData: Section[]) => {
    setIsLoading(true);
    try {
      const [originalData, modifiedData] = await Promise.all([
        axiosPost('http://127.0.0.1:5000/v1/config-string', {
          data: sectionsForOriginalPoolData || [],
        }),
        axiosPost('http://127.0.0.1:5000/v1/config-string', {
          data: sectionsForPoolData || [],
        }),
      ]);

      setOriginalString(JSON.stringify(originalData['config_string'], null, 2));
      setModifiedString(JSON.stringify(modifiedData['config_string'], null, 2));
    } catch (error) {
      console.error('Error fetching config strings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get sections by poolName
  const getSectionsByPoolName = (poolData: any[], poolName: string) => {
    const selectedPool = poolData.find((pool) => pool.poolName === poolName);
    if (!selectedPool) return []; // Return an empty array if poolName is not found

    return selectedPool.queues.flatMap((queue) => queue.sections || []);
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

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
  
      // Create diffPoolData by comparing poolData with originalPoolData
      const diffPoolData: { [key: string]: Section[] } = {};
      Object.keys(poolData).forEach(poolName => {
        const currentPoolString = JSON.stringify(poolData[poolName]);
        const originalPoolString = JSON.stringify(originalPoolData[poolName] || []);
  
        if (currentPoolString !== originalPoolString) {
          diffPoolData[poolName] = poolData[poolName];
        }
      });
  
      if (Object.keys(diffPoolData).length === 0) {
        alert('No changes to save');
        return;
      }
  
      const saveRequest = Object.keys(diffPoolData).map(poolName => ({
        data: diffPoolData[poolName],
        fileType: queueInfo[poolName]?.[0]?.queueType || '',
        fileName: poolName
      }));
  
      const result = await fetchPost('http://127.0.0.1:5000/save-config', saveRequest);
  
      if (result.success) {
        setOriginalPoolData(prevState => ({
          ...prevState,
          ...Object.keys(diffPoolData).reduce((acc, poolName) => ({
            ...acc,
            [poolName]: cloneDeep(poolData[poolName])
          }), {})
        }));
  
        alert('All changes saved successfully');
      } else {
        throw new Error(result.message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Trigger a reload by navigating with a state flag
    navigate('/sending-domains', { 
      state: { 
        reload: true 
      } 
    });
  };


  // Logic that hadnles what happens when a user clicks the "Add Queue" button
  const handleAddQueue = async (ipAddress: string, queueType: string, subDomain: string, domainKey: string) => {
    setPoolData(prevState => {
      const updatedFileData = cloneDeep(prevState);
      
      // Determine the correct pool & file name based on domain and type
      const fileName = queueType ? `${domain}-${queueType}.vmta.json` : `${domain}.vmta.json` || '';
      // Create section value based on inputs
      const sectionValue = queueType ? `${ipAddress}-${domain}-${queueType}` : `${ipAddress}-${domain}`;
      // Create pool name based on inputs
      const poolName = queueType ? `${domain}-pool-${queueType}` : `${domain}-pool`;
      
      // Set the poolName state to trigger the useEffect
      setPoolName(fileName);
      
      // Initialize the pool if it doesn't exist
      if (!updatedFileData[fileName]) {
        updatedFileData[fileName] = [];
      }
      
      const file = updatedFileData[fileName];
      
      // Find the last virtual-mta section's index
      const lastVMTAIndex = getLastIndex(file, 'virtual-mta');

      // Create new section indexes
      const newStartIndex = lastVMTAIndex + 1;
      const newEndIndex = lastVMTAIndex + 2;

      // Update all existing sections that have indexes >= newStartIndex
      file.forEach((section: Section) => {
        if (section.index >= newStartIndex) {
          section.index += 2;
        }
      });

      // Create new virtual-mta sections
      const vmtaSectionStart = createVMTASectionStart(sectionValue, newStartIndex, ipAddress, subDomain, domainKey, domain);
      const vmtaSectionEnd = createSectionEnd('virtual-mta', newEndIndex);
      
      // Check if the virtual-mta-pool section already exists in the pool, since we need to add the new vmta to the pool as well
      const vmtaPoolSection = getSectionFromFile(fileName, 'section_start', 'virtual-mta-pool', poolName, updatedFileData);
      if (vmtaPoolSection) {
        vmtaPoolSection.content.push(createVMTAPoolSetting(sectionValue));
      } else {
        file.push(createVMTAPoolSectionStart(poolName, newEndIndex+1, sectionValue));
        file.push(createSectionEnd('virtual-mta-pool', newEndIndex+2));
      }

      // Add new sections to the pool
      file.push(vmtaSectionStart);
      file.push(vmtaSectionEnd);

      // Sort the pool by index to maintain order
      file.sort((a: Section, b: Section) => a.index - b.index);

      // Make API call to update queueInfo
      fetch('http://127.0.0.1:5000/vmta-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([vmtaSectionStart, vmtaSectionEnd]),
      })
      .then(response => response.json())
      .then(result => {
        if (result.success && result.data) {
          updateQueueInfo(result, fileName);
          
          setActiveQueueTab(result.data[0].queueName);
        }
      })
      .catch(error => {
        console.error('Error updating queue info:', error);
      });

      return updatedFileData;
    });
  };

  const updateQueueInfo = (response, targetPoolName) => {
    setQueueInfo(prevQueueInfo => {
      // Clone the existing queueInfo to avoid direct mutation
      const updatedQueueInfo = { ...prevQueueInfo };
  
      // Get the data array from the response
      const newQueueData = response.data;
  
      if (updatedQueueInfo[targetPoolName]) {
        // If the target pool exists, append the new data
        updatedQueueInfo[targetPoolName] = [
          ...updatedQueueInfo[targetPoolName],
          ...newQueueData,
        ];
      } else {
        // If the target pool does not exist, create it
        updatedQueueInfo[targetPoolName] = newQueueData;
      }
  
      return updatedQueueInfo;
    });
  };

  // Modify the domain name change handler
  const handleDomainNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDomain(newValue);
    setShowAddButton(!!newValue && !isDomainAdded);
  };

  // Add handler for Add Domain button
  const handleAddDomain = () => {
    setIsDomainAdded(true);
    setShowAddButton(false);
  };

  // Function to update sections in poolData
  const updateSections = (poolName: string, updatedSections: Section[]) => {
    setPoolData(prevState => {
      const updatedPoolData = cloneDeep(prevState);
      const pool = updatedPoolData.find(pool => pool.poolName === poolName);
      if (pool) {
        pool.queues.forEach(queue => {
          queue.sections = updatedSections;
        });
      }
      console.log('updatedPoolData', JSON.stringify(updatedPoolData, null, 2));
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
            <div className="relative">
              <Form.Group className="mb-4">
                <Form.Label>Domain Name</Form.Label>
                <div className="flex items-center gap-4">
                  <Form.Control
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="example.com"
                    disabled={isDomainAdded}
                  />
                  {showAddButton && (
                    <Button
                      variant="primary"
                      onClick={handleAddDomain}
                      className="whitespace-nowrap"
                    >
                      Add Domain
                    </Button>
                  )}
                </div>
              </Form.Group>
            </div>

            {isDomainAdded && (
              <>
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
                        {allAvailableIPs.filter(ip => !domainIPAddresses.includes(ip)).map(ip => (
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
                        if (ipToAdd && !domainIPAddresses.includes(ipToAdd)) {
                          setDomainIPAddresses(prev => [...prev, ipToAdd]);
                          setNewIP('');
                          setCustomIP('');
                        }
                      }} className="w-100">Add IP</Button>
                    </Col>
                  </Row>
                </Form.Group>

                <div className="mb-4">
                  <div className="d-flex flex-wrap gap-2 border rounded p-2">
                    {domainIPAddresses.length === 0 ? (
                      <span className="text-muted">No IP addresses selected</span>
                    ) : (
                      domainIPAddresses.map(ip => (
                        <Badge key={ip} bg="secondary" className="d-flex align-items-center p-2">
                          {ip}
                          <Button variant="link" className="p-0 ms-2 text-white" onClick={() => setDomainIPAddresses(prev => prev.filter(existingIP => existingIP !== ip))}>
                            <X size={14} />
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </Form>
        </div>

        {isDomainAdded && (
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
              onHide={() => {
                setShowAddQueueModal(false);
              }}
              onSubmit={handleAddQueue}
              availableIPs={allAvailableIPs}
              domainName={domainName || ''}
            />

                  {/* Top-level Tabs for poolName */}
                  <Tabs
                    activeKey={selectedPoolName || ""}
                    onSelect={(key) => {
                      setSelectedPoolName(key); // Set active pool tab
                      setSelectedQueueName(null); // Reset queue tab when changing pool
                    }}
                    className="mb-4"
                  >
                    {poolNames.map((poolName) => (
                      <Tab eventKey={poolName} key={poolName} title={poolName}>
                        {selectedPoolName === poolName && (
                          <div>
                            {/* Render second-level tabs only for active pool */}
                            <QueueTabs
                              queuesForSelectedPool={queuesForSelectedPool}
                              selectedQueueName={selectedQueueName}
                              setSelectedQueueName={setSelectedQueueName}
                              activeQueueDetails={activeQueueDetails}
                              queueSections={queueSections}
                              poolName={poolName}
                              onUpdateSections={(updatedSections: Section[]) => updateSections(poolName, updatedSections)}
                            />
                          </div>
                        )}
                      </Tab>
                    ))}
                  </Tabs>

          </div>
        )}

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
          {isExpanded ? 'Collapse' : 'Expand'} Diff
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
              title={fileName || 'new-file.vmta.json'}
            />
          )
        )}
      </div>
    </div> 
  );
} 