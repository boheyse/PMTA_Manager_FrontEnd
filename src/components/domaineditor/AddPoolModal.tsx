import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AddPoolModal = ({
  show,
  onHide,
  onSubmit,
  newQueueType,
  setNewQueueType,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add a New Pool</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="queueType">
            <Form.Label>Queue Type</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter queue type (e.g., test, default)"
              value={newQueueType}
              onChange={(e) => setNewQueueType(e.target.value)}
            />
            <Form.Text className="text-muted">
              Use "default" for a generic pool.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Add Pool
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddPoolModal;
