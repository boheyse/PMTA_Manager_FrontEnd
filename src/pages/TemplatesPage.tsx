import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { axiosGet, axiosPost, axiosPut } from '../utils/apiUtils';
import { Template } from '../types/templates';
import { TemplateViewer } from '../components/templates/TemplateViewer';
import { TemplateEditor } from '../components/templates/TemplateEditor';
import { ISPSettingsManager } from '../components/isp-settings';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await axiosGet('/api/v1/templates');
      
      if (response.templates) {
        const processedTemplates = response.templates.map(template => ({
          ...template,
          content: template.content || '',
          json_data: template.json_data ? JSON.parse(JSON.stringify(template.json_data)) : {}
        }));
        setTemplates(processedTemplates);
      } else {
        throw new Error('No templates found in response');
      }
    } catch (err) {
      console.error('Template fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (templateData: Partial<Template>) => {
    try {
      if (editingTemplate) {
        // Update existing template
        await axiosPut(`/api/v1/templates/${editingTemplate.name}`, templateData);
        toast.success('Template updated successfully', {
            autoClose: 2000,
          });
      } else {
        // Create new template
        await axiosPost('/api/v1/templates', templateData);
        toast.success('Template created successfully', {
            autoClose: 2000,
          });
      }
      
      // Refresh templates list
      await fetchTemplates();
      
      // Close editor
      setEditingTemplate(null);
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to save template:', err);
      toast.error('Failed to save template', {
        autoClose: 2000,
      });
    }
  };

  const handleDelete = async (template: Template) => {
    try {
      await axiosPost(`/api/v1/templates/${template.name}`);
      toast.success('Template deleted successfully', {
        autoClose: 2000,
      });
      await fetchTemplates();
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Failed to delete template:', err);
      toast.error('Failed to delete template', {
        autoClose: 2000,
      });
    }
  };

  const filteredTemplates = templates.filter(
    template =>
      template.screen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 rounded-lg bg-red-50">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
            onClick={() => setSelectedTemplate(template)}
          >
            <h3 className="text-lg font-semibold mb-2">{template.screen_name}</h3>
            <p className="text-gray-600 text-sm">{template.description}</p>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>Last updated: {new Date(template.updated_at).toLocaleDateString()}</span>
              <span className={`px-2 py-1 rounded-full ${
                template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {template.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <TemplateViewer
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onEdit={(template) => {
            setSelectedTemplate(null);
            setEditingTemplate(template);
          }}
          onDelete={handleDelete}
        />
      )}

      {(editingTemplate || isCreating) && (
        editingTemplate?.name.toLowerCase().includes('isp') ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit ISP Template</h2>
                <button 
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsCreating(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Template Name</label>
                      <input
                        type="text"
                        value={editingTemplate?.name || ''}
                        onChange={(e) => setEditingTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Display Name</label>
                      <input
                        type="text"
                        value={editingTemplate?.screen_name || ''}
                        onChange={(e) => setEditingTemplate(prev => prev ? {...prev, screen_name: e.target.value} : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editingTemplate?.description || ''}
                      onChange={(e) => setEditingTemplate(prev => prev ? {...prev, description: e.target.value} : null)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingTemplate?.is_active || false}
                      onChange={(e) => setEditingTemplate(prev => prev ? {...prev, is_active: e.target.checked} : null)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Active</label>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">ISP Settings</h3>
                    <ISPSettingsManager
                      selectedTemplate={editingTemplate}
                      onTemplateChange={(template) => {
                        if (template) {
                          handleSave({
                            ...template,
                            name: editingTemplate?.name,
                            screen_name: editingTemplate?.screen_name,
                            description: editingTemplate?.description,
                            is_active: editingTemplate?.is_active
                          });
                        }
                      }}
                      viewOnly={false}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <TemplateEditor
            template={editingTemplate}
            onClose={() => {
              setEditingTemplate(null);
              setIsCreating(false);
            }}
            onSave={handleSave}
            isNew={isCreating}
          />
        )
      )}
    </div>
  );
}