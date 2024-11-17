export interface QueueInfo {
  domainKey: string;
  domainKeyPath: string;
  domainName: string;
  ipAddress: string;
  host: string;
  subDomain: string;
  queueName: string;
  queueType: string;
}

export interface Setting {
  data: string[] | null;
  key: string;
  type: string;
  value: string;
}

export interface Section {
  content?: Setting[] | null;
  index: number;
  key?: string | null;
  type: string;
  value?: string | null;
}

export interface QueueData {
  info: QueueInfo[];
  sections: Section[];
}

export interface QueuePool {
  fileName: string;
  poolName: string;
  poolType: string | "";
  queues: QueueData[];
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