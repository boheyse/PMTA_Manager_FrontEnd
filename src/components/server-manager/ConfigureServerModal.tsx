import React, { useState, useRef } from 'react';
import { Modal, Form, Button, Carousel, Tabs, Tab } from 'react-bootstrap';
import { Plus, X, Upload, Search, Info } from 'lucide-react';
import { recipientDomainSettings } from '../../config/recipientDomainSettings';
import { ISPSettingsManager } from '../isp-settings';

interface ConfigureServerModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (node: { name: string; host: string }) => void;
}

interface Domain {
  name: string;
  poolTypes: string[];
  settings: {
    [poolType: string]: {
      [key: string]: string;
    };
  };
  targetISPs: string[];
}

interface PoolConfig {
  name: string;
}

export function ConfigureServerModal({ show, onHide, onSubmit }: ConfigureServerModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [serverName, setServerName] = useState('');
  const [host, setHost] = useState('');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [bulkDomains, setBulkDomains] = useState('');
  const [poolConfigs, setPoolConfigs] = useState<PoolConfig[]>([]);
  const [newPoolName, setNewPoolName] = useState('');
  const [targetISPs, setTargetISPs] = useState<string[]>([]);
  const [newTargetISP, setNewTargetISP] = useState('');
  const [bulkISPs, setBulkISPs] = useState('');
  const [settingsSearchTerm, setSettingsSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ispFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('bulk');

  const defaultPoolNames = ['default', 'fresh', 'unthrottled'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: serverName, host });
    resetForm();
  };

  const resetForm = () => {
    setServerName('');
    setHost('');
    setDomains([]);
    setNewDomain('');
    setBulkDomains('');
    setPoolConfigs([]);
    setTargetISPs([]);
    setBulkISPs('');
    setActiveStep(0);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const addDomain = () => {
    if (newDomain && !domains.find(d => d.name === newDomain)) {
      setDomains([...domains, { 
        name: newDomain, 
        poolTypes: [],
        settings: {},
        targetISPs: [],
      }]);
      setNewDomain('');
    }
  };

  const removeDomain = (domainName: string) => {
    setDomains(domains.filter(d => d.name !== domainName));
  };

  const handleBulkImport = () => {
    const newDomains = bulkDomains
      .split(',')
      .map(d => d.trim())
      .filter(d => d && !domains.find(domain => domain.name === d))
      .map(name => ({
        name,
        poolTypes: [],
        settings: {},
        targetISPs: [],
      }));

    setDomains([...domains, ...newDomains]);
    setBulkDomains('');
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
          .filter(d => d && !domains.find(domain => domain.name === d))
          .map(name => ({
            name,
            poolTypes: [],
            settings: {},
            targetISPs: [],
          }));

        setDomains([...domains, ...newDomains]);
      };
      reader.readAsText(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addPoolConfig = () => {
    if (newPoolName && !poolConfigs.find(p => p.name === newPoolName)) {
      setPoolConfigs([...poolConfigs, { name: newPoolName }]);
      setNewPoolName('');
    }
  };

  const removePoolConfig = (name: string) => {
    setPoolConfigs(poolConfigs.filter(p => p.name !== name));
  };

  const handleBulkISPImport = () => {
    const newISPs = bulkISPs
      .split(',')
      .map(isp => isp.trim())
      .filter(isp => isp && !targetISPs.includes(isp));

    setTargetISPs([...targetISPs, ...newISPs]);
    setBulkISPs('');
  };

  const handleISPFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newISPs = content
          .split(',')
          .map(isp => isp.trim())
          .filter(isp => isp && !targetISPs.includes(isp));

        setTargetISPs([...targetISPs, ...newISPs]);
      };
      reader.readAsText(file);
      if (ispFileInputRef.current) {
        ispFileInputRef.current.value = '';
      }
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return serverName.trim() !== '' && host.trim() !== '';
      case 1:
        return domains.length > 0;
      case 2:
        return poolConfigs.length > 0;
      case 3:
        return true; // Allow proceeding as long as settings are configured
      case 4:
        return true;
      default:
        return true;
    }
  };

  const renderServerNameStep = () => (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Server Name</Form.Label>
        <Form.Control
          type="text"
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
          placeholder="Enter server name"
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Host Address</Form.Label>
        <Form.Control
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="Enter host address (e.g., http://localhost:8080)"
          required
        />
      </Form.Group>
    </Form>
  );

  const renderDomainsStep = () => (
    <div>
      <Tabs defaultActiveKey="single" className="mb-4">
        <Tab eventKey="single" title="Single Domain">
          <div className="p-3">
            <div className="flex gap-2 mb-3">
              <Form.Control
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="Enter domain name"
                className="flex-grow"
              />
              <Button onClick={addDomain} disabled={!newDomain}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Tab>
        <Tab eventKey="bulk" title="Bulk Import">
          <div className="p-3">
            <Form.Group className="mb-3">
              <Form.Label>Paste Domains (comma-separated)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bulkDomains}
                onChange={(e) => setBulkDomains(e.target.value)}
                placeholder="domain1.com, domain2.com, domain3.com"
              />
            </Form.Group>
            <Button 
              variant="outline-primary" 
              onClick={handleBulkImport}
              disabled={!bulkDomains.trim()}
              className="w-full mb-3"
            >
              Import Domains
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">- OR -</div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                variant="outline-secondary"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2 inline-block" />
                Upload File
              </Button>
              <div className="text-xs text-gray-500 mt-1">
                Accepts .txt or .csv files with comma-separated domains
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Added Domains ({domains.length})</h4>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {domains.map(domain => (
            <div key={domain.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{domain.name}</span>
              <button
                onClick={() => removeDomain(domain.name)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPoolConfigStep = () => (
    <div>
      <div className="mb-4">
        <h4 className="text-lg font-medium mb-3">Configure Pool Types</h4>
        <div className="flex gap-2 mb-3">
          <Form.Control
            type="text"
            value={newPoolName}
            onChange={(e) => setNewPoolName(e.target.value)}
            placeholder="Enter pool name"
            className="flex-grow"
            list="defaultPools"
          />
          <datalist id="defaultPools">
            {defaultPoolNames.map(name => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <Button onClick={addPoolConfig} disabled={!newPoolName}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Note: Default pool uses an empty suffix
        </div>
      </div>

      <div className="space-y-2">
        {poolConfigs.map((pool) => (
          <div key={pool.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">{pool.name}</span>
            <button
              onClick={() => removePoolConfig(pool.name)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTargetISPStep = () => (
    <div>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'bulk')}
        className="mb-4"
      >
        <Tab eventKey="bulk" title="Bulk Import">
          <div className="p-3">
            <Form.Group className="mb-3">
              <Form.Label>Paste ISPs (comma-separated)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bulkISPs}
                onChange={(e) => setBulkISPs(e.target.value)}
                placeholder="gmail.com, yahoo.com, hotmail.com"
              />
            </Form.Group>
            <Button 
              variant="outline-primary" 
              onClick={handleBulkISPImport}
              disabled={!bulkISPs.trim()}
              className="w-full mb-3"
            >
              Import ISPs
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">- OR -</div>
              <input
                type="file"
                ref={ispFileInputRef}
                accept=".txt,.csv"
                onChange={handleISPFileUpload}
                className="hidden"
              />
              <Button 
                variant="outline-secondary"
                onClick={() => ispFileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2 inline-block" />
                Upload File
              </Button>
              <div className="text-xs text-gray-500 mt-1">
                Accepts .txt or .csv files with comma-separated ISPs
              </div>
            </div>
          </div>
        </Tab>
        <Tab eventKey="settings" title="ISP Settings">
          <div className="p-3">
            <ISPSettingsManager />
          </div>
        </Tab>
      </Tabs>
    </div>
  );

  const renderSettingsStep = () => (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Form.Control
            type="text"
            placeholder="Search settings..."
            value={settingsSearchTerm}
            onChange={(e) => setSettingsSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {Object.entries(recipientDomainSettings)
          .filter(([key]) => 
            key.toLowerCase().includes(settingsSearchTerm.toLowerCase())
          )
          .map(([key, setting]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2 flex-1">
                <span className="font-medium">{key}</span>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-white border rounded shadow-lg text-sm">
                    <p className="text-gray-600">{setting.description}</p>
                    {setting.syntax && (
                      <p className="mt-1 text-gray-500 font-mono text-xs">
                        Syntax: {setting.syntax}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Form.Control
                type="text"
                placeholder={setting.default || ''}
                className="w-48 ml-4"
                size="sm"
              />
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Configure Server - Step {activeStep + 1}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Carousel
          activeIndex={activeStep}
          onSelect={() => {}}
          controls={false}
          indicators={false}
          interval={null}
        >
          <Carousel.Item>{renderServerNameStep()}</Carousel.Item>
          <Carousel.Item>{renderDomainsStep()}</Carousel.Item>
          <Carousel.Item>{renderPoolConfigStep()}</Carousel.Item>
          <Carousel.Item>{renderTargetISPStep()}</Carousel.Item>
          <Carousel.Item>{renderSettingsStep()}</Carousel.Item>
        </Carousel>
      </Modal.Body>
      <Modal.Footer className="flex justify-between">
        <div>
          {activeStep > 0 && (
            <Button 
              variant="secondary" 
              onClick={() => setActiveStep(prev => prev - 1)}
            >
              Back
            </Button>
          )}
        </div>
        <div className="space-x-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {activeStep < 4 ? (
            <Button
              variant="primary"
              onClick={() => setActiveStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canProceed()}
            >
              Finish
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}