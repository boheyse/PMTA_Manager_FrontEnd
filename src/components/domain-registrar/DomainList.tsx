import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { RefreshCw, Edit2, Trash2 } from 'lucide-react';

interface Domain {
  created_on: string;
  id: string;
  modified_on: string;
  name: string;
  name_servers: string[];
  original_name_servers: string[];
  status: string;
}

interface DomainListProps {
  domains: Domain[];
}

export function DomainList({ domains }: DomainListProps) {
  return (
    <div className="grid gap-4">
      {domains.map((domain) => (
        <div key={domain.id} className="p-4 border rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{domain.name}</h3>
              <p className="text-sm text-gray-600">Status: {domain.status}</p>
              <p className="text-sm text-gray-600">
                Created: {new Date(domain.created_on).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Nameservers:</p>
              {domain.name_servers.map((ns: string, index: number) => (
                <p key={index} className="text-sm text-gray-600">{ns}</p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}