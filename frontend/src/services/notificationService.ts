import { apiClient } from './apiClient';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  unread_count: number;
  total: number;
}

export const notificationService = {
  async getNotifications(limit: number = 20): Promise<NotificationListResponse> {
    const res: any = await apiClient.get('/notifications', { params: { limit } });
    const rawItems = res.data?.data || res.data || [];
    const meta = res.meta || res.data?.meta || {};

    const items: AppNotification[] = (Array.isArray(rawItems) ? rawItems : []).map((item: any) => ({
      id: item.id,
      type: item.type || 'info',
      title: item.title || item.data?.title || 'Thông báo hệ thống',
      message: item.message || item.data?.message || '',
      read: Boolean(item.read ?? item.read_at),
      read_at: item.read_at || null,
      created_at: item.created_at || new Date().toISOString(),
    }));

    return {
      data: items,
      unread_count: Number(meta.unread_count ?? items.filter((i) => !i.read).length),
      total: Number(meta.total ?? items.length),
    };
  },

  async markAsRead(id: string): Promise<boolean> {
    await apiClient.post(`/notifications/${id}/mark-as-read`);
    return true;
  },

  async markAllAsRead(): Promise<boolean> {
    await apiClient.post('/notifications/mark-all-read');
    return true;
  },
};
