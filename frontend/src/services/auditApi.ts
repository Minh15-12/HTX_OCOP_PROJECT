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

  async traceMember(memberId: string): Promise<{
    member: {
      id: string;
      member_code: string;
      full_name: string;
      citizen_id: string;
      status: string;
      admission_date: string;
      committed_capital: number;
    };
    audit_timeline: Array<{
      id: string;
      action: string;
      entity_type: string;
      entity_id: string;
      actor_id: string;
      before?: Record<string, any>;
      after?: Record<string, any>;
      current_hash: string;
      timestamp: string;
    }>;
  }> {
    const res = await apiClient.get<any>(`/audit-logs/trace/member/${memberId}`);
    return res.data?.data || res.data || res;
  },

  async verifyHashChain(): Promise<HashChainVerificationResult> {
    const res = await apiClient.get<any>('/audit-logs/verify/hash-chain');
    return res.data?.data || res.data || res;
  },
};

export interface HashChainVerificationResult {
  is_valid: boolean;
  integrity_score: number;
  total_blocks_checked: number;
  verified_continuous_blocks: number;
  anomaly_count: number;
  anomalies: Array<{
    event_id: string;
    action: string;
    entity_type: string;
    index: number;
    anomaly_type: string;
    description: string;
    expected: string;
    actual: string;
    timestamp?: string;
  }>;
  latest_block_hash: string;
  algorithm: string;
  verified_at: string;
  compliance_standard: string;
}
