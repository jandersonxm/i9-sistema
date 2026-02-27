export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  created_at: string;
}

export interface Service {
  id: string;
  client_id: string;
  date: string;
  type: string;
  value: number;
  defect: string;
  equipment: string;
  model: string;
  solution: string;
  photos?: string[];
  created_at: string;
}

export type ViewType = 'dashboard' | 'clients' | 'reports' | 'calculator' | 'settings';

export interface CompanySettings {
  id: string;
  company_name: string;
  phone: string;
  logo_url: string | null;
  user_id: string;
}
