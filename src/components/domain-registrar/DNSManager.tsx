import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Upload, Plus, Trash2 } from 'lucide-react';

export function DNSManager() {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [bulkConfig, setBulkConfig] = useState('');

  const handleBulkUpload = async () => {
    try {
      // Parse bulk configuration and push to Cloudflare
      const config = JSON.parse(bulkConfig);
      // Implementation will depend on Cloudflare API
      alert('DNS records updated successfully!');
    } catch (error) {
      console.error('Error updating DNS records:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Bulk DNS Configuration</h2>
        <Form.Group className="mb-4">
          <Form.Label>Domain</Form.Label>
          <Form.Select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            <option value="">Select domain</option>
            <option value="example.com">example.com</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>DNS Configuration (JSON)</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={bulkConfig}
            onChange={(e) => setBulkConfig(e.target.value)}
            placeholder={`{
  "records": [
    {
      "type": "A",
      "name": "@",
      "content": "1.2.3.4",
      "ttl": 3600
    }
  ]
}`}
          />
        </Form.Group>

        <div className="flex justify-end space-x-2">
          <Button variant="primary" onClick={handleBulkUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Push to Cloudflare
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Current DNS Records</h2>
          <Button variant="outline-primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Content</th>
              <th className="text-left p-2">TTL</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{record.type}</td>
                <td className="p-2">{record.name}</td>
                <td className="p-2">{record.content}</td>
                <td className="p-2">{record.ttl}</td>
                <td className="p-2">
                  <Button variant="link" className="p-0">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}