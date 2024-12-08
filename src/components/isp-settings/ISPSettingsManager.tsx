import React, { useState, useEffect } from 'react';
import { Form, Button, Tabs, Tab } from 'react-bootstrap';
import { Plus, X, Info } from 'lucide-react';
import { axiosGet } from '../../utils/apiUtils';
import { recipientDomainSettings } from '../../config/recipientDomainSettings';

interface Setting {
  key: string;
  value: string;
}

interface ISP {
  name: string;
  settings: Setting[];
}

interface TemplateContent {
  isps: ISP[];
}

interface Template {
  name: string;
  content: string;
  screen_name: string;
  description: string;
  json_data: TemplateContent;
}

interface ISPSettingsManagerProps {
  onTemplateChange: (template: Template | null) => void;
}

export function ISPSettingsManager({ onTemplateChange }: ISPSettingsManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeISPIndex, setActiveISPIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axiosGet('/api/v1/templates?contains=isp');
        setTemplates(response.templates);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = templates.find(t => t.name === e.target.value);
    setSelectedTemplate(template || null);
    setActiveISPIndex(0);
    onTemplateChange(template || null);
  };

  const addSetting = (ispIndex: number) => {
    if (!selectedTemplate) return;

    const updatedTemplate = { ...selectedTemplate };
    updatedTemplate.json_data.isps[ispIndex].settings.push({ key: '', value: '' });
    setSelectedTemplate(updatedTemplate);
  };

  const updateSetting = (
    ispIndex: number,
    settingIndex: number,
    field: 'key' | 'value',
    value: string
  ) => {
    if (!selectedTemplate) return;

    const updatedTemplate = { ...selectedTemplate };
    updatedTemplate.json_data.isps[ispIndex].settings[settingIndex][field] = value;
    setSelectedTemplate(updatedTemplate);
  };

  const deleteSetting = (ispIndex: number, settingIndex: number) => {
    if (!selectedTemplate) return;

    const updatedTemplate = { ...selectedTemplate };
    updatedTemplate.json_data.isps[ispIndex].settings.splice(settingIndex, 1);
    setSelectedTemplate(updatedTemplate);
  };

  const filteredSettings = (settings: Setting[]) => {
    return settings.filter(setting =>
      setting.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <Form.Group>
            <Form.Label>Choose from template</Form.Label>
            <Form.Select
              onChange={handleTemplateSelect}
              value={selectedTemplate?.name || ''}
            >
              <option value="">Select a template</option>
              {templates.map(template => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <Button variant="outline-primary">Save as Template</Button>
      </div>

      {selectedTemplate && (
        <>
          <div className="mb-4">
            <Form.Control
              type="text"
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs
            activeKey={activeISPIndex}
            onSelect={(k) => setActiveISPIndex(Number(k))}
            className="mb-4"
          >
            {selectedTemplate.json_data.isps.map((isp, index) => (
              <Tab
                key={isp.name}
                eventKey={index}
                title={isp.name}
              >
                <div className="p-4 border rounded">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{isp.name}</h3>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => addSetting(index)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Setting
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {filteredSettings(isp.settings).map((setting, settingIndex) => (
                      <div
                        key={settingIndex}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <div className="flex-1 flex gap-2">
                          <div className="w-1/2 relative">
                            <Form.Control
                              type="text"
                              value={setting.key}
                              onChange={(e) =>
                                updateSetting(index, settingIndex, 'key', e.target.value)
                              }
                              list="settingKeys"
                              placeholder="Key"
                              size="sm"
                            />
                            {setting.key && recipientDomainSettings[setting.key] && (
                              <div className="relative inline-block ml-2">
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-white border rounded shadow-lg text-sm">
                                  <p className="text-gray-600">
                                    {recipientDomainSettings[setting.key].description}
                                  </p>
                                  {recipientDomainSettings[setting.key].syntax && (
                                    <p className="mt-1 text-gray-500 font-mono text-xs">
                                      Syntax: {recipientDomainSettings[setting.key].syntax}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="w-1/2">
                            <Form.Control
                              type="text"
                              value={setting.value}
                              onChange={(e) =>
                                updateSetting(index, settingIndex, 'value', e.target.value)
                              }
                              placeholder={
                                setting.key && recipientDomainSettings[setting.key]
                                  ? `Default: ${recipientDomainSettings[setting.key].default}`
                                  : 'Value'
                              }
                              size="sm"
                            />
                          </div>
                        </div>
                        <Button
                          variant="link"
                          className="p-0 text-danger"
                          onClick={() => deleteSetting(index, settingIndex)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>
            ))}
          </Tabs>

          <datalist id="settingKeys">
            {Object.keys(recipientDomainSettings).map(key => (
              <option key={key} value={key} />
            ))}
          </datalist>
        </>
      )}
    </div>
  );
}