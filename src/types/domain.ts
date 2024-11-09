export interface Queue {
  queueName: string;
  ipAddress: string;
  subdomain: string;
  type: string;
}

export interface QueuePool {
  queuePoolName: string;
  type: string;
  queues: Queue[];
}

export interface Domain {
  domainName: string;
  ipAddresses: string[];
  queuePools: QueuePool[];
}

export interface Section {
  content?: Setting[];
  index: number;
  key?: string;
  value?: string;
  type: string;
}

// Type Definitions
export interface Setting {
  key?: string;
  type: string;
  value?: string;
}