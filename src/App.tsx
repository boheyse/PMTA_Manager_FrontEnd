import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsPage } from './pages/StatsPage';
import { MailboxProvidersPage } from './pages/MailboxProvidersPage';
import { EmailLogsPage } from './pages/EmailLogsPage';
import { SendingDomainsPage } from './pages/SendingDomainsPage';
import { MailboxesPage } from './pages/MailboxesPage';
import { DomainEditorPage } from './pages/DomainEditorPage';
import { IPAddressesPage } from './pages/IPAddressesPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <Routes>
            <Route path="/" element={<StatsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/mailbox-providers" element={<MailboxProvidersPage />} />
            <Route path="/email-logs" element={<EmailLogsPage />} />
            <Route path="/sending-domains" element={<SendingDomainsPage />} />
            <Route path="/mailboxes" element={<MailboxesPage />} />
            <Route path="/domain-editor" element={<DomainEditorPage />} />
            <Route path="/domain-editor/:domainId" element={<DomainEditorPage />} />
            <Route path="/ip-addresses" element={<IPAddressesPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;