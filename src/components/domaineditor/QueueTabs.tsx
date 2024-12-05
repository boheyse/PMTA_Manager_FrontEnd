import { Tabs, Tab, Button } from "react-bootstrap";
import { X, Trash2 } from 'lucide-react';
import QueueDetails from "./QueueDetails";
import type { QueueData } from '../../types/domain';

interface QueueTabsProps {
  queuesForSelectedPool: QueueData;
  selectedQueueName: string;
  setSelectedQueueName: (name: string) => void;
  activeQueueDetails: any;
  queueSections: any[];
  poolName: string;
  onUpdateSections: (sections: any[]) => void;
  showAddQueueModal: boolean;
  setShowAddQueueModal: (show: boolean) => void;
  onDeletePool: () => void;
  onDeleteQueue: (queueName: string) => void;
}

const QueueTabs = ({
  queuesForSelectedPool,
  selectedQueueName,
  setSelectedQueueName,
  activeQueueDetails,
  queueSections,
  poolName,
  onUpdateSections,
  showAddQueueModal,
  setShowAddQueueModal,
  onDeletePool,
  onDeleteQueue,
}: QueueTabsProps) => {
  const queueNames = queuesForSelectedPool?.info?.map((info) => info.queueName) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{poolName}</h3>
        <button
          onClick={onDeletePool}
          className="text-red-600 hover:text-red-800 flex items-center"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete Pool
        </button>
      </div>
      <Tabs
        activeKey={selectedQueueName || ""}
        onSelect={(key) => {
          if (key === "add-new") {
            setShowAddQueueModal(true);
          } else {
            setSelectedQueueName(key);
          }
        }}
        className="mt-4"
      >
        {queueNames.map((queueName) => (
          <Tab
            key={queueName}
            eventKey={queueName}
            title={
              <div className="flex items-center">
                <span>{queueName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteQueue(queueName);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            }
          >
            {selectedQueueName === queueName && (
              <QueueDetails
                queueName={queueName}
                queueDetails={activeQueueDetails}
                sections={queueSections}
                onUpdateSections={onUpdateSections}
              />
            )}
          </Tab>
        ))}
        <Tab
          eventKey="add-new"
          title={
            <Button variant="link" className="p-0">
              +
            </Button>
          }
        />
      </Tabs>
    </div>
  );
};

export default QueueTabs;
