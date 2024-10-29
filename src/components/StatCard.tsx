import React from 'react';
import { Info } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  info: string;
  highlight?: boolean;
}

export function StatCard({ title, value, info, highlight }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{title}</span>
        <Info className="w-4 h-4 text-gray-400" title={info} />
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}