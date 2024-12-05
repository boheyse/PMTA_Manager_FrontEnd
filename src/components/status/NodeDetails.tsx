import React, { useState } from 'react';
import { Modal, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings, Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Node } from '../../types/node';
import { DomainHealthGrid } from './DomainHealthGrid';
import { ISPMetrics } from './ISPMetrics';

interface NodeDetailsProps {
  show: boolean;
  onHide: () => void;
  node: Node;
  onUpdate: (updatedNode: Node) => void;
}

export function NodeDetails({ show, onHide, node, onUpdate }: NodeDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNode, setEditedNode] = useState<Node>(node);
  const [activeTab, setActiveTab] = useState('overview');

  if (!node) return null;

  // Mock data for charts
  const deliveryData = [
    { time: '00:00', delivered: 95, bounced: 5 },
    { time: '04:00', delivered: 92, bounced: 8 },
    { time: '08:00', delivered: 98, bounced: 2 },
    { time: '12:00', delivered: 94, bounced: 6 },
    { time: '16:00', delivered: 96, bounced: 4 },
    { time: '20:00', delivered: 93, bounced: 7 },
  ];

  const handleSave = () => {
    onUpdate(editedNode);
    setIsEditing(false);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered dialogClassName="modal-90w">
      <Modal.Header closeButton>
        <Modal.Title className="flex items-center space-x-2">
          {node.status === 'connected' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span>{node.name}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'overview')}
          className="mb-4"
        >
          <Tab eventKey="overview" title="Overview">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Node Information</h3>
                  {isEditing ? (
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Node Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={editedNode.name}
                          onChange={(e) => setEditedNode({ ...editedNode, name: e.target.value })}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Host Address</Form.Label>
                        <Form.Control
                          type="text"
                          value={editedNode.host}
                          onChange={(e) => setEditedNode({ ...editedNode, host: e.target.value })}
                        />
                      </Form.Group>
                    </Form>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">Host:</span> {node.host}
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>{' '}
                        <span className={node.status === 'connected' ? 'text-green-500' : 'text-red-500'}>
                          {node.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Uptime:</span> 14 days, 6 hours
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Current Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Delivery Rate</div>
                      <div className="text-xl font-semibold text-green-500">
                        {((node.stats.emailsDelivered / node.stats.emailsSent) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Bounce Rate</div>
                      <div className="text-xl font-semibold text-red-500">
                        {((node.stats.emailsBounced / node.stats.emailsSent) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Open Rate</div>
                      <div className="text-xl font-semibold">{node.stats.uniqueOpenRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Click Rate</div>
                      <div className="text-xl font-semibold">{node.stats.clickRate}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Delivery Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={deliveryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="delivered" stroke="#10B981" name="Delivered %" />
                        <Line type="monotone" dataKey="bounced" stroke="#EF4444" name="Bounced %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-green-500" />
                      <span>Successfully delivered 1,234 emails</span>
                      <span className="ml-auto text-gray-500">2m ago</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                      <span>Temporary delivery delay to Gmail</span>
                      <span className="ml-auto text-gray-500">15m ago</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Settings className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Configuration updated</span>
                      <span className="ml-auto text-gray-500">1h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab>

          <Tab eventKey="domains" title="Domain Health">
            <DomainHealthGrid nodes={[node]} />
          </Tab>

          <Tab eventKey="isps" title="ISP Metrics">
            <ISPMetrics nodes={[node]} />
          </Tab>

          <Tab eventKey="settings" title="Settings">
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
          </Tab>

          <Tab eventKey="logs" title="Logs">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-96 overflow-auto">
              <div>[2024-01-20 10:15:23] Connected to SMTP server</div>
              <div>[2024-01-20 10:15:24] Starting mail delivery</div>
              <div>[2024-01-20 10:15:25] Successfully delivered to recipient@example.com</div>
              <div>[2024-01-20 10:15:26] Queue processed successfully</div>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        {isEditing ? (
          <>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Node
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}