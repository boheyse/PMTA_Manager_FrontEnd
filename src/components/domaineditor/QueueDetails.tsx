import { Col } from "react-bootstrap";

import { Row } from "react-bootstrap";

import { Form } from "react-bootstrap";
import TargetISPTabs2 from "./TargetISPTabs2";

const QueueDetails = ({ activeQueueDetails, selectedQueueName, queueSections, poolName, onUpdateSections }) => {
    if (!activeQueueDetails) return null;
  
    return (
      <div className="p-4 border rounded">
        <h3 className="text-lg font-semibold">Queue Details</h3>
        <Form>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-4">
                <Form.Label>Subdomain</Form.Label>
                <Form.Control
                  type="text"
                  value={activeQueueDetails?.subDomain || ""}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-4">
                <Form.Label>IP Address</Form.Label>
                <Form.Control
                  type="text"
                  value={activeQueueDetails?.ipAddress || ""}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-4">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  type="text"
                  value={activeQueueDetails?.queueType || ""}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group className="mb-4">
                    <Form.Label>Domain Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={activeQueueDetails?.domainName || ""}
                        disabled
                    />
                </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
                <Form.Group className="mb-4">
                    <Form.Label>Domain Key</Form.Label>
                    <Form.Control
                        type="text"
                        value={activeQueueDetails?.domainKey || ""}
                        disabled
                    />
                </Form.Group>
            </Col>
            <Col md={7}>
                <Form.Group className="mb-4">
                    <Form.Label>Domain Key Path</Form.Label>
                    <Form.Control
                        type="text"
                        value={activeQueueDetails?.domainKeyPath || ""}
                        disabled
                    />
                </Form.Group>
            </Col>
          </Row>
        </Form>
        <TargetISPTabs2
            sections={queueSections}
            selectedQueueName={selectedQueueName || ""}
            poolName={poolName || ""}
            onUpdateSections={onUpdateSections}
        />
      </div>
    );
  };
  
export default QueueDetails;