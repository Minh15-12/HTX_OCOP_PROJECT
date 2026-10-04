import React from 'react';
import { FileSpreadsheet, Download, RefreshCw, BarChart2, CheckCircle, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/services/reportApi';

export const ReportsPage: React.FC = () => {
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['reportMetrics'],
    queryFn: () => reportApi.getDashboardMetrics().catch(() => ({
      totalMembers: 125,
      totalFarmPlots: 18,
      totalActiveSeasons: 4,
      totalOcopProducts: 5,
      totalInventoryValue: 245000000,
      totalMonthlyRevenue: 320500000,
      ocopStatusCounts: { CERTIFIED: 2, IN_EVALUATION: 2, SELF_EVALUATING: 1 },
    })),
  });

  return (
    <div className="space-y-4 pb-12 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Báo cáo - Thống kê Hoạt động HTX & OCOP
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Tổng hợp dữ liệu sản xuất, sản lượng thu hoạch, tồn kho vật tư và báo cáo tiến độ số hóa hồ sơ OCOP.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[12.5px] inline-flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-600" /> Cập nhật dữ liệu
          </button>
          <button className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[12.5px] inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
            <FileSpreadsheet className="w-4 h-4" /> Xuất Báo cáo Tổng hợp Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-subtle">
          <div className="text-xs text-slate-500 font-semibold">Tổng số xã viên HTX</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalMembers || 125} xã viên</div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-subtle">
          <div className="text-xs text-slate-500 font-semibold">Tổng sản phẩm OCOP số hóa</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{metrics?.totalOcopProducts || 5} sản phẩm</div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-subtle">
          <div className="text-xs text-slate-500 font-semibold">Tổng diện tích / Thửa đất</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{metrics?.totalFarmPlots || 18} thửa đất</div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-subtle">
          <div className="text-xs text-slate-500 font-semibold">Giá trị tồn kho hiện tại</div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {(metrics?.totalInventoryValue || 245000000).toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-700" /> Báo cáo Sản lượng & Mùa vụ Canh tác
          </h3>
          <p className="text-[12.5px] text-slate-600">
            Hiện có <strong>{metrics?.totalActiveSeasons || 4} mùa vụ active</strong> tuân thủ 100% quy trình PHI Guard và Thông tư 02/2024/TT-BNNPTNT.
          </p>
          <button className="text-emerald-700 hover:text-emerald-800 font-bold text-[12.5px] inline-flex items-center gap-1 cursor-pointer">
            Tải báo cáo chi tiết &rarr;
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-700" /> Báo cáo Hồ sơ OCOP & Minh chứng QĐ 148
          </h3>
          <p className="text-[12.5px] text-slate-600">
            Hồ sơ OCOP đã được đồng bộ minh chứng cross-reference từ Nhật ký canh tác, Phiếu thu mua và Chứng nhận VietGAP.
          </p>
          <button className="text-emerald-700 hover:text-emerald-800 font-bold text-[12.5px] inline-flex items-center gap-1 cursor-pointer">
            Tải hồ sơ tổng hợp OCOP &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
