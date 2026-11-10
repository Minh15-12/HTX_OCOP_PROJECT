import { apiClient } from './apiClient';

export interface DashboardMetrics {
  totalMembers: number;
  totalFarmPlots: number;
  totalActiveSeasons: number;
  totalOcopProducts: number;
  totalInventoryValue: number;
  totalMonthlyRevenue: number;
  totalCashBalance: number;
  totalReceivables: number;
  totalHarvestKg: number;
  totalPlotAreaHa: number;
  totalCapitalContribution: number;
  ocopStatusCounts: Record<string, number>;
  members?: {
    total_members: number;
    total_capital_contribution: number;
  };
  finance?: {
    total_income: number;
    total_expense: number;
    net_balance: number;
    total_receivables: number;
    total_payables: number;
  };
  agriculture?: {
    total_plots: number;
    total_area_ha: number;
    active_crop_seasons: number;
    total_harvests: number;
    total_harvest_kg: number;
  };
  inventory?: {
    total_inventory_value: number;
    total_materials: number;
    total_warehouses: number;
  };
  products?: {
    total_products: number;
  };
  ocopApplications?: {
    total_applications: number;
    status_breakdown: Record<string, number>;
  };
}

export interface OcopAnalyticsData {
  cooperative_name: string;
  summary_metrics: {
    total_products: number;
    total_applications: number;
    certified_count: number;
    submitted_count: number;
    self_evaluating_count: number;
    draft_count: number;
    total_revenue: number;
  };
  star_distribution: Array<{
    star: string;
    label: string;
    count: number;
    color: string;
  }>;
  radar_pillars: Array<{
    subject: string;
    score: number;
    maxScore: number;
    fullMark: number;
    percent: number;
  }>;
  gap_analysis: Array<{
    indicator_code: string;
    name: string;
    max_score: number;
    avg_score: number;
    gap: number;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendation: string;
  }>;
  certification_lifecycle: {
    active_count: number;
    expiring_soon_count: number;
    expired_count: number;
    validity_period_months: number;
    decisions: Array<{
      id: string;
      application_id: string;
      decision_number: string;
      product_name: string;
      final_classification: string;
      star_rating: number;
      effective_date: string;
      expiration_date: string;
      days_left: number;
      validity_status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
    }>;
  };
  generated_at: string;
}

export const reportApi = {
  async getOcopAnalytics(): Promise<OcopAnalyticsData> {
    const res = await apiClient.get<any>('/reports/ocop-analytics');
    return res.data?.data || res.data || res;
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await apiClient.get<any>('/reports/dashboard');
    const data = res.data?.data || res.data || {};
    return {
      totalMembers: Number(data.members?.total_members ?? data.total_members ?? data.totalMembers ?? 0),
      totalFarmPlots: Number(data.agriculture?.total_plots ?? data.total_farm_plots ?? data.totalFarmPlots ?? 0),
      totalActiveSeasons: Number(data.agriculture?.active_crop_seasons ?? data.total_active_seasons ?? data.totalActiveSeasons ?? 0),
      totalOcopProducts: Number(data.products?.total_products ?? data.total_ocop_products ?? data.totalOcopProducts ?? 0),
      totalInventoryValue: Number(data.inventory?.total_inventory_value ?? data.total_inventory_value ?? data.totalInventoryValue ?? 0),
      totalMonthlyRevenue: Number(data.finance?.total_income ?? data.total_monthly_revenue ?? data.totalMonthlyRevenue ?? 0),
      totalCashBalance: Number(data.finance?.net_balance ?? data.total_cash_balance ?? 0),
      totalReceivables: Number(data.finance?.total_receivables ?? data.total_receivables ?? 0),
      totalHarvestKg: Number(data.agriculture?.total_harvest_kg ?? data.total_harvest_kg ?? 0),
      totalPlotAreaHa: Number(data.agriculture?.total_area_ha ?? data.total_area_ha ?? 0),
      totalCapitalContribution: Number(data.members?.total_capital_contribution ?? data.total_capital_contribution ?? 0),
      ocopStatusCounts: data.ocop_applications?.status_breakdown ?? data.ocop_status_counts ?? data.ocopStatusCounts ?? {},
      members: data.members,
      finance: data.finance,
      agriculture: data.agriculture,
      inventory: data.inventory,
      products: data.products,
      ocopApplications: data.ocop_applications,
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

  async exportMembersExcel(): Promise<void> {
    const response = await apiClient.get('/reports/export/members', {
      responseType: 'blob',
    });
    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh_ba_xa_vien_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async exportCashBookExcel(): Promise<void> {
    const response = await apiClient.get('/reports/export/cash-book', {
      responseType: 'blob',
    });
    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `so_quy_tien_mat_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async exportReceivablesPayablesExcel(): Promise<void> {
    const response = await apiClient.get('/reports/export/receivables-payables', {
      responseType: 'blob',
    });
    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `so_theo_doi_cong_no_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async exportInventoryStockExcel(): Promise<void> {
    const response = await apiClient.get('/reports/export/inventory-stock', {
      responseType: 'blob',
    });
    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ton_kho_vat_tu_fefo_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async exportFarmingLogsExcel(): Promise<void> {
    const response = await apiClient.get('/reports/export/farming-logs', {
      responseType: 'blob',
    });
    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nhat_ky_canh_tac_vietgap_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

