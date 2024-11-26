import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { ChevronRight, Plus } from 'lucide-react';
import { ISPSettingsManager } from '../components/isp-settings';

interface WizardStep {
  id: string;
  title: string;
  status: 'incomplete' | 'complete';
}

export function ServerWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('introduction');
  const [serverName, setServerName] = useState('');
  const [host, setHost] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [poolTypes, setPoolTypes] = useState<string[]>([]);
  const [bulkDomains, setBulkDomains] = useState('');
  const [newPoolType, setNewPoolType] = useState('');

  const [stepStatus, setStepStatus] = useState<{[key: string]: 'incomplete' | 'complete'}>({
    'introduction': 'complete',
    'server-details': 'incomplete',
    'domains': 'incomplete',
    'pool-types': 'incomplete',
    'target-isps': 'incomplete',
    'summary': 'incomplete'
  });

  const steps: WizardStep[] = [
    { id: 'introduction', title: 'Introduction', status: 'complete' },
    { id: 'server-details', title: 'Server Details', status: stepStatus['server-details'] },
    { id: 'domains', title: 'Domain Configuration', status: stepStatus['domains'] },
    { id: 'pool-types', title: 'Pool Types', status: stepStatus['pool-types'] },
    { id: 'target-isps', title: 'Target ISPs', status: stepStatus['target-isps'] },
    { id: 'summary', title: 'Summary', status: stepStatus['summary'] }
  ];

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setStepStatus(prev => ({
        ...prev,
        [currentStep]: 'complete'
      }));
      setCurrentStep(steps[currentIndex + 1].id);
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
      setNewPoolType('');
    }
  };

  const removePoolType = (type: string) => {
    setPoolTypes(prev => prev.filter(t => t !== type));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'server-details':
        return serverName.trim() !== '' && host.trim() !== '';
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
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Enter host address"
          />
        </Form.Group>
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
          <Form.Text className="text-muted">
            Default pool uses an empty suffix
          </Form.Text>
        </Form.Group>

        <datalist id="defaultPools">
          <option value="default" />
          <option value="fresh" />
          <option value="unthrottled" />
        </datalist>
      </div>

      <div className="space-y-2">
        {poolTypes.map(type => (
          <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>{type}</span>
            <Button
              variant="link"
              className="text-danger p-0"
              onClick={() => removePoolType(type)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTargetISPs = () => (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">Target ISP Configuration</h2>
      <ISPSettingsManager />
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
              <p className="font-medium">{host}</p>
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
            onClick={() => {
              // Handle final configuration save
              navigate('/manage-server');
            }}
          >
            Create Server
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
          {currentStep !== 'introduction' && currentStep !== 'summary' && (
            <div className="flex justify-between mt-8">
              <Button
                variant="secondary"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === 'target-isps' ? 'Review' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}