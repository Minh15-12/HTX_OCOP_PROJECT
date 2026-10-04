import { apiClient } from './apiClient';

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  userName?: string;
  cooperativeId?: string;
  beforePayload?: any;
  afterPayload?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  hashSha256?: string;
}

export const mapApiAuditLogToFrontend = (item: any): AuditLogItem => {
  return {
    id: item.id,
    action: item.action || 'ACTION',
    entityType: item.entity_type || item.entityType || 'ENTITY',
    entityId: item.entity_id || item.entityId || '',
    userId: item.user_id || item.userId || '',
    userName: item.user_name || item.userName || 'Hệ thống / Admin',
    cooperativeId: item.cooperative_id,
    beforePayload: item.before_payload || item.beforePayload,
    afterPayload: item.after_payload || item.afterPayload,
    ipAddress: item.ip_address || item.ipAddress || '127.0.0.1',
    userAgent: item.user_agent || item.userAgent || '',
    createdAt: item.created_at ? String(item.created_at).replace('T', ' ').slice(0, 19) : new Date().toISOString(),
    hashSha256: item.hash_sha256 || item.hashSha256 || '',
  };
};

export const auditApi = {
  async getAuditLogs(params?: { action?: string; entity_type?: string }): Promise<AuditLogItem[]> {
    const res = await apiClient.get<any>('/audit-logs', { params });
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return data.map(mapApiAuditLogToFrontend);
  },

  async getAuditLogDetail(id: string): Promise<AuditLogItem> {
    const res = await apiClient.get<any>(`/audit-logs/${id}`);
    return mapApiAuditLogToFrontend(res.data?.data || res.data || res);
  },

  async traceOcopApplication(applicationId: string): Promise<AuditLogItem[]> {
    const res = await apiClient.get<any>(`/audit-logs/trace/ocop/${applicationId}`);
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return data.map(mapApiAuditLogToFrontend);
  },
};
