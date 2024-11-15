import { X, Plus } from 'lucide-react';
import React, { useMemo, useCallback, useState } from 'react';
import { Tabs, Tab, Button, Form } from 'react-bootstrap';
import { Section } from '../../types/domain';

const TargetISPTabs2 = React.memo(
  ({
    sections,
    selectedQueueName,
    onUpdateSections,
  }: {
    sections: Section[];
    selectedQueueName: string;
    onUpdateSections: (updatedSections: Section[]) => void;
  }) => {

    // Active tab state
    const [activeTab, setActiveTab] = useState<number | null>(0);

    // Locate the virtual-mta section for the selectedQueueName
    const virtualMTA = useMemo(
      () =>
        sections.find(
          (section) =>
            section.key === 'virtual-mta' && section.value === selectedQueueName
        ),
      [sections, selectedQueueName]
    );

    // Compute start and end indices for the relevant virtual-mta
    const [startIndex, endIndex] = useMemo(() => {
      if (!virtualMTA) return [null, null];
      const end = sections.find(
        (section) =>
          section.key === 'virtual-mta' &&
          section.type === 'section_end' &&
          section.index > virtualMTA.index
      );
      return [virtualMTA.index, end?.index];
    }, [virtualMTA, sections]);

    // Compute domain sections dynamically
    const domainSections = useMemo(() => {
      if (startIndex === null || endIndex === null) return [];
      return sections.filter(
        (section) =>
          section.key === 'domain' &&
          section.type === 'section_start' &&
          section.index > startIndex &&
          section.index < endIndex
      );
    }, [sections, startIndex, endIndex]);

    // Add a new domain section
    const addDomainSection = useCallback(() => {
        if (endIndex === null) return; // Ensure endIndex is valid
        
        // Bump indices for sections after endIndex by 3
        const bumpedSections = sections.map((section) =>
          section.index >= endIndex
            ? { ...section, index: section.index + 3 }
            : section
        );
      
        // Define new sections to be added
        const newDomainSection: Section = {
          content: [],
          index: endIndex,
          key: 'domain',
          type: 'section_start',
          value: 'new.target.isp',
        };
      
        const newDomainEndSection: Section = {
          content: [],
          index: endIndex + 1,
          key: 'domain',
          type: 'section_end',
          value: '',
        };

        const newEmptyLine: Section = {
            content: [],
            index: endIndex + 2,
            key: '',
            type: 'empty_line',
            value: '',
          };
      
        // Combine bumped sections with new sections and sort
        const updatedSections = [
          ...bumpedSections,
          newEmptyLine,
          newDomainSection,
          newDomainEndSection,
        ].sort((a, b) => a.index - b.index);
      
        onUpdateSections(updatedSections);
        // Set the newly added domain section as the active tab
        setActiveTab(newDomainSection.index);
      }, [sections, endIndex, onUpdateSections]);
      

    // Update a domain section's value
    const updateDomainSection = useCallback(
      (index: number, updatedValue: string) => {
        const updatedSections = sections.map((section) =>
          section.index === index ? { ...section, value: updatedValue } : section
        );
        onUpdateSections(updatedSections);
      },
      [sections, onUpdateSections]
    );

    // Handle tab change
    const handleTabChange = useCallback(
        (tabIndex: string | null) => {
            setActiveTab(tabIndex ? parseInt(tabIndex, 10) : null);
        },
        []
    );

    // Add a domain setting
    const addDomainSetting = useCallback(
      (index: number) => {
        const updatedSections = sections.map((section) =>
          section.index === index
            ? {
                ...section,
                content: [
                  ...(section.content || []),
                  { key: '', value: '', type: 'setting', data: [] },
                ],
              }
            : section
        );
        onUpdateSections(updatedSections);
      },
      [sections, onUpdateSections]
    );

    // Generic function to update a domain section's setting property
    const updateDomainSetting = useCallback(
      (
        index: number,
        settingIndex: number,
        property: 'key' | 'value',
        updatedValue: string
      ) => {
        const updatedSections = sections.map((section) =>
          section.index === index
            ? {
                ...section,
                content: section.content.map((setting, i) =>
                  i === settingIndex
                    ? { ...setting, [property]: updatedValue }
                    : setting
                ),
              }
            : section
        );
        onUpdateSections(updatedSections);
      },
      [sections, onUpdateSections]
    );

    // Delete a domain section's setting
    const deleteDomainSetting = useCallback(
      (index: number, settingIndex: number) => {
        const updatedSections = sections.map((section) =>
          section.index === index
            ? {
                ...section,
                content: section.content.filter((_, i) => i !== settingIndex),
              }
            : section
        );
        onUpdateSections(updatedSections);
      },
      [sections, onUpdateSections]
    );

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
        <Tabs
          activeKey={activeTab?.toString() || ''}
          onSelect={handleTabChange}
        >
          {domainSections.map((domain) => (
            <Tab
              eventKey={domain.index || ''}
              key={domain.index}
              title={domain.value || 'Unnamed ISP'}
            >
              <div className="p-4 border rounded">
                <Form>
                  <div className="border rounded p-3 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span>Target ISP Name:</span>
                        <Form.Control
                          type="text"
                          value={domain.value || ''}
                          onChange={(e) =>
                            updateDomainSection(domain.index, e.target.value)
                          }
                          placeholder="Enter Target ISP"
                          className="w-full"
                        />
                      </div>
                      <Button
                        variant="link"
                        className="flex items-center"
                        onClick={() => addDomainSetting(domain.index)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Setting
                      </Button>
                    </div>
                  </div>
                </Form>
                <Form>
                  <div className="grid grid-cols-2 gap-4">
                    {domain.content?.map((setting, settingIdx) => (
                      <div
                        key={settingIdx}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <div className="flex-1 flex gap-2">
                          <div className="w-1/2">
                            <Form.Control
                              type="text"
                              value={setting.key || ''}
                              onChange={(e) =>
                                updateDomainSetting(
                                  domain.index,
                                  settingIdx,
                                  'key',
                                  e.target.value
                                )
                              }
                              size="sm"
                              className="bg-light w-full"
                              placeholder="Key"
                            />
                          </div>
                          <div className="w-1/2">
                            <Form.Control
                              type="text"
                              value={setting.value || ''}
                              onChange={(e) =>
                                updateDomainSetting(
                                  domain.index,
                                  settingIdx,
                                  'value',
                                  e.target.value
                                )
                              }
                              size="sm"
                              className="hover:bg-gray-50 focus:bg-white transition-colors w-full"
                              placeholder="Value"
                              style={{ cursor: 'text' }}
                            />
                          </div>
                        </div>
                        <Button
                          variant="link"
                          className="p-0 text-danger flex-shrink-0"
                          onClick={() =>
                            deleteDomainSetting(domain.index, settingIdx)
                          }
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Form>
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    );
  }
);

export default TargetISPTabs2;
