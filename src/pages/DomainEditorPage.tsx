import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { StringInterpreter } from '../components/StringInterpreter';
import { createVMTASection, createSection, getLastIndex, createVMTAPoolSetting } from '../pages/util/DomainEditorPageUtil';
import type { Domain, Section } from '../types/domain';
import cloneDeep from 'lodash/cloneDeep';
import { AddQueueModal } from '../components/AddQueueModal';
import { axiosPost, fetchPost } from '../utils/apiUtils';
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
  const queueInfo = queuesForSelectedPool?.info || [];

  // Get config file sections for the selected poolName
  const queueSections = queuesForSelectedPool?.sections || [];

  // Get the active queue details for the selected queueName
  const activeQueueDetails = queueInfo.find(
    (queue) => queue.queueName === selectedQueueName
  );

  // Mark unsaved changes when poolData or domain-related state changes
  useEffect(() => {
    const isModified =
      JSON.stringify(originalPoolData) !== JSON.stringify(poolData) ||
      domainName !== domain?.domainName ||
      JSON.stringify(domainIPAddresses) !== JSON.stringify(domain?.ipAddresses);

    setHasUnsavedChanges(isModified);
  }, [originalPoolData, poolData, domainName, domainIPAddresses, domain]);

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
    }, 1500); // 1.5-second delay

    return () => clearTimeout(debounceTimeout.current as NodeJS.Timeout); // Cleanup on unmount or dependency change
  }, [poolData]);

  // Function to fetch config strings from the backend
  const fetchConfigStrings = async (sectionsForOriginalPoolData: Section[], sectionsForPoolData: Section[]) => {
    setIsLoading(true);
    try {
      const [originalData, modifiedData] = await Promise.all([
        axiosPost('/v1/config-string', {
          data: sectionsForOriginalPoolData || [],
        }),
        axiosPost('/v1/config-string', {
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

    return selectedPool.queues?.sections || [];
  };

  // Function to save changes to the backend
  const buildSaveRequestBody = () => {
    const changeSet = [];

    // Handle updated and new pools
    poolData.forEach((currentPool) => {
      const originalPool = originalPoolData.find((pool) => pool.poolName === currentPool.poolName);
      
      changeSet.push({
        fileName: currentPool.fileName,
        operation: originalPool ? 'update' : 'create',
        poolType: currentPool.poolType,
        poolName: currentPool.poolName,
        domainName: domainName,
        workingSections: currentPool.queues?.sections || [],
        previousSections: originalPool ? originalPool.queues?.sections || [] : [],
      });
    });

    // Handle deleted pools
    originalPoolData.forEach((originalPool) => {
      const stillExists = poolData.some((pool) => pool.poolName === originalPool.poolName);
      if (!stillExists) {
        changeSet.push({
          fileName: originalPool.fileName,
          operation: 'delete',
          poolType: originalPool.poolType,
          poolName: originalPool.poolName,
          domainName: domainName,
          workingSections: [],
          previousSections: originalPool.queues?.sections || [],
        });
      }
    });

    return changeSet;
  };

  // Function to save changes to the backend, set all working sections as empty 
  const buildDeleteRequestBody = () => {
    const changeSet = poolData.map((currentPool) => {
      
      // Find the corresponding pool in originalPoolData
      const originalPool = originalPoolData.find((pool) => pool.poolName === currentPool.poolName);
  
      // Extract sections from the original pool (if it exists)
      const previousSections = originalPool
        ? originalPool.queues?.sections || []
        : [];
  
      // Create the object for this pool
      return {
        fileName: currentPool.fileName,
        operation: 'delete',
        poolType: currentPool.poolType,
        poolName: currentPool.poolName,
        domainName: domainName,
        workingSections: [],
        previousSections,
      };
    });
    return changeSet;
  };

  // Handler to delete a domain
  const handleDeleteDomain = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the domain "${domainName}"?`);
    if (!confirmDelete) return;

    try {
      await axiosPost('/v1/config-files', {
        changeSet: buildDeleteRequestBody(),
      });
      navigate('/sending-domains', { state: { reload: true } });
    } catch (error) {
      console.error('Failed to delete domain:', error);
      alert('Failed to delete domain. Please try again.' + error.message);
    }
  };

  // Function to save changes to the backend
  const handleSaveChanges = async () => {
    try {
      const changeSet = buildSaveRequestBody();
      await axiosPost('/v1/config-files', changeSet);

      alert('Changes saved successfully!');
      setHasUnsavedChanges(false); // Reset unsaved changes
      navigate('/sending-domains'); // Redirect to /sending-domains on success
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };
  

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?'
      );
      if (!confirmLeave) return; // Stop navigation if user cancels
    }
  
    navigate('/sending-domains', { state: { reload: true } });
  };

  // Logic to add a new queue to the selected pool
  const handleAddQueue = (
    queueName: string,
    ipAddress: string,
    subDomain: string,
    domainKey: string,
    poolType: string
  ) => {
    setPoolData((prevPoolData) => {
      const updatedPoolData = cloneDeep(prevPoolData);
      console.log(prevPoolData);
      console.log(poolType);
      const targetPool = updatedPoolData.find((pool) => pool.poolType === poolType);
      if (!targetPool) return prevPoolData;
  
      // Get the last index for the new sections
      const lastIndex = getLastIndex(targetPool.queues.sections, 'virtual-mta');
  
      // Create the new queue info
      const newQueueInfo = {
        queueName: queueName,
        domainName: domainName,
        ipAddress: ipAddress,
        queueType: targetPool.poolType,
        subDomain: subDomain,
        domainKey: domainKey,
        domainKeyPath: `/etc/pmta/dkim/${domainKey}.${domainName}`,
      };
  
      // Create the new VMTA section
      const newVMTASection = createVMTASection(queueName, lastIndex, ipAddress, subDomain, domainKey, domainName);
  
      // Find the virtual-mta-pool section
      const vmtaPoolSection = targetPool.queues.sections.find(
        (section) => section.key === 'virtual-mta-pool'
      );
  
      console.log(vmtaPoolSection);
      if (!vmtaPoolSection) return prevPoolData;
  
      // Add the queue info to the pool's info array
      targetPool.queues.info.push(newQueueInfo);
  
      // Add the VMTA section before the virtual-mta-pool section
      const poolIndex = targetPool.queues.sections.indexOf(vmtaPoolSection);
      console.log(poolIndex);
      targetPool.queues.sections.splice(poolIndex, 0, newVMTASection);
  
      // Add the queue name to the virtual-mta-pool section's settings
      if (!vmtaPoolSection.sections) {
        vmtaPoolSection.sections = [];
      }
      vmtaPoolSection.sections.push(createVMTAPoolSetting(queueName));
  
      return updatedPoolData;
    });
  
    setShowAddQueueModal(false);
  };

  const handleAddPool = () => {
    const poolType = newQueueType === "default" ? "" : newQueueType.trim();
    const poolName = poolType
      ? `${domainName}-pool-${poolType}`
      : `${domainName}-pool`;

    // Create the virtual-mta-pool section
    const vmtaPoolSection = createSection("virtual-mta-pool", poolName, 0);
    vmtaPoolSection.sections = []; // Initialize the sections array for settings

    const newPool = {
      fileName: poolType
        ? `${domainName}-${poolType}.vmta.json`
        : `${domainName}.vmta.json`,
      poolName: poolName,
      poolType: poolType,
      queues: {
        info: [],
        sections: [vmtaPoolSection],
      },
    };

    setPoolData((prevPoolData) => {
      const updatedPoolData = cloneDeep(prevPoolData);
      updatedPoolData.push(newPool);
      return updatedPoolData;
    });

    // Close modal and update UI state
    setShowAddPoolModal(false);
    setNewQueueType("default");
    setSelectedPoolName(poolName); // Select the new pool
    setHasUnsavedChanges(true); // Mark changes as unsaved
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
        pool.queues.sections = updatedSections;
      }
      return updatedPoolData;
    });
  };

  // Handler to delete a queue pool
  const handleDeletePool = (poolName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the pool "${poolName}"?`);
    if (!confirmDelete) return;

    setPoolData((prevPoolData) => {
      const updatedPoolData = prevPoolData.filter((pool) => pool.poolName !== poolName);
      setHasUnsavedChanges(true);
      return updatedPoolData;
    });
  };

  // Handler to delete a queue from a pool
  const handleDeleteQueue = (poolName: string, queueName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the queue "${queueName}"?`);
    if (!confirmDelete) return;

    setPoolData((prevPoolData) => {
      const updatedPoolData = cloneDeep(prevPoolData);
      const targetPool = updatedPoolData.find((pool) => pool.poolName === poolName);
      
      if (targetPool && targetPool.queues) {
        // Remove queue info
        targetPool.queues.info = targetPool.queues.info.filter(
          (queue) => queue.queueName !== queueName
        );

        // Remove the virtual-mta section for this queue
        targetPool.queues.sections = targetPool.queues.sections.filter(
          (section) => !(section.key === 'virtual-mta' && section.value === queueName)
        );

        // Remove queue from virtual-mta-pool section's settings
        const vmtaPoolSection = targetPool.queues.sections.find(
          (section) => section.key === 'virtual-mta-pool'
        );
        
        if (vmtaPoolSection && vmtaPoolSection.sections) {
          vmtaPoolSection.sections = vmtaPoolSection.sections.filter(
            (setting) => setting.value !== queueName
          );
        }

        setHasUnsavedChanges(true);
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
                        onDeletePool={() => handleDeletePool(poolName)}
                        onDeleteQueue={(queueName: string) => handleDeleteQueue(poolName, queueName)}
                      />
                      {/* Add Queue Modal */}
                      <AddQueueModal
                        show={showAddQueueModal}
                        onHide={() => setShowAddQueueModal(false)}
                        onSubmit={(queueName, ipAddress, subDomain, domainKey, poolType) => handleAddQueue(queueName, ipAddress, subDomain, domainKey, poolType)} // Pass correct arguments
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

        {/* Bottom buttons container */}
        <div className="flex justify-end mt-6 space-x-4">
          {domainId && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={handleDeleteDomain}
            >
              Delete Domain
            </button>
          )}
          <button
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
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