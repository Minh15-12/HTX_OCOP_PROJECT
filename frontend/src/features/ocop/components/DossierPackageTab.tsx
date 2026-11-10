import React from 'react';
import { FileText, Printer } from 'lucide-react';

interface DossierPackageTabProps {
  productName: string;
  onOpenPrintModal: () => void;
}

export const DossierPackageTab: React.FC<DossierPackageTabProps> = ({
  productName,
  onOpenPrintModal,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b pb-3 border-slate-200">
        <h3 className="font-extrabold text-slate-900 text-sm">
          Bộ hồ sơ OCOP chuẩn hóa - {productName}
        </h3>
        <button
          type="button"
          onClick={onOpenPrintModal}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> In / Xuất Hồ sơ QĐ 148
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={onOpenPrintModal}
          className="p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 rounded-2xl space-y-2 text-xs cursor-pointer transition-all hover:border-emerald-400"
        >
          <FileText className="w-8 h-8 text-emerald-700" />
          <h4 className="font-bold text-slate-900">Biểu số 01: Phiếu đăng ký</h4>
          <p className="text-[11px] text-slate-500">Đăng ký tham gia đánh giá, phân hạng sản phẩm OCOP</p>
          <span className="pill-badge pill-green">&bull; Đã sẵn sàng in</span>
        </div>

        <div
          onClick={onOpenPrintModal}
          className="p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 rounded-2xl space-y-2 text-xs cursor-pointer transition-all hover:border-emerald-400"
        >
          <FileText className="w-8 h-8 text-emerald-700" />
          <h4 className="font-bold text-slate-900">Biểu số 02: Báo cáo tự đánh giá</h4>
          <p className="text-[11px] text-slate-500">Báo cáo 4 phần + 14 minh chứng phụ lục QĐ 148</p>
          <span className="pill-badge pill-green">&bull; Đã sẵn sàng in</span>
        </div>

        <div
          onClick={onOpenPrintModal}
          className="p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 rounded-2xl space-y-2 text-xs cursor-pointer transition-all hover:border-emerald-400"
        >
          <FileText className="w-8 h-8 text-amber-600" />
          <h4 className="font-bold text-slate-900">Biểu số 03: Xác nhận UBND Xã</h4>
          <p className="text-[11px] text-slate-500">Xác nhận 4 nội dung pháp lý và vùng nguyên liệu địa phương</p>
          <span className="pill-badge pill-green">&bull; Đã có xác nhận</span>
        </div>
      </div>
    </div>
  );
};
