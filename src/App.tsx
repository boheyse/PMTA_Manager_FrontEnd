import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MonitoringPage } from './pages/MonitoringPage';
import { NodeDetailsPage } from './pages/NodeDetailsPage';
import { MailboxProvidersPage } from './pages/MailboxProvidersPage';
import { EmailLogsPage } from './pages/EmailLogsPage';
import { SendingDomainsPage } from './pages/SendingDomainsPage';
import { MailboxesPage } from './pages/MailboxesPage';
import { DomainEditorPage } from './pages/DomainEditorPage';
import { IPAddressesPage } from './pages/IPAddressesPage';
import { ConfigViewerPage } from './pages/ConfigViewerPage';
import { ServerManagerPage } from './pages/ServerManagerPage';
import { ServerWizardPage } from './pages/ServerWizardPage';
import { DomainRegistrarPage } from './pages/domain-registrar/DomainRegistrarPage';
import { Sidebar } from './components/Sidebar';
import { SidebarProvider } from './context/SidebarContext';
import { useAuthStore } from './stores/authStore';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gray-50">
          {isAuthenticated && <Sidebar />}
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
              } />
              <Route path="/register" element={
                isAuthenticated ? <Navigate to="/" replace /> : <RegisterForm />
              } />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MonitoringPage />
                </ProtectedRoute>
              } />
              <Route path="/monitoring" element={
                <ProtectedRoute>
                  <MonitoringPage />
                </ProtectedRoute>
              } />
              <Route path="/node/:nodeId" element={
                <ProtectedRoute>
                  <NodeDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/mailbox-providers" element={
                <ProtectedRoute>
                  <MailboxProvidersPage />
                </ProtectedRoute>
              } />
              <Route path="/email-logs" element={
                <ProtectedRoute>
                  <EmailLogsPage />
                </ProtectedRoute>
              } />
              <Route path="/manage-server/*" element={
                <ProtectedRoute>
                  <ServerManagerPage />
                </ProtectedRoute>
              } />
              <Route path="/server-wizard" element={
                <ProtectedRoute>
                  <ServerWizardPage />
                </ProtectedRoute>
              } />
              <Route path="/domain-registrar" element={
                <ProtectedRoute>
                  <DomainRegistrarPage />
                </ProtectedRoute>
              } />
              <Route path="/manage-server/sending-domains" element={
                <ProtectedRoute>
                  <SendingDomainsPage />
                </ProtectedRoute>
              } />
              <Route path="/manage-server/ip-addresses" element={
                <ProtectedRoute>
                  <IPAddressesPage />
                </ProtectedRoute>
              } />
              <Route path="/manage-server/config-viewer" element={
                <ProtectedRoute>
                  <ConfigViewerPage />
                </ProtectedRoute>
              } />
              <Route path="/mailboxes" element={
                <ProtectedRoute>
                  <MailboxesPage />
                </ProtectedRoute>
              } />
              <Route path="/domain-editor" element={
                <ProtectedRoute>
                  <DomainEditorPage />
                </ProtectedRoute>
              } />
              <Route path="/domain-editor/:domainId" element={
                <ProtectedRoute>
                  <DomainEditorPage />
                </ProtectedRoute>
              } />

              {/* Catch all route - redirect to login if not authenticated, home if authenticated */}
              <Route path="*" element={
                isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
              } />
            </Routes>
          </div>
        </div>
        <ToastContainer position="top-right" />
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;