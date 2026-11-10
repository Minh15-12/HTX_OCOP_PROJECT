import React from 'react';
import { Sprout, Calendar, Printer, ShieldCheck, MapPin, Wheat, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { DashboardMetrics } from '@/services/reportApi';
import { CropSeason } from '@/services/cropSeasonApi';
import { openInteractivePrintWindow } from '@/utils/pdfExportUtils';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { Skeleton } from '@/components/ui/Skeleton';

interface CropVietgapReportTabProps {
  metrics: DashboardMetrics | undefined;
  seasons: CropSeason[];
  isLoading: boolean;
  onExportExcel?: () => void;
  isExportingExcel?: boolean;
}

export const CropVietgapReportTab: React.FC<CropVietgapReportTabProps> = ({
  metrics,
  seasons,
  isLoading,
  onExportExcel,
  isExportingExcel,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const coopName = activeCooperative?.legal_name || 'Hợp tác xã Nông nghiệp';

  const totalAreaHa = metrics?.agriculture?.total_area_ha ?? metrics?.totalPlotAreaHa ?? 0;
  const totalPlots = metrics?.agriculture?.total_plots ?? metrics?.totalFarmPlots ?? 0;
  const activeSeasonsCount = metrics?.agriculture?.active_crop_seasons ?? metrics?.totalActiveSeasons ?? 0;
  const totalHarvestKg = metrics?.agriculture?.total_harvest_kg ?? metrics?.totalHarvestKg ?? 0;

  const handlePrint = () => {
    const tableRows = seasons.map((s, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td style="font-family:monospace; font-weight:bold;">${s.id.slice(0, 8).toUpperCase()}</td>
        <td style="font-weight:bold;">${s.name} (${s.crop})</td>
        <td>${s.start_date || '—'} đến ${s.expected_end_date || '—'}</td>
        <td style="text-align:right;">${(s.plan_information?.target_yield_kg || 0).toLocaleString('vi-VN')} kg</td>
        <td style="text-align:center;"><span style="color:#0f766e; font-weight:bold;">TCVN 11892-1:2017</span></td>
        <td style="text-align:center;">${s.status === 'ACTIVE' ? 'Đang canh tác' : 'Hoàn tất'}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1e293b;">
        <div style="border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #0f766e; font-size: 20px; text-transform: uppercase;">${coopName}</h2>
          <h1 style="margin: 6px 0 0 0; color: #0f172a; font-size: 16px;">BÁO CÁO MÙA VỤ & QUY TRÌNH AN TOÀN VIETGAP</h1>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Tuân thủ TCVN 11892-1:2017 & TCVN 12850:2019 • Ngày trích xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Tổng diện tích canh tác</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f766e;">${totalAreaHa} ha</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Số thửa đất / Lô sản xuất</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${totalPlots} thửa</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Mùa vụ đang sản xuất</div>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb;">${activeSeasonsCount} mùa vụ</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Tổng sản lượng thu hoạch</div>
            <div style="font-size: 18px; font-weight: bold; color: #d97706;">${(totalHarvestKg / 1000).toFixed(1)} tấn</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">STT</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Mã mùa vụ</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Cây trồng / Giống</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Thời gian canh tác</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:right;">Sản lượng dự kiến</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:center;">Tiêu chuẩn an toàn</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:center;">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px;">
          <div style="text-align: center;">
            <strong>CÁN BỘ KỸ THUẬT NÔNG NGHIỆP</strong><br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div style="text-align: center;">
            <strong>PHỤ TRÁCH KCS & TRUY XUẤT</strong><br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div style="text-align: center;">
            <strong>GIÁM ĐỐC HTX</strong><br/><br/><br/>
            (Ký tên và đóng dấu)
          </div>
        </div>
      </div>
    `;

    openInteractivePrintWindow({
      title: `Báo Cáo Mùa Vụ VietGAP - ${coopName}`,
      filename: `bao_cao_mua_vu_vietgap_${new Date().toISOString().slice(0, 10)}.html`,
      contentHtml: html,
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng diện tích vùng trồng</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalAreaHa} <span className="text-xs font-bold text-slate-500">ha</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Khu vực canh tác tập trung HTX
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Số thửa đất số hóa (GIS)</span>
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {totalPlots} <span className="text-xs font-bold text-slate-500">thửa</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Có mã định danh định vị GPS
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Mùa vụ đang sản xuất</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <div className="text-2xl font-black text-blue-700 mt-1">
              {activeSeasonsCount} <span className="text-xs font-bold text-slate-500">vụ</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Kiểm soát nhật ký canh tác điện tử
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sản lượng thu hoạch</span>
            <Wheat className="w-4 h-4 text-amber-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="text-2xl font-black text-amber-700 mt-1">
              {(totalHarvestKg / 1000).toFixed(1)} <span className="text-xs font-bold text-slate-500">tấn</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Lũy kế các đợt thu hoạch đạt chuẩn KCS
          </div>
        </div>
      </div>

      {/* Action Toolbar & Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Kế hoạch Mùa vụ & Kiểm soát Tiêu chuẩn VietGAP
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ mùa vụ tuân thủ thời gian cách ly thuốc BVTV (PHI Guard) và giám sát nhật ký điền dã.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                disabled={isExportingExcel}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                {isExportingExcel ? 'Đang xuất...' : 'Xuất Nhật Ký VietGAP Excel'}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In / Lưu PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Mã mùa vụ</th>
                <th className="py-2.5 px-3">Tên mùa vụ / Cây trồng</th>
                <th className="py-2.5 px-3">Thời gian canh tác</th>
                <th className="py-2.5 px-3 text-right">Sản lượng dự kiến</th>
                <th className="py-2.5 px-3 text-center">Tiêu chuẩn</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">Đang tải kế hoạch mùa vụ...</td>
                </tr>
              ) : seasons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">Chưa có dữ liệu mùa vụ nào.</td>
                </tr>
              ) : (
                seasons.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {s.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {s.name} <span className="text-slate-500 font-normal">({s.crop})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {s.start_date || '—'} đến {s.expected_end_date || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {(s.plan_information?.target_yield_kg || 0).toLocaleString('vi-VN')} kg
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10.5px] border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> VietGAP TCVN
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`pill-badge ${s.status === 'ACTIVE' ? 'pill-green' : 'pill-gray'} text-[10px]`}>
                        {s.status === 'ACTIVE' ? 'Đang canh tác' : 'Đã kết thúc'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
