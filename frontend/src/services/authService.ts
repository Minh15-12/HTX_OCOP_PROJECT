import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const authService = {
  async changePassword(payload: ChangePasswordPayload): Promise<boolean> {
    await apiClient.post('/auth/change-password', payload);
    return true;
  },

  async getMe(): Promise<any> {
    const res: any = await apiClient.get('/auth/me');
    return res.data?.data || res.data || res;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.clearAll();
    }
  },
};
