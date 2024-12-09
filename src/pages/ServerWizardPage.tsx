import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Tabs, Tab } from 'react-bootstrap';
import { ChevronRight, Plus } from 'lucide-react';
import { ISPSettingsManager } from '../components/isp-settings';
import { axiosPost, axiosGet, axiosPut } from '../utils/apiUtils';
import { TemplateSelector } from '../components/isp-settings/TemplateSelector';
import { PoolTypeConfig, Template } from '../types/templates';
import { toast } from 'react-toastify';

interface WizardStep {
  id: string;
  title: string;
  status: 'incomplete' | 'complete';
}

interface LocationState {
  serverName?: string;
  hostname?: string;
  nodeId?: number;
}

export function ServerWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { serverName: initialServerName, hostname: initialHostname, nodeId: initialNodeId } = 
    (location.state as LocationState) || {};

  const [currentStep, setCurrentStep] = useState('introduction');
  const [serverName, setServerName] = useState(initialServerName || '');
  const [hostname, setHostname] = useState(initialHostname || '');
  const [nodeId, setNodeId] = useState(initialNodeId || -1);
  const [domains, setDomains] = useState<string[]>([]);
  const [poolTypes, setPoolTypes] = useState<string[]>([]);
  const [bulkDomains, setBulkDomains] = useState('');
  const [newPoolType, setNewPoolType] = useState('');
  const [selectedISPTemplate, setSelectedISPTemplate] = useState<Template | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const [stepStatus, setStepStatus] = useState<{[key: string]: 'incomplete' | 'complete'}>({
    'introduction': 'complete',
    'server-details': 'incomplete',
    'domains': 'incomplete',
    'pool-types': 'incomplete',
    'target-isps': 'incomplete',
    'summary': 'incomplete'
  });

  const [poolTypeConfigs, setPoolTypeConfigs] = useState<PoolTypeConfig[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Add new state for setup loading
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axiosGet('/api/v1/templates?contains=isp');
        setTemplates(response.templates);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  const steps: WizardStep[] = [
    { id: 'introduction', title: 'Introduction', status: 'complete' },
    { id: 'server-details', title: 'Server Details', status: stepStatus['server-details'] },
    { id: 'domains', title: 'Domain Configuration', status: stepStatus['domains'] },
    { id: 'pool-types', title: 'Pool Types', status: stepStatus['pool-types'] },
    { id: 'target-isps', title: 'Target ISPs', status: stepStatus['target-isps'] },
    { id: 'summary', title: 'Summary', status: stepStatus['summary'] }
  ];

  const handleNext = async () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    // First handle the server-details connection step
    if (currentStep === 'server-details') {
      setIsConnecting(true);
      setConnectionError('');
      
      try {
        const connectResponse = await axiosPost('/api/v1/server/connect', {
          hostname: hostname,
          name: serverName,
          create_server: true
        });
        
        if (connectResponse.session_id) {
          setSessionId(connectResponse.session_id);
          
          const ipResponse = await axiosPost('/api/v1/server/ip-addresses', {
            session_id: connectResponse.session_id
          });
          
          setIpAddresses(ipResponse.ip_addresses);
          
          alert(`Successfully connected to server!\nAvailable IP addresses:\n${ipResponse.ip_addresses.join('\n')}`);
        }
      } catch (error) {
        console.error('Connection failed:', error);
        setConnectionError(error.response?.data?.message || 'Failed to connect to server');
        setIsConnecting(false);
        return;
      }
    }

    // Update server data before proceeding to next step
    try {
      const cleanedPoolTypes = poolTypeConfigs.map(({ template, ...rest }) => rest);
      
      const serverData = {
        nodeId: nodeId,
        ip_addresses: ipAddresses,
        domains: domains,
        pool_types: cleanedPoolTypes
      };

      await axiosPut(`/api/v1/server/${nodeId}`, serverData);

      // Only proceed if the update was successful
      setStepStatus(prev => ({
        ...prev,
        [currentStep]: 'complete'
      }));
      
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id);
      }
    } catch (error) {
      console.error('Failed to update server:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to save changes. Please try again.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newDomains = content
          .split(',')
          .map(d => d.trim())
          .filter(d => d && !domains.includes(d));
        setDomains(prev => [...prev, ...newDomains]);
      };
      reader.readAsText(file);
    }
  };

  const handleBulkImport = () => {
    const newDomains = bulkDomains
      .split(',')
      .map(d => d.trim())
      .filter(d => d && !domains.includes(d));
    setDomains(prev => [...prev, ...newDomains]);
    setBulkDomains('');
  };

  const addPoolType = () => {
    if (newPoolType && !poolTypes.includes(newPoolType)) {
      setPoolTypes(prev => [...prev, newPoolType]);
      setPoolTypeConfigs(prev => [...prev, {
        pool_type: newPoolType,
        isps: [],
      }]);
      setNewPoolType('');
    }
  };

  const handlePoolTemplateChange = (poolType: string, template: Template | null) => {
    if (!template) return;
    
    setPoolTypeConfigs(prev => prev.map(config => {
      if (config.pool_type === poolType) {
        return {
          ...config,
          isps: template.json_data.isps,
          template: template
        };
      }
      return config;
    }));
  };

  const removePoolType = (type: string) => {
    setPoolTypes(prev => prev.filter(t => t !== type));
    setPoolTypeConfigs(prev => prev.filter(config => config.pool_type !== type));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'server-details':
        return serverName.trim() !== '' && hostname.trim() !== '';
      case 'domains':
        return domains.length > 0;
      case 'pool-types':
        return poolTypes.length > 0;
      case 'target-isps':
        return true;
      default:
        return true;
    }
  };

  const handleCreateServer = async () => {
    try {
      setIsSettingUp(true);
      const toastId = toast.loading('Server setup in progress...', {
        autoClose: false
      });

      const cleanedPoolTypes = poolTypeConfigs.map(({ template, ...rest }) => rest);

      const serverData = {
        session_id: sessionId,
        nodeId: nodeId,
        ip_addresses: ipAddresses,
        domains: domains,
        pool_types: cleanedPoolTypes
      };

      const response = await axiosPost('/api/v1/server/setup', serverData);
      
      if (response.success) {
        toast.dismiss(toastId);
        toast.success('Server setup completed successfully!', {
          autoClose: 2000
        });
        navigate('/manage-server');
      } else {
        toast.dismiss(toastId);
        toast.error(response.error || 'Failed to setup server. Please try again.');
      }
    } catch (error) {
      console.error('Server setup failed:', error);
      toast.dismiss(); // Dismiss all toasts
      toast.error(
        error.response?.data?.message || 
        'An error occurred during server setup. Please try again.'
      );
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleISPTemplateChange = (template: Template | null) => {
    setSelectedISPTemplate(template);
  };

  const renderIntroduction = () => (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">PMTA Server Configuration</h2>
      <p className="text-gray-600 mb-6">
        This wizard will guide you through setting up a new PMTA server configuration.
        You'll need to provide:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-6 text-gray-600">
        <li>Server details and connection information</li>
        <li>Domain configuration and settings</li>
        <li>Pool type definitions</li>
        <li>Target ISP configurations</li>
      </ul>
      <Button variant="primary" onClick={handleNext}>
        Get Started
      </Button>
    </div>
  );

  const renderServerDetails = () => (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Server Details</h2>
      <Form>
        <Form.Group className="mb-4">
          <Form.Label>Server Name</Form.Label>
          <Form.Control
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="Enter server name"
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Host Address</Form.Label>
          <Form.Control
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="Enter host address"
          />
        </Form.Group>

        {connectionError && (
          <div className="text-danger mb-4">
            {connectionError}
          </div>
        )}

        {ipAddresses.length > 0 && (
          <div className="mb-4 p-4 bg-success-light rounded">
            <h4 className="text-success mb-2">Connected Successfully!</h4>
            <div>Available IP addresses:</div>
            <ul className="list-disc list-inside">
              {ipAddresses.map((ip, index) => (
                <li key={index}>{ip}</li>
              ))}
            </ul>
          </div>
        )}
      </Form>
    </div>
  );

  const renderDomains = () => (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Domain Configuration</h2>
      
      <div className="mb-6">
        <Form.Group>
          <Form.Label>Bulk Import Domains</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={bulkDomains}
            onChange={(e) => setBulkDomains(e.target.value)}
            placeholder="Enter domains (comma-separated)"
            className="mb-2"
          />
        </Form.Group>
        <div className="flex gap-4">
          <Button onClick={handleBulkImport} disabled={!bulkDomains.trim()}>
            Import Domains
          </Button>
          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="domain-file"
          />
          <Button 
            variant="outline-secondary"
            onClick={() => document.getElementById('domain-file')?.click()}
          >
            Upload File
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Added Domains ({domains.length})</h3>
        <div className="grid grid-cols-2 gap-4">
          {domains.map(domain => (
            <div key={domain} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{domain}</span>
              <Button
                variant="link"
                className="text-danger p-0"
                onClick={() => setDomains(prev => prev.filter(d => d !== domain))}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPoolTypes = () => (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Pool Types</h2>
      
      <div className="mb-6">
        <Form.Group className="mb-4">
          <Form.Label>Add Pool Type</Form.Label>
          <div className="flex gap-2">
            <Form.Control
              type="text"
              value={newPoolType}
              onChange={(e) => setNewPoolType(e.target.value)}
              placeholder="Enter pool type"
              list="defaultPools"
            />
            <Button onClick={addPoolType} disabled={!newPoolType}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </Form.Group>

        <datalist id="defaultPools">
          <option value="default" />
          <option value="fresh" />
          <option value="unthrottled" />
        </datalist>
      </div>

      <div className="space-y-4">
        {poolTypeConfigs.map(config => (
          <div key={config.pool_type} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-medium">{config.pool_type}</h3>
                <Button
                  variant="link"
                  className="text-danger p-0"
                  onClick={() => removePoolType(config.pool_type)}
                >
                  ×
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">ISP Template:</span>
                <TemplateSelector 
                  templates={templates}
                  selectedTemplate={config.template}
                  onTemplateChange={(template) => handlePoolTemplateChange(config.pool_type, template)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTargetISPs = () => (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">Target ISP Configuration</h2>
      
      <Tabs
        defaultActiveKey={poolTypes[0]}
        className="mb-4"
      >
        {poolTypeConfigs.map(config => (
          <Tab 
            key={config.pool_type} 
            eventKey={config.pool_type} 
            title={config.pool_type}
          >
            <div className="p-4">
              <ISPSettingsManager 
                onTemplateChange={(template) => handlePoolTemplateChange(config.pool_type, template)}
                selectedTemplate={config.template}
              />
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  );

  const renderSummary = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Configuration Summary</h2>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Server Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Server Name:</span>
              <p className="font-medium">{serverName}</p>
            </div>
            <div>
              <span className="text-gray-600">Host Address:</span>
              <p className="font-medium">{hostname}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Domains ({domains.length})</h3>
          <div className="grid grid-cols-3 gap-4">
            {domains.map(domain => (
              <div key={domain} className="p-2 bg-gray-50 rounded">
                {domain}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Pool Types</h3>
          <div className="flex flex-wrap gap-4">
            {poolTypes.map(type => (
              <div key={type} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
                {type}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">ISP Configuration</h3>
          <div className="text-gray-600">
            ISP settings configured using template
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline-primary" onClick={() => navigate('/manage-server')}>
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleCreateServer}
            disabled={isSettingUp}
          >
            {isSettingUp ? 'Setting up server...' : 'Create Server'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'introduction':
        return renderIntroduction();
      case 'server-details':
        return renderServerDetails();
      case 'domains':
        return renderDomains();
      case 'pool-types':
        return renderPoolTypes();
      case 'target-isps':
        return renderTargetISPs();
      case 'summary':
        return renderSummary();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Side Navigation */}
        <div className="w-64 bg-white border-r min-h-screen p-6">
          <h3 className="text-lg font-semibold mb-6">Configuration Steps</h3>
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 p-2 rounded ${
                  currentStep === step.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>{step.title}</span>
                <span className="text-sm ml-auto">
                  {stepStatus[step.id] === 'complete' ? '✓' : 'Incomplete'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            {renderContent()}
          </div>

          {/* Navigation Buttons */}
          {currentStep !== 'introduction' && (
            <div className="flex justify-between mt-8">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={isConnecting}
              >
                Back
              </Button>
              {currentStep !== 'summary' && (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed() || isConnecting}
                >
                  {isConnecting ? 'Connecting...' : currentStep === 'target-isps' ? 'Review' : 'Next'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}