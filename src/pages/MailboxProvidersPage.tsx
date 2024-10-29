import React, { useState } from 'react';
import { Info, Search } from 'lucide-react';
import { SearchableSelect } from '../components/SearchableSelect';

export function MailboxProvidersPage() {
  const [view, setView] = useState<'table' | 'charts' | 'timeline'>('table');
  const [colorCoding, setColorCoding] = useState(true);

  const domains = ['All Domains', 'example.com', 'test.com'];
  const ipAddresses = ['All IP Addresses', '192.168.1.1', '10.0.0.1'];
  const providers = ['All Mailbox Providers', 'Gmail', 'Yahoo', 'Outlook'];
  const categories = ['All Categories', 'Primary', 'Social', 'Promotions'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Mailbox Providers Overview</h1>
        <div className="flex items-center space-x-2">
          <span>2024-10-21 - 2024-10-28</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <SearchableSelect options={domains} placeholder="All Domains" />
        <SearchableSelect options={ipAddresses} placeholder="All IP Addresses" />
        <SearchableSelect options={providers} placeholder="All Mailbox Providers" />
        <SearchableSelect options={categories} placeholder="All Categories" />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <button className="text-blue-600 font-medium">Clear Filters</button>
      </div>

      <div className="flex items-center space-x-6 mb-6 border-b">
        <button
          className={`pb-2 px-1 ${
            view === 'table'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setView('table')}
        >
          Table
        </button>
        <button
          className={`pb-2 px-1 ${
            view === 'charts'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setView('charts')}
        >
          Charts
        </button>
        <button
          className={`pb-2 px-1 ${
            view === 'timeline'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setView('timeline')}
        >
          Timeline
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="flex items-center space-x-2">
          <div
            className={`w-10 h-6 rounded-full relative cursor-pointer ${
              colorCoding ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
            onClick={() => setColorCoding(!colorCoding)}
          >
            <div
              className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
                colorCoding ? 'right-1' : 'left-1'
              }`}
            />
          </div>
          <span>Color Coding</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">
                <div className="flex items-center space-x-1">
                  <span>Mailbox Providers</span>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th className="p-4">Delivered</th>
              <th className="p-4">Unique Opens</th>
              <th className="p-4">Unique Open Rate</th>
              <th className="p-4">Clicked</th>
              <th className="p-4">Click Rate</th>
              <th className="p-4">Bounce</th>
              <th className="p-4">Bounce Rate</th>
              <th className="p-4">Spam</th>
              <th className="p-4">Spam Complaints</th>
              <th className="p-4">Click to Open</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4">Gmail</td>
              <td className="p-4 text-center">1</td>
              <td className="p-4 text-center">0</td>
              <td className="p-4 text-center">0.00%</td>
              <td className="p-4 text-center">0</td>
              <td className="p-4 text-center">0.00%</td>
              <td className="p-4 text-center">0</td>
              <td className="p-4 text-center">0.00%</td>
              <td className="p-4 text-center">0</td>
              <td className="p-4 text-center">0.00%</td>
              <td className="p-4 text-center">0.00%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}