import { Tabs } from "react-bootstrap";

import { Tab } from "react-bootstrap";
import QueueDetails from "./QueueDetails";

const QueueTabs = ({
    queuesForSelectedPool,
    selectedQueueName,
    setSelectedQueueName,
    activeQueueDetails,
    queueSections,
    poolName,
    onUpdateSections,
  }) => {
    const queueNames =
      queuesForSelectedPool?.flatMap((queue) =>
        queue.info.map((info) => info.queueName)
      ) || [];
  
    return (
      <Tabs
        activeKey={selectedQueueName || ""}
        onSelect={(key) => setSelectedQueueName(key)} // Set active queue tab
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
      </Tabs>
    );
  };

export default QueueTabs;
