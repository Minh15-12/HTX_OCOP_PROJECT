export interface DashboardData {
  cooperative_id: string | null;
  members: {
    total_members: number;
    total_capital_contribution: number;
  };
  agriculture: {
    total_plots: number;
    total_area_ha: number;
    active_crop_seasons: number;
    total_harvests: number;
  };
  products: {
    total_products: number;
  };
  ocop_applications: {
    total_applications: number;
    status_breakdown: Record<string, number>;
  };
  generated_at: string;
}
