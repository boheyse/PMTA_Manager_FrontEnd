import React, { useState } from 'react';
import { MailboxManagementModal } from '../components/MailboxManagementModal';
import { Search, Plus } from 'lucide-react';

interface DomainMailboxes {
  domain: string;
  mailboxCount: number;
  lastGenerated: string;
}

export function MailboxesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domains, setDomains] = useState<DomainMailboxes[]>([
    {
      domain: 'example.com',
      mailboxCount: 5,
      lastGenerated: '2024-01-15'
    }
  ]);

  const handleSaveMailboxes = (mailboxes: any[]) => {
    // Handle saving mailboxes
    setDomains(prev => 
      prev.map(d => 
        d.domain === selectedDomain 
          ? { ...d, mailboxCount: mailboxes.length, lastGenerated: new Date().toISOString().split('T')[0] }
          : d
      )
    );
    setIsModalOpen(false);
  };

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Mailboxes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Mailboxes
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Domain</th>
              <th className="text-left p-4">Mailbox Count</th>
              <th className="text-left p-4">Last Generated</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDomains.map((domain) => (
              <tr key={domain.domain} className="border-b">
                <td className="p-4">{domain.domain}</td>
                <td className="p-4">{domain.mailboxCount}</td>
                <td className="p-4">{domain.lastGenerated}</td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      setSelectedDomain(domain.domain);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Generate New
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MailboxManagementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDomain('');
        }}
        domain={selectedDomain}
        onSave={handleSaveMailboxes}
      />
    </div>
  );
} 