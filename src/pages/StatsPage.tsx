import React from 'react';
import { SearchableSelect } from '../components/SearchableSelect';
import { Select } from '../components/Select';

export function StatsPage() {
  const domains = ['All Domains', 'example.com', 'test.com'];
  const ipAddresses = ['All IP Addresses', '192.168.1.1', '10.0.0.1'];
  const deliveryStatus = ['Delivered', 'In queue'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Stats Overview</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <SearchableSelect options={domains} placeholder="All Domains" />
        <SearchableSelect options={ipAddresses} placeholder="All IP Addresses" />
        <Select 
          options={deliveryStatus} 
          placeholder="Delivered"
          defaultValue="Delivered"
        />
      </div>

      {/* Rest of StatsOverview component content */}
    </div>
  );
}