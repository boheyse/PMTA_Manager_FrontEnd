import React from 'react';
import { Form } from 'react-bootstrap';
import { Template } from '../../types/templates';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onTemplateChange: (template: Template | null) => void;
}

export function TemplateSelector({ 
  templates, 
  selectedTemplate, 
  onTemplateChange 
}: TemplateSelectorProps) {
  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = templates.find(t => t.name === e.target.value);
    onTemplateChange(template || null);
  };

  return (
    <Form.Select
      onChange={handleTemplateSelect}
      value={selectedTemplate?.name || ''}
      className="w-64"
    >
      <option value="">Select a template</option>
      {templates.map(template => (
        <option key={template.name} value={template.name}>
          {template.name}
        </option>
      ))}
    </Form.Select>
  );
} 