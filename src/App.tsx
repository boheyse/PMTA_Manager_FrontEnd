import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { StatusPage } from './pages/StatusPage';
import { NodeDetailsPage } from './pages/NodeDetailsPage';
import { MailboxProvidersPage } from './pages/MailboxProvidersPage';
import { EmailLogsPage } from './pages/EmailLogsPage';
import { SendingDomainsPage } from './pages/SendingDomainsPage';
import { MailboxesPage } from './pages/MailboxesPage';
import { DomainEditorPage } from './pages/DomainEditorPage';
import { IPAddressesPage } from './pages/IPAddressesPage';
import { ConfigViewerPage } from './pages/ConfigViewerPage';
import { ServerManagerPage } from './pages/ServerManagerPage';
import { DomainRegistrarPage } from './pages/domain-registrar/DomainRegistrarPage';
import { SidebarProvider } from './context/SidebarContext';

export default function App() {
  return (
    <SidebarProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<StatusPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/node/:nodeId" element={<NodeDetailsPage />} />
              <Route path="/mailbox-providers" element={<MailboxProvidersPage />} />
              <Route path="/email-logs" element={<EmailLogsPage />} />
              <Route path="/manage-server" element={<ServerManagerPage />} />
              <Route path="/domain-registrar" element={<DomainRegistrarPage />} />
              <Route path="/manage-server/sending-domains" element={<SendingDomainsPage />} />
              <Route path="/manage-server/ip-addresses" element={<IPAddressesPage />} />
              <Route path="/manage-server/config-viewer" element={<ConfigViewerPage />} />
              <Route path="/mailboxes" element={<MailboxesPage />} />
              <Route path="/domain-editor" element={<DomainEditorPage />} />
              <Route path="/domain-editor/:domainId" element={<DomainEditorPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </SidebarProvider>
  );
}