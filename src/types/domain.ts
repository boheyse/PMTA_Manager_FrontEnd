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