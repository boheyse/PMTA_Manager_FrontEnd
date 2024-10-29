import React, { useState } from 'react';
import { SearchableSelect } from '../components/SearchableSelect';
import { Calendar, Info } from 'lucide-react';

export function EmailLogsPage() {
  const providers = ['Not Delivered', 'Spam', 'Google', 'Google Workspace', 'Outlook', 'Office 365', 'Yahoo'];
  const filterTypes = ['Email to', 'Contains'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold">Email Logs</h1>
          <div className="flex space-x-1">
            {providers.map((provider) => (
              <button
                key={provider}
                className="px-3 py-1 text-sm rounded-full hover:bg-gray-100 text-gray-600"
              >
                {provider}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total messages sent: </span>
            <span className="font-medium">1/1.0K</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <button className="flex items-center space-x-2 px-3 py-1 border rounded text-sm">
            <Calendar className="w-4 h-4" />
            <span>2024-10-21 - 2024-10-28</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <SearchableSelect 
          options={filterTypes}
          placeholder="Email to"
          className="w-48"
        />
        <SearchableSelect 
          options={filterTypes}
          placeholder="Contains"
          className="w-48"
        />
        <input
          type="text"
          placeholder="john.doe@example.com"
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Search
        </button>
        <button className="text-blue-500 hover:underline">
          Reset Filters
        </button>
        <div className="flex-1"></div>
        <button className="px-4 py-2 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50">
          Add Filter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Sent at</th>
              <th className="text-left p-4">Opens/Clicks</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Delivered</span>
                </div>
              </td>
              <td className="p-4">
                <div>
                  <div className="font-medium">Your first Mailtrap email - Quick start</div>
                  <div className="text-sm text-gray-500">To: heyseb1@gmail.com</div>
                </div>
              </td>
              <td className="p-4">2024-10-28 13:54 UTC +00:00</td>
              <td className="p-4">0 / 0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 