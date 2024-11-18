import React from 'react';
import { Calendar } from 'lucide-react';
import { Form } from 'react-bootstrap';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangeSelector({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangeSelectorProps) {
  return (
    <div className="flex items-center space-x-2 border rounded-lg p-2 bg-white">
      <Calendar className="w-4 h-4 text-gray-500" />
      <Form.Control
        type="datetime-local"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="border-0 p-0 text-sm"
      />
      <span className="text-gray-500">to</span>
      <Form.Control
        type="datetime-local"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="border-0 p-0 text-sm"
      />
    </div>
  );
}