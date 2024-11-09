import React from 'react';
import { IPAddressCompare } from '../components/IPAddressCompare';

export function IPAddressesPage() {
  return (
    <div className="h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">IP Address Comparison</h1>
        <p className="text-gray-600">Compare two lists of IP addresses to see the differences</p>
      </div>
      
      <div className="h-[calc(100vh-140px)]">
        <IPAddressCompare />
      </div>
    </div>
  );
} 