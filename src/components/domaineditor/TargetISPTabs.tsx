import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Button, Form } from 'react-bootstrap';
import { Section } from '../../types/domain';

const TargetISPTabs = React.memo(({ sections, selectedQueueName }) => {
  // Find the virtual-mta section that matches the selectedQueueName



  const virtualMTA = sections.find(
    (section) => section.key === 'virtual-mta' && section.value === selectedQueueName
  );

  // Get the start and end indices for the selected virtual-mta
  const startIndex = virtualMTA?.index;
  const endIndex = sections.find(
    (section) =>
      section.key === 'virtual-mta' &&
      section.type === 'section_end' &&
      section.index > startIndex
  )?.index;

  // Filter domain sections within the virtual-mta range
  const getDomainSections = () =>
    sections.filter(
      (section) =>
        section.key === 'domain' &&
        section.type === 'section_start' &&
        section.index > startIndex &&
        section.index < endIndex
    );

  const [domainSections, setDomainSections] = useState(getDomainSections());

  useEffect(() => {
    setDomainSections(getDomainSections());
  }, [selectedQueueName]);

  // Add a new domain section
  const addDomainSection = () => {
    const newDomainSection = {
      content: [],
      index: domainSections[domainSections.length - 1]?.index + 1 || startIndex + 1,
      key: 'domain',
      type: 'section_start',
      value: 'new.target.isp',
    };

    const newDomainEndSection = {
      content: [],
      index: newDomainSection.index + 1,
      key: 'domain',
      type: 'section_end',
      value: '',
    };

    // Update sections and recalculate indices
    const updatedSections = [...sections, newDomainSection, newDomainEndSection].map(
      (section, idx) => ({ ...section, index: idx })
    );

    setDomainSections([...domainSections, newDomainSection]);
  };

  // Update a domain section
  const updateDomainSection = (index, updatedValue) => {
    setDomainSections(
      domainSections.map((section) =>
        section.index === index ? { ...section, value: updatedValue } : section
      )
    );
  };

  // Delete a domain section
  const deleteDomainSection = (index) => {
    const updatedSections = domainSections.filter(
      (section) => section.index !== index && section.type !== 'section_end'
    );

    setDomainSections(updatedSections);
  };

  return (
    <div>
        <h4 className="text-lg font-semibold mt-4">Target ISPs</h4>
        <Button 
            variant="outline-primary" 
            onClick={addDomainSection} 
            size="sm" 
            className="mb-3"
            >
            Add Target ISP
        </Button>
        <Tabs>
          {domainSections.map((domain) => (
            <Tab eventKey={domain.value} key={domain.index} title={domain.value || 'Unnamed ISP'}>
              <div className="p-4 border rounded">
                <Form>
                  {domainSections.map((section) => (
                    <div
                      key={section.index}
                      className="mb-3 p-3 border rounded d-flex justify-content-between align-items-center"
                    >
                      <Form.Group className="flex-grow-1 me-3">
                        <Form.Label>Target ISP Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={section.value}
                          onChange={(e) =>
                            updateDomainSection(section.index, e.target.value)
                          }
                        />
                      </Form.Group>
                      <Button
                        variant="danger"
                        onClick={() => deleteDomainSection(section.index)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </Form>
              </div>
            </Tab>
          ))}
    </Tabs>
    </div>
  );
});

export default TargetISPTabs;
