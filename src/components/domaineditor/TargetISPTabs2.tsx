import { X, Plus } from 'lucide-react';
import React, { useMemo, useCallback, useState, useEffect } from 'react';
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
    const [activeTab, setActiveTab] = useState<number | null>(null);

    // Locate the virtual-mta section for the selectedQueueName
    const virtualMTA = useMemo(
      () =>
        sections.find(
          (section) =>
            section.key === 'virtual-mta' && section.value === selectedQueueName
        ),
      [sections, selectedQueueName]
    );

    // Get domain sections from the virtualMTA's sections and sort by index
    const domainSections = useMemo(() => {
      if (!virtualMTA || !virtualMTA.sections) return [];
      const sections = virtualMTA.sections
        .filter((section) => section.key === 'domain')
        .sort((a, b) => a.index - b.index);
      
      // Set initial active tab if not set and sections exist
      if (activeTab === null && sections.length > 0) {
        setActiveTab(sections[0].index);
      }
      console.log('activeTab:', activeTab);
      return sections;
    }, [virtualMTA, activeTab]);

    // Get the next available index for a new section
    const getNextIndex = useCallback(() => {
      if (!virtualMTA?.sections || virtualMTA.sections.length === 0) return 0;
      
      const domainSectionIndices = virtualMTA.sections
        .filter(section => section.key === 'domain')
        .map(section => section.index || 0);
      
      return domainSectionIndices.length > 0 
        ? Math.max(...domainSectionIndices) + 1 
        : 0;
    }, [virtualMTA]);

    // Add a new domain section
    const addDomainSection = useCallback(() => {
      if (!virtualMTA) return;

      const newIndex = getNextIndex();
      console.log('New domain section index:', newIndex);

      const newDomainSection: Section = {
        data: [],
        key: 'domain',
        type: 'section',
        value: 'new.target.isp',
        sections: [],
        index: newIndex,
      };

      // Create sections array if it doesn't exist
      const currentSections = virtualMTA.sections || [];

      // Add the new section to the virtualMTA's sections
      const updatedVMTA = {
        ...virtualMTA,
        sections: [...currentSections, newDomainSection],
      };

      // Update the main sections array
      const updatedSections = sections.map((section) =>
        section === virtualMTA ? updatedVMTA : section
      );

      onUpdateSections(updatedSections);
      setActiveTab(newIndex);
    }, [virtualMTA, sections, onUpdateSections, getNextIndex]);

    // Update a domain section's value
    const updateDomainSection = useCallback(
      (index: number, updatedValue: string) => {
        if (!virtualMTA || !virtualMTA.sections) return;

        const updatedVMTA = {
          ...virtualMTA,
          sections: virtualMTA.sections.map((section) =>
            section.index === index ? { ...section, value: updatedValue } : section
          ),
        };

        const updatedSections = sections.map((section) =>
          section === virtualMTA ? updatedVMTA : section
        );

        onUpdateSections(updatedSections);
      },
      [virtualMTA, sections, onUpdateSections]
    );

    // Delete a domain section
    const deleteDomainSection = useCallback(
      (index: number) => {
        if (!virtualMTA || !virtualMTA.sections) return;

        const updatedVMTA = {
          ...virtualMTA,
          sections: virtualMTA.sections.filter((section) => section.index !== index),
        };

        const updatedSections = sections.map((section) =>
          section === virtualMTA ? updatedVMTA : section
        );

        onUpdateSections(updatedSections);
        
        // Set active tab to the first remaining domain section's index, or null if none left
        const remainingDomainSections = updatedVMTA.sections.filter(section => section.key === 'domain');
        setActiveTab(remainingDomainSections.length > 0 ? remainingDomainSections[0].index : null);
      },
      [virtualMTA, sections, onUpdateSections]
    );

    // Add a new setting to a domain section
    const addDomainSetting = useCallback(
      (sectionIndex: number) => {
        if (!virtualMTA || !virtualMTA.sections) return;

        const updatedVMTA = {
          ...virtualMTA,
          sections: virtualMTA.sections.map((section) =>
            section.index === sectionIndex
              ? {
                  ...section,
                  sections: [
                    ...(section.sections || []),
                    {
                      key: '',
                      value: '',
                      type: 'setting',
                      index: section.sections ? section.sections.length : 0,
                    },
                  ],
                }
              : section
          ),
        };

        const updatedSections = sections.map((section) =>
          section === virtualMTA ? updatedVMTA : section
        );

        onUpdateSections(updatedSections);
      },
      [virtualMTA, sections, onUpdateSections]
    );

    // Update a domain setting
    const updateDomainSetting = useCallback(
      (sectionIndex: number, settingIndex: number, field: 'key' | 'value', newValue: string) => {
        if (!virtualMTA || !virtualMTA.sections) return;

        const updatedVMTA = {
          ...virtualMTA,
          sections: virtualMTA.sections.map((section) =>
            section.index === sectionIndex
              ? {
                  ...section,
                  sections: (section.sections || []).map((setting, idx) =>
                    idx === settingIndex
                      ? { ...setting, [field]: newValue }
                      : setting
                  ),
                }
              : section
          ),
        };

        const updatedSections = sections.map((section) =>
          section === virtualMTA ? updatedVMTA : section
        );
        console.log('updatedSections:', JSON.stringify(updatedSections, null, 2));

        onUpdateSections(updatedSections);
      },
      [virtualMTA, sections, onUpdateSections]
    );

    // Delete a domain setting
    const deleteDomainSetting = useCallback(
      (sectionIndex: number, settingIndex: number) => {
        if (!virtualMTA || !virtualMTA.sections) return;

        const updatedVMTA = {
          ...virtualMTA,
          sections: virtualMTA.sections.map((section) =>
            section.index === sectionIndex
              ? {
                  ...section,
                  sections: (section.sections || []).filter((_, idx) => idx !== settingIndex),
                }
              : section
          ),
        };

        const updatedSections = sections.map((section) =>
          section === virtualMTA ? updatedVMTA : section
        );

        onUpdateSections(updatedSections);
      },
      [virtualMTA, sections, onUpdateSections]
    );

    // Handle tab change
    const handleTabChange = (index: number | null) => {
      setActiveTab(index);
    };

    return (
      <div>
        <h4 className="text-lg font-semibold mt-4">Target ISPs</h4>
        <Tabs
          activeKey={activeTab?.toString() || ''}
          onSelect={(key) => {
            if (key === "add-new") {
              addDomainSection();
            } else {
              setActiveTab(Number(key));
            }
          }}
          className="mb-3"
        >
          {domainSections.map((domain) => (
            <Tab
              eventKey={domain.index}
              key={domain.index}
              title={
                <div className="flex items-center">
                  <span>{domain.value}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDomainSection(domain.index);
                    }}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              }
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
                          onChange={(e) => updateDomainSection(domain.index, e.target.value)}
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
                    {(domain.sections || []).map((setting, settingIdx) => (
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
                          onClick={() => deleteDomainSetting(domain.index, settingIdx)}
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
  }
);

export default TargetISPTabs2;
