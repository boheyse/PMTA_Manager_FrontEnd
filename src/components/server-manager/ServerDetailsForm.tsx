import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

interface ServerDetailsFormProps {
  serverName: string;
  hostname: string;
  onServerNameChange: (value: string) => void;
  onHostnameChange: (value: string) => void;
  onSubmit: () => void;
  isConnecting: boolean;
  connectionError: string;
  ipAddresses: string[];
  submitButtonText?: string;
}

export function ServerDetailsForm({
  serverName,
  hostname,
  onServerNameChange,
  onHostnameChange,
  onSubmit,
  isConnecting,
  connectionError,
  ipAddresses,
  submitButtonText = 'Connect'
}: ServerDetailsFormProps) {
  return (
    <div className="max-w-2xl">
      <Form onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
        <Form.Group className="mb-4">
          <Form.Label>Server Name</Form.Label>
          <Form.Control
            type="text"
            value={serverName}
            onChange={(e) => onServerNameChange(e.target.value)}
            placeholder="Enter server name"
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Host Address</Form.Label>
          <Form.Control
            type="text"
            value={hostname}
            onChange={(e) => onHostnameChange(e.target.value)}
            placeholder="Enter host address"
          />
        </Form.Group>

        {connectionError && (
          <div className="text-danger mb-4">{connectionError}</div>
        )}

        {ipAddresses.length > 0 && (
          <div className="mb-4 p-4 bg-success-light rounded">
            <h4 className="text-success mb-2">Connected Successfully!</h4>
            <div>Available IP addresses:</div>
            <ul className="list-disc list-inside">
              {ipAddresses.map((ip, index) => (
                <li key={index}>{ip}</li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isConnecting || !serverName || !hostname}
          className="w-full"
        >
          {isConnecting ? 'Connecting...' : submitButtonText}
        </Button>
      </Form>
    </div>
  );
}