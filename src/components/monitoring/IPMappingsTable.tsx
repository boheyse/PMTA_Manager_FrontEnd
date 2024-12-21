import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface VMTAInfo {
  name: string;
  rcp: number;
  kb: number;
  pctOfTotal: number;
  conn: number;
  dom: number;
}

interface IPMapping {
  ipAddress: string;
  domains: Set<string>;
  vmtas: VMTAInfo[];
}

interface IPMappingsTableProps {
  mappings: IPMapping[];
  expandedIPs: string[];
  onToggleIP: (ip: string) => void;
}

export function IPMappingsTable({ mappings, expandedIPs, onToggleIP }: IPMappingsTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="w-8"></th>
          <th className="text-left p-4">IP Address</th>
          <th className="text-left p-4">Domains</th>
          <th className="text-left p-4">Total VMTAs</th>
          <th className="text-left p-4">Active Connections</th>
        </tr>
      </thead>
      <tbody>
        {mappings.map(mapping => (
          <React.Fragment key={mapping.ipAddress}>
            <tr 
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onToggleIP(mapping.ipAddress)}
            >
              <td className="p-4">
                {expandedIPs.includes(mapping.ipAddress) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </td>
              <td className="p-4">{mapping.ipAddress}</td>
              <td className="p-4">{Array.from(mapping.domains).join(', ')}</td>
              <td className="p-4">{mapping.vmtas.length}</td>
              <td className="p-4">
                {mapping.vmtas.reduce((sum, vmta) => sum + vmta.conn, 0)}
              </td>
            </tr>
            {expandedIPs.includes(mapping.ipAddress) && (
              <tr>
                <td colSpan={5} className="bg-gray-50 p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-sm text-gray-500">
                        <th className="text-left py-2">VMTA Name</th>
                        <th className="text-left py-2">Recipients</th>
                        <th className="text-left py-2">Data (KB)</th>
                        <th className="text-left py-2">Connections</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mapping.vmtas.map(vmta => (
                        <tr key={vmta.name} className="text-sm">
                          <td className="py-2">{vmta.name}</td>
                          <td className="py-2">{vmta.rcp.toLocaleString()}</td>
                          <td className="py-2">{vmta.kb.toLocaleString()}</td>
                          <td className="py-2">{vmta.conn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}