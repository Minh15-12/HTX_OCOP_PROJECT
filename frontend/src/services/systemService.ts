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

const SETTINGS_STORAGE_KEY = 'htx_ocop_system_settings';

const defaultSettings: SystemSettings = {
  system_name: 'Hệ thống Quản lý HTX-OCOP',
  managing_unit: 'Ban Quản trị Hợp tác xã',
  default_language: 'Tiếng Việt',
  timezone: '(GMT+07:00) Asia/Ho_Chi_Minh',
  address: 'Trụ sở Hợp tác xã',
  date_format: 'dd/mm/yyyy',
  support_email: 'hotro@htx-ocop.vn',
  support_phone: '1900 1234',
  system_version: 'v1.0.0',
  logo_url: null,
  enable_2fa: false,
  limit_failed_login: true,
  auto_logout_idle: true,
  idle_timeout_minutes: 30,
};

export const systemService = {
  async getSettings(): Promise<SystemSettings> {
    try {
      const res: any = await apiClient.get('/system-settings');
      const data = res.data || res;
      if (data && data.system_name) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API getSettings warning, fallback to local storage:', e);
    }
    const local = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (local) {
      try {
        return { ...defaultSettings, ...JSON.parse(local) };
      } catch (e) {}
    }
    return defaultSettings;
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    let updated: any = null;
    try {
      const res: any = await apiClient.put('/system-settings', data);
      updated = res.data || res;
    } catch (e) {
      console.warn('API updateSettings warning, fallback to local storage:', e);
    }
    const current = (await this.getSettings()) || defaultSettings;
    const merged: SystemSettings = { ...current, ...data, ...(updated || {}) };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));

    // Dispatch event for real-time UI updates across components (e.g., Sidebar)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('system-settings-updated', { detail: merged }));
    }
    return merged;
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
