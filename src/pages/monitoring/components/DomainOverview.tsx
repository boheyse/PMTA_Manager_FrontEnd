import React from 'react';
import { DomainStatsTable } from '../../../components/monitoring/DomainStatsTable';
import { useDomainStats } from '../../../hooks/useDomainStats';
import type { PMTANode } from '../../../types/node';

interface DomainOverviewProps {
  server: PMTANode;
  timeRange: string;
}

export function DomainOverview({ server, timeRange }: DomainOverviewProps) {
  const { stats, isLoading, error } = useDomainStats({ server, timeRange });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Domain Overview</h2>
      
      <div className="overflow-x-auto relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {error ? (
          <div className="text-red-600 p-4">{error}</div>
        ) : (
          <DomainStatsTable stats={stats} />
        )}
      </div>
    </div>
  );
}