import React from 'react';
import { Form } from 'react-bootstrap';
import { TIME_RANGES, TIME_WINDOWS } from '../../constants/monitoring';

interface TimeRangeSelectorProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  timeWindow: string;
  onTimeWindowChange: (window: string) => void;
}

export function TimeRangeSelector({ 
  timeRange, 
  onTimeRangeChange,
  timeWindow,
  onTimeWindowChange 
}: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Time Range:</span>
        <Form.Select 
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="w-40"
          size="sm"
        >
          {TIME_RANGES.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Group by:</span>
        <Form.Select
          value={timeWindow}
          onChange={(e) => onTimeWindowChange(e.target.value)}
          className="w-40"
          size="sm"
        >
          {TIME_WINDOWS.map(window => (
            <option key={window.value} value={window.value}>
              {window.label}
            </option>
          ))}
        </Form.Select>
      </div>
    </div>
  );
}