export interface Node {
  id: string;
  name: string;
  host: string;
  status: 'connected' | 'disconnected';
  stats: {
    emailsSent: number;
    emailsDelivered: number;
    emailsBounced: number;
    uniqueOpenRate: number;
    clickRate: number;
    bounceRate: number;
    spamComplaints: number;
  };
}

interface ISPSetting {
  key: string;
  value: string;
}

interface ISPConfig {
  name: string;
  settings: ISPSetting[];
}

export interface PoolType {
  pool_type: string;
  isps: ISPConfig[];
}

export interface DomainVMTA {
  name: string;
  vmta: string[];
}

export interface PMTANode {
  id: number;
  name: string;
  hostname: string;
  description: string;
  setup_complete: boolean;
  ip_addresses: string[];
  domains: DomainVMTA[];
  pool_types: PoolType[];
}