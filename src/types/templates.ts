export interface ISPSetting {
  key: string;
  value: string;
}

export interface ISPConfig {
  name: string;
  settings: ISPSetting[];
}

export interface Template {
  id: string;
  name: string;
  screen_name: string;
  content: string;
  description: string;
  json_data: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PoolTypeConfig {
  pool_type: string;
  isps: ISPConfig[];
  template?: Template;
}

export interface TemplatesResponse {
  templates: Template[];
  success?: boolean;
}