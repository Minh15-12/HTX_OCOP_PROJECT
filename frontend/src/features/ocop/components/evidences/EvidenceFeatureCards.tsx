import React from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

export const EvidenceFeatureCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bảo mật &amp; Toàn vẹn dữ liệu</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Tất cả tệp minh chứng được mã hóa, lưu trữ an toàn và kiểm tra tính toàn vẹn bằng mã băm
          SHA-256.
        </p>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 font-black text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Cảnh báo sắp hết hạn</span>
        </div>
        <p className="text-[11px] text-slate-500">8 tài liệu sẽ hết hạn trong 30 ngày tới.</p>
        <button className="text-[11px] font-bold text-amber-700 hover:underline">
          Xem chi tiết &rsaquo;
        </button>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 font-black text-sky-900 text-xs">
          <RefreshCw className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Đồng bộ từ Nhật ký nông nghiệp</span>
        </div>
        <p className="text-[11px] text-slate-500">
          1-click đồng bộ dữ liệu chứng nhận từ Mùa vụ &amp; Vùng trồng.
        </p>
        <button className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10.5px] rounded-lg border border-emerald-200">
          Đồng bộ ngay
        </button>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tải mẫu biểu</span>
        </div>
        <p className="text-[11px] text-slate-500">Cung cấp các mẫu biểu chuẩn theo QĐ 148/QĐ-TTg.</p>
        <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] rounded-lg">
          Tải về
        </button>
      </div>
    </div>
  );
};
