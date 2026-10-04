import { apiClient } from './apiClient';

export interface DashboardMetrics {
  totalMembers: number;
  totalFarmPlots: number;
  totalActiveSeasons: number;
  totalOcopProducts: number;
  totalInventoryValue: number;
  totalMonthlyRevenue: number;
  ocopStatusCounts: Record<string, number>;
}

export const reportApi = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await apiClient.get<any>('/reports/dashboard');
    const data = res.data?.data || res.data || {};
    return {
      totalMembers: Number(data.total_members || data.totalMembers || 0),
      totalFarmPlots: Number(data.total_farm_plots || data.totalFarmPlots || 0),
      totalActiveSeasons: Number(data.total_active_seasons || data.totalActiveSeasons || 0),
      totalOcopProducts: Number(data.total_ocop_products || data.totalOcopProducts || 0),
      totalInventoryValue: Number(data.total_inventory_value || data.totalInventoryValue || 0),
      totalMonthlyRevenue: Number(data.total_monthly_revenue || data.totalMonthlyRevenue || 0),
      ocopStatusCounts: data.ocop_status_counts || data.ocopStatusCounts || {},
    };
  },

  async getOcopReadinessReport(applicationId: string): Promise<any> {
    const res = await apiClient.get<any>(`/reports/ocop-readiness/${applicationId}`);
    return res.data?.data || res.data || res;
  },

  async generateOcopDossierDocument(applicationId: string): Promise<{ download_url: string; document_id: string }> {
    const res = await apiClient.post<any>(`/documents/generate/ocop-dossier/${applicationId}`);
    return res.data?.data || res.data || res;
  },

  async generateOcopCertificate(applicationId: string): Promise<{ download_url: string; document_id: string }> {
    const res = await apiClient.post<any>(`/documents/generate/certificate/${applicationId}`);
    return res.data?.data || res.data || res;
  },
};
