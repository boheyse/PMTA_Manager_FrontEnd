import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (domain: DomainFormData) => void;
  editData?: Domain;
  availableIPs: string[];
}

export interface DomainFormData {
  domain: string;
  subdomains: {
    name: string;
    ipAddress: string;
    queueName: string;
    queueStatus: QueueStatus;
  }[];
}

const initialFormData: DomainFormData = {
  domain: '',
  subdomains: [{
    name: '',
    ipAddress: '',
    queueName: '',
    queueStatus: 'Active' as QueueStatus
  }]
};

export function DomainModal({ isOpen, onClose, onSave, editData, availableIPs }: DomainModalProps) {
  const [formData, setFormData] = useState<DomainFormData>(initialFormData);
  const [customIP, setCustomIP] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          domain: editData.domain,
          subdomains: editData.subdomains.map(sub => ({
            name: sub.name,
            ipAddress: sub.ipAddress,
            queueName: sub.queueName,
            queueStatus: sub.queueStatus
          }))
        });
      } else {
        setFormData(initialFormData);
        setCustomIP('');
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const addSubdomain = () => {
    setFormData(prev => ({
      ...prev,
      subdomains: [...prev.subdomains, {
        name: '',
        ipAddress: '',
        queueName: '',
        queueStatus: 'Active' as QueueStatus
      }]
    }));
  };

  const removeSubdomain = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subdomains: prev.subdomains.filter((_, i) => i !== index)
    }));
  };

  const updateSubdomain = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      subdomains: prev.subdomains.map((sub, i) => 
        i === index ? { ...sub, [field]: value } : sub
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {editData ? 'Edit Domain' : 'Add New Domain'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block mb-2 font-medium">Domain Name</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example.com"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="font-medium">Subdomains</label>
                <button
                  type="button"
                  onClick={addSubdomain}
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subdomain
                </button>
              </div>

              {formData.subdomains.map((subdomain, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-medium">Subdomain {index + 1}</h3>
                    {formData.subdomains.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubdomain(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Subdomain Name</label>
                      <input
                        type="text"
                        value={subdomain.name}
                        onChange={(e) => updateSubdomain(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="mail.example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2">IP Address</label>
                      <div className="flex space-x-2">
                        <select
                          value={subdomain.ipAddress}
                          onChange={(e) => updateSubdomain(index, 'ipAddress', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select IP or enter custom</option>
                          {availableIPs.map(ip => (
                            <option key={ip} value={ip}>{ip}</option>
                          ))}
                        </select>
                      </div>
                      {subdomain.ipAddress === '' && (
                        <input
                          type="text"
                          value={customIP}
                          onChange={(e) => {
                            setCustomIP(e.target.value);
                            updateSubdomain(index, 'ipAddress', e.target.value);
                          }}
                          className="w-full mt-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter custom IP"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block mb-2">Queue Name</label>
                      <input
                        type="text"
                        value={subdomain.queueName}
                        onChange={(e) => updateSubdomain(index, 'queueName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example.com-fresh"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 