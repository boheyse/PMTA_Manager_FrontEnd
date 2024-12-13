import React from 'react';
import { Template } from '../../types/templates';
import { Edit2, Trash2 } from 'lucide-react';

interface TemplateViewerProps {
  template: Template;
  onClose: () => void;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
}

export function TemplateViewer({ template, onClose, onEdit, onDelete }: TemplateViewerProps) {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete template "${template.screen_name}"?`)) {
      onDelete(template);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">{template.screen_name}</h2>
            <p className="text-gray-600">{template.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onEdit(template)}
              className="text-blue-600 hover:text-blue-700"
              title="Edit template"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
              title="Delete template"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {template.content}
            </pre>
          </div>
          
          {template.json_data && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">JSON Data</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {JSON.stringify(template.json_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}