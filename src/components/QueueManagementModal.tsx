import React, { useState } from 'react';
import { X } from 'lucide-react';

interface QueueManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  queues: Queue[];
  onSave: (queues: Queue[]) => void;
}

interface Queue {
  name: string;
  ispTarget: string;
  type: 'Fresh' | 'Engaged';
  speed: number;
  messageCount: number;
}

const ISP_TARGETS = ['Gmail', 'Yahoo/AOL', 'Hotmail'];
const QUEUE_TYPES = ['Fresh', 'Engaged'];

export function QueueManagementModal({ isOpen, onClose, domain, queues, onSave }: QueueManagementModalProps) {
  const [queueList, setQueueList] = useState<Queue[]>(queues);

  const addQueue = () => {
    setQueueList([...queueList, {
      name: '',
      ispTarget: 'Gmail',
      type: 'Fresh',
      speed: 0,
      messageCount: 0
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
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Queue Management - {domain}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <div className="space-y-4">
          {queueList.map((queue, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ISP Target</label>
                  <select
                    value={queue.ispTarget}
                    onChange={(e) => updateQueue(index, 'ispTarget', e.target.value)}
                    className="w-full border rounded-md p-2"
                  >
                    {ISP_TARGETS.map(isp => (
                      <option key={isp} value={isp}>{isp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={queue.type}
                    onChange={(e) => updateQueue(index, 'type', e.target.value as 'Fresh' | 'Engaged')}
                    className="w-full border rounded-md p-2"
                  >
                    {QUEUE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Speed (msg/hr)</label>
                  <input
                    type="number"
                    value={queue.speed}
                    onChange={(e) => updateQueue(index, 'speed', parseInt(e.target.value))}
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Messages in Queue</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={queue.messageCount}
                      readOnly
                      className="w-full border rounded-md p-2 bg-gray-50"
                    />
                    <button
                      onClick={() => emptyQueue(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Empty
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={addQueue}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Queue
          </button>
          <button
            onClick={() => onSave(queueList)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 