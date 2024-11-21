import React, { useState, useRef } from 'react';
import { Form, Button, Spinner, Tabs, Tab } from 'react-bootstrap';
import { Search, Upload, Download } from 'lucide-react';

interface DomainResult {
  domain: string;
  available: boolean;
  price: number;
}

export function DomainSearch() {
  const [singleDomain, setSingleDomain] = useState('');
  const [bulkDomains, setBulkDomains] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSingleSearch = async () => {
    setLoading(true);
    try {
      // API call to check domain availability
      setResults([
        { domain: singleDomain, available: true, price: 9.99 }
      ]);
    } catch (error) {
      console.error('Error searching domain:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSearch = async () => {
    setLoading(true);
    try {
      const domains = bulkDomains
        .split(/[\n,]/)
        .map(d => d.trim())
        .filter(d => d);

      // Mock API call - replace with actual registrar API
      const results = domains.map(domain => ({
        domain,
        available: Math.random() > 0.5,
        price: 9.99 + Math.random() * 5
      }));

      setResults(results);
    } catch (error) {
      console.error('Error searching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setBulkDomains(content);
      };
      reader.readAsText(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRegister = async (domain: string) => {
    try {
      // API call to register domain
      alert(`Domain ${domain} registered successfully!`);
    } catch (error) {
      console.error('Error registering domain:', error);
    }
  };

  const exportResults = () => {
    const csv = [
      ['Domain', 'Status', 'Price'].join(','),
      ...results.map(r => [
        r.domain,
        r.available ? 'Available' : 'Taken',
        `$${r.price.toFixed(2)}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domain-search-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <Tabs defaultActiveKey="single" className="p-4">
          <Tab eventKey="single" title="Single Domain">
            <div className="p-4">
              <div className="flex gap-4">
                <Form.Control
                  type="text"
                  value={singleDomain}
                  onChange={(e) => setSingleDomain(e.target.value)}
                  placeholder="Enter domain name"
                  className="flex-grow"
                />
                <Button 
                  variant="primary"
                  onClick={handleSingleSearch}
                  disabled={loading || !singleDomain}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="ml-2">Search</span>
                </Button>
              </div>
            </div>
          </Tab>
          <Tab eventKey="bulk" title="Bulk Search">
            <div className="p-4">
              <Form.Group className="mb-4">
                <Form.Label>Enter Domains (one per line or comma-separated)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={bulkDomains}
                  onChange={(e) => setBulkDomains(e.target.value)}
                  placeholder="example1.com&#10;example2.com&#10;example3.com"
                />
              </Form.Group>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="primary" 
                  onClick={handleBulkSearch}
                  disabled={loading || !bulkDomains.trim()}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search All
                </Button>
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
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={exportResults}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
          <div className="p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Domain</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.domain} className="border-b">
                    <td className="p-2">{result.domain}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        result.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.available ? 'Available' : 'Taken'}
                      </span>
                    </td>
                    <td className="p-2">${result.price.toFixed(2)}</td>
                    <td className="p-2">
                      <Button
                        variant="success"
                        size="sm"
                        disabled={!result.available}
                        onClick={() => handleRegister(result.domain)}
                      >
                        Register
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}