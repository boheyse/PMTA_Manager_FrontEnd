import React from 'react';
import { Info, ChevronDown, Calendar } from 'lucide-react';
import { StatCard } from './StatCard';
import { Select } from './Select';

export function StatsOverview() {
  const domains = ['All Domains', 'example.com', 'test.com'];
  const ipAddresses = ['All IP Addresses', '192.168.1.1', '10.0.0.1'];
  const statuses = ['Delivered', 'In Queue'];
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Stats Overview</h2>
        <div className="flex space-x-4">
          <Select options={domains} defaultValue="All Domains" />
          <Select options={ipAddresses} defaultValue="All IP Addresses" />
          <button className="flex items-center space-x-2 px-3 py-1.5 border rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>Last 7 days</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <Select options={statuses} defaultValue="Delivered" />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Delivered"
          value="100.0%"
          info="Percentage of successfully delivered emails"
        />
        <StatCard
          title="Unique Open Rate"
          value="0.0%"
          info="Percentage of unique email opens"
          highlight
        />
        <StatCard
          title="Click Rate"
          value="0.0%"
          info="Percentage of clicked emails"
        />
        <StatCard
          title="Bounce Rate"
          value="0.0%"
          info="Percentage of bounced emails"
        />
        <StatCard
          title="Spam Complaints"
          value="0.0%"
          info="Percentage of spam complaints"
        />
      </div>
    </div>
  );
}