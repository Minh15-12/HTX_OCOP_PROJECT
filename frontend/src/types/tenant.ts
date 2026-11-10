export interface Cooperative {
  id: string;
  cooperative_code: string;
  legal_name: string;
  display_name?: string;
  short_name?: string;
  tax_code?: string;
  address?: string;
  phone?: string;
  phone_number?: string;
  contact_phone?: string;
  email?: string;
  representative_name?: string;
  director_name?: string;
  chief_accountant?: string;
  commune?: string;
  legal_information?: Record<string, any>;
  contact_information?: Record<string, any>;
  status: string;
}

export interface TenantContextState {
  activeCooperative: Cooperative | null;
  activeCooperativeId: string | null;
}
