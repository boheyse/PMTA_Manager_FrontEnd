import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { DomainSearch } from '../../components/domain-registrar/DomainSearch';
import { DomainList } from '../../components/domain-registrar/DomainList';
import { DNSManager } from '../../components/domain-registrar/DNSManager';
import { RegistrarSettings } from '../../components/domain-registrar/RegistrarSettings';

export function DomainRegistrarPage() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Domain Registrar</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'search')}
        className="mb-4"
      >
        <Tab eventKey="search" title="Search & Register">
          <DomainSearch />
        </Tab>
        <Tab eventKey="domains" title="My Domains">
          <DomainList />
        </Tab>
        <Tab eventKey="dns" title="DNS Manager">
          <DNSManager />
        </Tab>
        <Tab eventKey="settings" title="Settings">
          <RegistrarSettings />
        </Tab>
      </Tabs>
    </div>
  );
}