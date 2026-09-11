export interface Cooperative {
  id: string;
  cooperative_code: string;
  legal_name: string;
  tax_code?: string;
  address?: string;
  phone?: string;
  status: string;
}

export interface TenantContextState {
  activeCooperative: Cooperative | null;
  activeCooperativeId: string | null;
}
