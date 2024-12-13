import { addMinutes, subHours, subDays } from 'date-fns';

export function parseTimeRange(range: string): Date {
  const now = new Date();
  const value = parseInt(range);
  const unit = range.slice(-1);

  switch (unit) {
    case 'h':
      return subHours(now, value);
    case 'd':
      return subDays(now, value);
    default:
      return subHours(now, 1); // Default to 1 hour
  }
}

export function parseTimeWindow(window: string): number {
  const value = parseInt(window);
  const unit = window.slice(-1);

  switch (unit) {
    case 'm':
      return value;
    case 'h':
      return value * 60;
    default:
      return 5; // Default to 5 minutes
  }
}

export function generateTimeWindows(startDate: Date, endDate: Date, windowMinutes: number) {
  const windows = [];
  let currentDate = startDate;

  while (currentDate < endDate) {
    windows.push(new Date(currentDate));
    currentDate = addMinutes(currentDate, windowMinutes);
  }

  return windows;
}

export function formatMetricValue(value: number, key: string, payload: any) {
  if (!payload) return value.toLocaleString();
  
  const sent = payload.sent || 0;
  if (sent === 0) return '0%';

  switch (key) {
    case 'sent':
      return value.toLocaleString();
    case 'delivered':
    case 'bounced':
      return `${((value / sent) * 100).toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
}