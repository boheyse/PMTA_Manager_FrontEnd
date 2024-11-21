export interface QueueInfo {
  domainKey: string;
  domainKeyPath: string;
  domainName: string;
  ipAddress: string;
  queueName: string;
  queueType: string;
  sourceHost: string;
}

export interface Section {
  data?: string[];
  key?: string;
  index?: number;
  sections?: Section[];
  type: string;
  value?: string;
}

export interface QueueData {
  info: QueueInfo[];
  sections: Section[];
}

export interface QueuePool {
  fileName: string;
  poolName: string;
  poolType: string | "";
  queues: QueueData;
}

export interface Domain {
  domainName: string;
  queuePools: QueuePool[];
  ipAddresses: string[] | [];
}

export interface DomainResponse {
  domains: Domain[];
}

export interface QueueInfoResponse {
  data: {
    [key: string]: QueueInfo[];
  };
  success: boolean;
}

export interface ConfigFileResponse {
  data: {
    [key: string]: Section[];
  };
  success: boolean;
}