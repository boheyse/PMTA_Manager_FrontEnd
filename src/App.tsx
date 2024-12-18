import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import {
  LoginForm,
  SignUpForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  ProtectedRoute
} from './components/supabase-auth';
import { MonitoringPage } from './pages/MonitoringPage';
import { ServerDetailsPage } from './pages/monitoring/ServerDetailsPage';
import { SendingDomainsPage } from './pages/SendingDomainsPage';
import { MailboxesPage } from './pages/MailboxesPage';
import { DomainEditorPage } from './pages/DomainEditorPage';
import { IPAddressesPage } from './pages/IPAddressesPage';
import { ConfigViewerPage } from './pages/ConfigViewerPage';
import { ServerManagerPage } from './pages/ServerManagerPage';
import { ServerWizardPage } from './pages/ServerWizardPage';
import { ImportServerPage } from './pages/ImportServerPage';
import { DomainRegistrarPage } from './pages/domain-registrar/DomainRegistrarPage';
import { Sidebar } from './components/Sidebar';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          {user && <Sidebar />}
          <div className="flex-1 overflow-auto">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                user ? <Navigate to="/" replace /> : <LoginForm />
              } />
              <Route path="/register" element={
                user ? <Navigate to="/" replace /> : <SignUpForm />
              } />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />

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
              <Route path="/monitoring/:serverId" element={
                <ProtectedRoute>
                  <ServerDetailsPage />
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
              <Route path="/import-server" element={
                <ProtectedRoute>
                  <ImportServerPage />
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
                user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
              } />
            </Routes>
          </div>
        </div>
        <ToastContainer position="top-right" />
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}