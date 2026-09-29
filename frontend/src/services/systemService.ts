import { apiClient } from './apiClient';

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  user_count?: number;
  status?: string;
  permissions: string[];
}

export interface PermissionGroup {
  module: string;
  permissions: {
    id: string;
    code: string;
    name: string;
    module: string;
  }[];
}

export interface UserItem {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone_number?: string;
  status: 'ACTIVE' | 'LOCKED' | 'DISABLED';
  roles: { id: string; code: string; name: string }[] | string[];
  permissions?: string[];
  last_login_at?: string;
}

export interface SystemSettings {
  system_name: string;
  managing_unit: string;
  default_language: string;
  timezone: string;
  address: string;
  date_format: string;
  support_email: string;
  support_phone: string;
  system_version: string;
  logo_url?: string | null;
  enable_2fa: boolean;
  limit_failed_login: boolean;
  auto_logout_idle: boolean;
  idle_timeout_minutes: number;
  
  // Cấu hình nghiệp vụ (Business Settings)
  min_capital_contribution?: number;
  service_fee_rate?: number;
  profit_share_member_rate?: number;
  profit_share_coop_rate?: number;
}

export const systemService = {
  async getSettings(): Promise<SystemSettings> {
    const res: any = await apiClient.get('/system-settings');
    return res.data || res;
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const res: any = await apiClient.put('/system-settings', data);
    return res.data || res;
  },

  async getRoles(): Promise<Role[]> {
    const res: any = await apiClient.get('/roles');
    return res.data || res;
  },

  async createRole(data: { code: string; name: string; description?: string; permissions?: string[] }): Promise<Role> {
    const res: any = await apiClient.post('/roles', data);
    return res.data || res;
  },

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<any> {
    const res: any = await apiClient.put(`/roles/${roleId}/permissions`, { permissions });
    return res.data || res;
  },

  async getPermissions(): Promise<{ all: string[]; grouped: PermissionGroup[] }> {
    const res: any = await apiClient.get('/permissions');
    return res.data || res;
  },

  async getUsers(): Promise<UserItem[]> {
    const res: any = await apiClient.get('/users');
    const result = res.data || res;
    return Array.isArray(result) ? result : (result.data || []);
  },

  async createUser(data: any): Promise<UserItem> {
    const res: any = await apiClient.post('/users', data);
    return res.data || res;
  },

  async updateUser(id: string, data: any): Promise<UserItem> {
    const res: any = await apiClient.put(`/users/${id}`, data);
    return res.data || res;
  },

  async toggleUserStatus(id: string): Promise<UserItem> {
    const res: any = await apiClient.patch(`/users/${id}/status`);
    return res.data || res;
  },
};
