import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import type { Queue, ISPTarget, QueueType } from '../types/domain';

interface QueueManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  queues: Queue[];
  onSave: (queues: Queue[]) => void;
}

const ISP_TARGETS = ['Gmail', 'Yahoo/AOL', 'Hotmail'];
const QUEUE_TYPES = ['Fresh', 'Engaged'];

export function QueueManagementModal({ isOpen, onClose, domain, queues, onSave }: QueueManagementModalProps) {
  const [queueList, setQueueList] = useState<Queue[]>(queues);

  const addQueue = () => {
    setQueueList([...queueList, {
      name: '',
      ispTarget: 'Gmail' as ISPTarget,
      type: 'Fresh' as QueueType,
      speed: 0,
      messageCount: 0,
      status: 'Active'
    }]);
  };

  const updateQueue = (index: number, field: keyof Queue, value: string | number) => {
    const newQueues = [...queueList];
    newQueues[index] = { ...newQueues[index], [field]: value };
    
    // Auto-generate name based on ISP and type
    if (field === 'ispTarget' || field === 'type') {
      newQueues[index].name = `${domain}-${newQueues[index].ispTarget}-${newQueues[index].type}`.toLowerCase();
    }
    
    setQueueList(newQueues);
  };

  const emptyQueue = (index: number) => {
    const newQueues = [...queueList];
    newQueues[index].messageCount = 0;
    setQueueList(newQueues);
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Queue Management - {domain}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="space-y-4">
          {queueList.map((queue, index) => (
            <div key={index} className="border rounded p-3 mb-3">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ISP Target</Form.Label>
                    <Form.Select
                      value={queue.ispTarget}
                      onChange={(e) => updateQueue(index, 'ispTarget', e.target.value as ISPTarget)}
                    >
                      {ISP_TARGETS.map(isp => (
                        <option key={isp} value={isp}>{isp}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      value={queue.type}
                      onChange={(e) => updateQueue(index, 'type', e.target.value as QueueType)}
                    >
                      {QUEUE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Speed (msg/hr)</Form.Label>
                    <Form.Control
                      type="number"
                      value={queue.speed}
                      onChange={(e) => updateQueue(index, 'speed', parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Messages in Queue</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="number"
                        value={queue.messageCount}
                        readOnly
                        className="bg-light"
                      />
                      <Button
                        variant="danger"
                        onClick={() => emptyQueue(index)}
                      >
                        Empty
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={addQueue}>
          Add Queue
        </Button>
        <Button variant="primary" onClick={() => onSave(queueList)}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 