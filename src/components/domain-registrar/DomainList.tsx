import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { RefreshCw, Edit2, Trash2 } from 'lucide-react';

export function DomainList() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      // API call to fetch registered domains
      // Implementation will depend on chosen registrar API
      setDomains([
        {
          name: 'example.com',
          registrationDate: '2024-03-20',
          expiryDate: '2025-03-20',
          autoRenew: true,
          nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
        }
      ]);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Form.Control
          type="text"
          placeholder="Search domains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <Button 
          variant="outline-primary"
          onClick={fetchDomains}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Domain</th>
              <th className="text-left p-4">Registration Date</th>
              <th className="text-left p-4">Expiry Date</th>
              <th className="text-left p-4">Auto Renew</th>
              <th className="text-left p-4">Nameservers</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDomains.map((domain) => (
              <tr key={domain.name} className="border-b">
                <td className="p-4">{domain.name}</td>
                <td className="p-4">{domain.registrationDate}</td>
                <td className="p-4">{domain.expiryDate}</td>
                <td className="p-4">
                  <Form.Check
                    type="switch"
                    checked={domain.autoRenew}
                    onChange={() => {}}
                  />
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {domain.nameservers.map((ns: string) => (
                      <div key={ns} className="text-sm">{ns}</div>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <Button variant="link" className="p-0">
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="link" className="p-0">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}