import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { StringInterpreter } from '../components/StringInterpreter';
import { createVMTASectionStart, createSectionEnd, getSectionFromFile, createVMTAPoolSectionStart, getLastIndex, createVMTAPoolSetting, getTargetISPs, createSectionStart } from '../pages/util/DomainEditorPageUtil';
import type { Domain, QueueInfo, Section, Setting } from '../types/domain';
import cloneDeep from 'lodash/cloneDeep';
import { AddQueueModal } from '../components/AddQueueModal';
import { axiosGet, axiosPost, fetchGet, fetchPost } from '../utils/apiUtils';
import QueueTabs from '../components/domaineditor/QueueTabs';
import AddPoolModal from '../components/domaineditor/AddPoolModal';

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
  const [showAddPoolModal, setShowAddPoolModal] = useState(false);
  const [newQueueType, setNewQueueType] = useState("default");

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

  // Extract unique poolName for top-level tabs
  let poolNames = Array.from(
    new Set(
      poolData.map((pool) => pool.poolName || "")
    ) 
  );
  // Get queues for the selected poolName
  const queuesForSelectedPool = poolData.find(
    (pool) => pool.poolName === selectedPoolName
  )?.queues;

  const fileName = poolData.find(
    (pool) => pool.poolName === selectedPoolName
  )?.fileName;

  const poolType = poolData.find(
    (pool) => pool.poolName === selectedPoolName
  )?.poolType;

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

  // Function to fetch config strings from the backend
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

  // Function to save changes to the backend
  const buildSaveRequestBody = () => {
    const changeSet = poolData.map((currentPool) => {
  
      // Find the corresponding pool in originalPoolData
      const originalPool = originalPoolData.find((pool) => pool.poolName === currentPool.poolName);
  
      // Extract sections from the current pool
      const workingSections = currentPool.queues.flatMap((queue) => queue.sections || []);
  
      // Extract sections from the original pool (if it exists)
      const previousSections = originalPool
        ? originalPool.queues.flatMap((queue) => queue.sections || [])
        : [];
  
      // Create the object for this pool
      return {
        fileName: currentPool.fileName,
        poolType: currentPool.poolType,
        poolName: currentPool.poolName,
        domainName: domainName,
        workingSections,
        previousSections,
      };
    });
    return changeSet;
  };

  // Function to save changes to the backend
  const handleSaveChanges = async () => {
    const changeSet = buildSaveRequestBody();
    console.log(JSON.stringify(changeSet, null, 2));
    await fetchPost('http://127.0.0.1:5000/v1/save-configs', changeSet);
  };
  

  const handleCancel = () => {
    // Trigger a reload by navigating with a state flag
    navigate('/sending-domains', { 
      state: { 
        reload: true 
      } 
    });
  };

  // Logic to add a new queue to the selected pool
  const handleAddQueue = (ipAddress: string, subDomain: string, domainKey: string) => {
    setPoolData((prevPoolData) => {
      const updatedPoolData = cloneDeep(prevPoolData);
      const targetPool = updatedPoolData.find((pool) => pool.poolName === selectedPoolName);
      const poolIndex = updatedPoolData.findIndex((pool) => pool.poolName === selectedPoolName);

      if (targetPool) {
        const queueName = targetPool.poolType ? `${ipAddress}-${domainName}-${targetPool.poolType}` : `${ipAddress}-${domainName}`;
        const lastIndex = getLastIndex(updatedPoolData, 'virtual-mta');

        // assumes there are sections in the pool because it's created with two new virtual-mta-pool sections. There shouldn't be a way to get here without sections.
        // therefore increment the exisitng  by 2.
        targetPool.queues[0].sections = targetPool.queues[0].sections.map((section) => ({
          ...section,
          index: section.index + 2, // Increment index by 2
        }));

        // Find the "virtual-mta-pool" section_start
        targetPool.queues[0].sections.find(
          (section) => section.key === 'virtual-mta-pool' && section.type === 'section_start'
        ).content.push(createVMTAPoolSetting(queueName));

        const newQueue = {
          info: [
            {
              queueName: queueName,
              domainName: domainName,
              ipAddress: ipAddress,
              queueType: targetPool.poolType,
              subDomain: subDomain,
              domainKey: domainKey,
              domainKeyPath: `/etc/pmta/dkim/${domainKey}.${domainName}`,
            },
          ],
          sections: [
            createVMTASectionStart(queueName, lastIndex, ipAddress, subDomain, domainKey, domainName),
            createSectionEnd("virtual-mta", lastIndex + 1),
          ],
        };
  
        // Add the new queue and sort sections by index
        targetPool.queues[0].info.push(newQueue.info[0]);
        targetPool.queues[0].sections = targetPool.queues[0].sections
        .concat(newQueue.sections) // Combine old and new sections
        .sort((a, b) => a.index - b.index); // Sort by index
      }
      // Update the pool in the poolData array
      updatedPoolData[poolIndex] = targetPool;
      return updatedPoolData;
    });
  
    setShowAddQueueModal(false); // Close the modal after adding the queue
  };
  

  const handleAddPool = () => {
    const poolType = newQueueType === "default" ? "" : newQueueType.trim();
    const poolName = poolType
      ? `${domainName}-pool-${poolType}`
      : `${domainName}-pool`;
  
    // Define starting and ending section indices
    const sectionStartIndex = 0; // Adjust as needed
    const sectionEndIndex = sectionStartIndex + 1;
  
    // Create sections for the new pool
    const sections = [
      createSectionStart("virtual-mta-pool", poolName, sectionStartIndex),
      createSectionEnd("virtual-mta-pool", sectionEndIndex),
    ];
  
    const newPool = {
      fileName: poolType
        ? `${domainName}-${poolType}.vmta.json`
        : `${domainName}.vmta.json`,
      poolName: poolName,
      poolType: poolType,
      queues: [
        {
          info: [],
          sections: sections,
        },
      ],
    };
  
    setPoolData((prevPoolData) => {
      const updatedPoolData = cloneDeep(prevPoolData); // Deep clone
      updatedPoolData.push(newPool); // Add the new pool
      return updatedPoolData;
    });
    setShowAddPoolModal(false); // Close the modal
    setNewQueueType("default"); // Reset the input
    setSelectedPoolName(newPool.poolName); // Auto-select the new pool tab
  };
  
  const validateDomainName = (name: string) => {
    // Example: Basic validation for domain format
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return domainRegex.test(name);
  };
  
  const handleDomainNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setDomainName(name);
  
    // Toggle Add Button based on validation
    if (validateDomainName(name)) {
      setShowAddButton(true);
    } else {
      setShowAddButton(false);
    }
  };
  
  const handleAddDomain = () => {
    if (validateDomainName(domainName)) {
      setIsDomainAdded(true);
      setShowAddButton(false);
    } else {
      alert('Please enter a valid domain name.');
    }
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
                    onChange={handleDomainNameChange}
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
              onClick={() => setShowAddPoolModal(true)} 
              size="sm"
              className="mb-4"
            >
              Add Pool
            </Button>
            
            {/* Add Pool Modal */}
            <AddPoolModal
              show={showAddPoolModal}
              onHide={() => setShowAddPoolModal(false)}
              onSubmit={handleAddPool}
              newQueueType={newQueueType}
              setNewQueueType={setNewQueueType}
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
                        addNewQueue={handleAddQueue} // Pass the function here
                        showAddQueueModal={showAddQueueModal}
                        setShowAddQueueModal={setShowAddQueueModal}
                      />
                      {/* Add Queue Modal */}
                      <AddQueueModal
                        show={showAddQueueModal}
                        onHide={() => setShowAddQueueModal(false)}
                        onSubmit={(ipAddress, subDomain, domainKey) => handleAddQueue(ipAddress, subDomain, domainKey)} // Pass correct arguments
                        availableIPs={domainIPAddresses}
                        domainName={domainName || ""}
                        poolType={poolType || ""}
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