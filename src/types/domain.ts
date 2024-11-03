export type QueueStatus = 'Active' | 'Paused' | 'Stopped';
export type ISPTarget = 'Gmail' | 'Yahoo/AOL' | 'Hotmail';
export type QueueType = 'Fresh' | 'Engaged' | 'Unthrottled';

export interface Queue {
  name: string;
  ipAddress: string;
  subdomain: string;
  type?: string;
  queueStatus: QueueStatus;
  targetIsps: {
    name: string;
    settings: {
      [key: string]: string;
    };
  }[];
}

export interface Domain {
  domain: string;
  ipAddresses: string[];
  emailsSent: number;
  queueStatus: string;
  queues: Queue[];
  healthStatus: 'healthy' | 'warning' | 'error';
  ispStatus: {
    [key in ISPTarget]: QueueStatus;
  };
} 