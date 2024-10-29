import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsPage } from './pages/StatsPage';
import { MailboxProvidersPage } from './pages/MailboxProvidersPage';

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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;