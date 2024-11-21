import { Col, Row, Form } from "react-bootstrap";
import TargetISPTabs2 from "./TargetISPTabs2";

interface QueueDetailsProps {
  queueName: string;
  queueDetails: any;
  sections: any[];
  onUpdateSections: (sections: any[]) => void;
}

const QueueDetails = ({ queueName, queueDetails, sections, onUpdateSections }: QueueDetailsProps) => {
  if (!queueDetails) return null;

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold">Queue Details</h3>
      <Form>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label>IP Address</Form.Label>
              <Form.Control
                type="text"
                value={queueDetails?.ipAddress || ""}
                disabled
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label>Queue Type</Form.Label>
              <Form.Control
                type="text"
                value={queueDetails?.queueType || ""}
                disabled
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-4">
              <Form.Label>Source Host</Form.Label>
              <Form.Control
                type="text"
                value={queueDetails?.sourceHost || ""}
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
                value={queueDetails?.domainKey || ""}
                disabled
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-4">
              <Form.Label>Domain Name</Form.Label>
              <Form.Control
                type="text"
                value={queueDetails?.domainName || ""}
                disabled
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label>Domain Key Path</Form.Label>
              <Form.Control
                type="text"
                value={queueDetails?.domainKeyPath || ""}
                disabled
              />
            </Form.Group>
          </Col>
        </Row>
          
        <TargetISPTabs2
          sections={sections}
          selectedQueueName={queueName}
          onUpdateSections={onUpdateSections}
        />
      </Form>
    </div>
  );
};

export default QueueDetails;