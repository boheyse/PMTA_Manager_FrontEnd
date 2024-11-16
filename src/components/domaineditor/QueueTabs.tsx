import { Tabs, Tab, Button } from "react-bootstrap";
import QueueDetails from "./QueueDetails";

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
}) => {
  const queueNames =
    queuesForSelectedPool?.flatMap((queue) =>
      queue.info.map((info) => info.queueName)
    ) || [];

  return (
    <div>
      <Tabs
        activeKey={selectedQueueName || ""}
        onSelect={(key) => {
          if (key === "add-new") {
            setShowAddQueueModal(true); // Show modal when "+" tab is clicked
          } else {
            setSelectedQueueName(key);
          }
        }}
        className="mt-4"
      >
        {queueNames.map((queueName) => (
          <Tab eventKey={queueName} key={queueName} title={queueName}>
            {selectedQueueName === queueName && (
              <QueueDetails
                activeQueueDetails={activeQueueDetails}
                selectedQueueName={selectedQueueName}
                queueSections={queueSections}
                poolName={poolName}
                onUpdateSections={onUpdateSections}
              />
            )}
          </Tab>
        ))}
        <Tab eventKey="add-new" title="+" />
      </Tabs>
    </div>
  );
};

export default QueueTabs;
