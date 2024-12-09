export interface ISPSetting {
  key: string;
  value: string;
}

export interface ISPConfig {
  name: string;
  settings: ISPSetting[];
}

export interface Template {
  name: string;
  json_data: any;
  content: string;
}

export interface PoolTypeConfig {
  pool_type: string;
  isps: ISPConfig[];
  template?: Template; // Store selected template for reference
} 