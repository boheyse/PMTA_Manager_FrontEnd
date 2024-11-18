import React from 'react';
import { Form } from 'react-bootstrap';
import type { Node } from '../../types/node';

interface NodeSettingsProps {
  node: Node;
}

export function NodeSettings({ node }: NodeSettingsProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Node Settings</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Maximum Connections</Form.Label>
          <Form.Control type="number" defaultValue={100} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Rate Limit (emails/hour)</Form.Label>
          <Form.Control type="number" defaultValue={1000} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Retry Interval (minutes)</Form.Label>
          <Form.Control type="number" defaultValue={15} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="auto-throttle"
            label="Enable Auto-throttling"
            defaultChecked
          />
        </Form.Group>
      </Form>
    </div>
  );
}