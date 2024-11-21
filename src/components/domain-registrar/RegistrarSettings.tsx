import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export function RegistrarSettings() {
  const [registrar, setRegistrar] = useState('namecheap');
  const [settings, setSettings] = useState({
    apiKey: '',
    apiSecret: '',
    username: '',
    cloudflareToken: ''
  });

  const handleSave = async () => {
    try {
      // Save API credentials
      // Implementation will depend on your backend
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Registrar Settings</h2>

      <Form>
        <Form.Group className="mb-4">
          <Form.Label>Domain Registrar</Form.Label>
          <Form.Select
            value={registrar}
            onChange={(e) => setRegistrar(e.target.value)}
          >
            <option value="namecheap">Namecheap</option>
            <option value="godaddy">GoDaddy</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>API Key</Form.Label>
          <Form.Control
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>API Secret</Form.Label>
          <Form.Control
            type="password"
            value={settings.apiSecret}
            onChange={(e) => setSettings({ ...settings, apiSecret: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={settings.username}
            onChange={(e) => setSettings({ ...settings, username: e.target.value })}
          />
        </Form.Group>

        <hr className="my-6" />

        <h3 className="text-lg font-semibold mb-4">Cloudflare Settings</h3>

        <Form.Group className="mb-4">
          <Form.Label>API Token</Form.Label>
          <Form.Control
            type="password"
            value={settings.cloudflareToken}
            onChange={(e) => setSettings({ ...settings, cloudflareToken: e.target.value })}
          />
        </Form.Group>

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </Form>
    </div>
  );
}