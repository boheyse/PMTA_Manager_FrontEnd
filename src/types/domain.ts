export type QueueStatus = 'Active' | 'Paused' | 'Stopped';
export type ISPTarget = 'Gmail' | 'Yahoo/AOL' | 'Hotmail';
export type QueueType = 'Fresh' | 'Engaged';

export interface Queue {
  name: string;
  ispTarget: ISPTarget;
  type: QueueType;
  speed: number;
  messageCount: number;
  status: QueueStatus;
}

export interface Subdomain {
  name: string;
  ipAddress: string;
  queueStatus: QueueStatus;
  queueName: string;
  queues: Queue[];
  recipientDomains: {
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
  queue: string;
  subdomains: Subdomain[];
  healthStatus: 'healthy' | 'warning' | 'error';
  ispStatus: {
    [key in ISPTarget]: QueueStatus;
  };
} 