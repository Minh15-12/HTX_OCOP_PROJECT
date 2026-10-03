import React from 'react';
import { BarChart3, Download, FileSpreadsheet, Printer } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Báo cáo - Thống kê Hoạt động HTX & OCOP
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Tổng hợp dữ liệu sản xuất, sản lượng thu hoạch, tồn kho vật tư và báo cáo tiến độ số hóa hồ sơ OCOP.
          </p>
        </div>
        <button className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-[12.5px] inline-flex items-center gap-1.5 shadow-sm">
          <FileSpreadsheet className="w-4 h-4" /> Xuất Báo cáo Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-5 shadow-subtle space-y-3">
          <h3 className="font-extrabold text-slate-900 text-base">Báo cáo Sản lượng Canh tác</h3>
          <p className="text-[12.5px] text-slate-500">Tổng sản lượng thu hoạch đạt 142.5 tấn nông sản các loại trong mùa vụ Đông Xuân.</p>
          <button className="text-emerald-700 hover:text-emerald-800 font-bold text-[12.5px]">Tải báo cáo chi tiết &rarr;</button>
        </div>

        <div className="bg-white border border-[#e7e9ec] rounded-xl p-5 shadow-subtle space-y-3">
          <h3 className="font-extrabold text-slate-900 text-base">Báo cáo Hồ sơ OCOP & Tiêu chí</h3>
          <p className="text-[12.5px] text-slate-500">Đã hoàn thành 85% tổng số tiêu chí OCOP đợt đánh giá 2026.</p>
          <button className="text-emerald-700 hover:text-emerald-800 font-bold text-[12.5px]">Tải báo cáo OCOP &rarr;</button>
        </div>
      </div>
    </div>
  );
};
