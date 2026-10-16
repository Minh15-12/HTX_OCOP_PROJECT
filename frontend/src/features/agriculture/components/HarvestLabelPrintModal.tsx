import React, { useRef } from 'react';
import { X, Printer, QrCode, CheckCircle, ShieldCheck, Award } from 'lucide-react';
import type { HarvestItem } from '@/types/agriculture';
import { QrCodeSvg } from './QrCodeSvg';

interface HarvestLabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  harvest: HarvestItem | null;
}

export const HarvestLabelPrintModal: React.FC<HarvestLabelPrintModalProps> = ({
  isOpen,
  onClose,
  harvest,
}) => {
  const labelRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !harvest) return null;

  const lotCode = harvest.lot_code || `LOT-TT-01-${harvest.harvest_date.replace(/-/g, '')}-01`;
  const qrUrl = `${window.location.origin}/trace/${lotCode}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
      {/* Print styles injected for 100mm x 75mm physical label */}
      <style>{`
        @media print {
          @page {
            size: 100mm 75mm;
            margin: 0;
          }
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          body * {
            visibility: hidden;
          }
          /* Reset transform trên modal cha tránh lệch tọa độ trên Safari/Firefox */
          .animate-scale-up {
            transform: none !important;
            animation: none !important;
          }
          #harvest-label-print-area, #harvest-label-print-area * {
            visibility: visible;
          }
          #harvest-label-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100mm;
            height: 75mm;
            margin: 0;
            padding: 4mm;
            border: 1px solid #000 !important;
            box-shadow: none !important;
            background: #fff !important;
            z-index: 99999;
          }
        }
      `}</style>

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Printer className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                In Tem Nhãn GS1 QR Nông Sản OCOP (100mm × 75mm)
              </h3>
              <p className="text-xs text-slate-300">
                Chuẩn tem dán thùng carton / khay đóng gói HTX Tân Tiến
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div className="text-xs text-slate-500 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>Kích thước tem nhãn: <strong>100mm × 75mm</strong> (Tỷ lệ 4:3)</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Mã QR hợp chuẩn GS1
            </span>
          </div>

          {/* Label Container (100mm x 75mm mockup) */}
          <div className="flex justify-center">
            <div
              id="harvest-label-print-area"
              ref={labelRef}
              className="w-[380px] h-[285px] border-2 border-slate-900 rounded-xl p-3 bg-white text-slate-900 shadow-lg flex flex-col justify-between font-sans select-none"
            >
              {/* Header section */}
              <div className="border-b-2 border-slate-900 pb-1.5 text-center">
                <div className="text-[11px] font-black tracking-wider uppercase text-slate-900">
                  HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN - ĐÀ LẠT
                </div>
                <div className="text-[13px] font-extrabold text-emerald-800 tracking-tight leading-tight mt-0.5">
                  ỚT CHUÔNG SWEET PALERMO ĐỎ ĐÀ LẠT
                </div>
                <div className="flex items-center justify-center gap-2 text-[9px] font-extrabold text-amber-700 mt-0.5">
                  <span>⭐⭐⭐⭐ OCOP 4 SAO</span>
                  <span>•</span>
                  <span>VIETGAP CHUẨN AN TOÀN</span>
                  <span>•</span>
                  <span>MÃ PUC: PUC-49-015-9923</span>
                </div>
              </div>

              {/* Middle Section: QR Code + Details */}
              <div className="grid grid-cols-5 gap-2 items-center py-1">
                {/* QR Code (Col 2) */}
                <div className="col-span-2 flex flex-col items-center justify-center border-r border-slate-200 pr-1.5">
                  <div className="p-1 bg-white border border-slate-900 rounded-md shadow-2xs">
                    <QrCodeSvg value={qrUrl} size={105} />
                  </div>
                  <span className="text-[7.5px] font-mono text-slate-500 mt-1 uppercase text-center font-bold">
                    Quét tra cứu nguồn gốc
                  </span>
                </div>

                {/* Information Table (Col 3) */}
                <div className="col-span-3 space-y-1 text-[10px] pl-0.5">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[8.5px] uppercase">Mã Lô GS1 (Lot Code):</span>
                    <span className="font-mono font-black text-slate-950 text-[10.5px] leading-tight block">
                      {lotCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <div>
                      <span className="text-slate-500 text-[8px] uppercase font-bold block">Ngày thu hoạch:</span>
                      <span className="font-bold text-slate-900 text-[10px]">{harvest.harvest_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[8px] uppercase font-bold block">Hạn sử dụng:</span>
                      <span className="font-bold text-slate-900 text-[10px]">15 ngày (7°C-10°C)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <div>
                      <span className="text-slate-500 text-[8px] uppercase font-bold block">Phân hạng KCS:</span>
                      <span className="font-black text-emerald-800 text-[10.5px]">
                        {harvest.quality_grade === 'GRADE_A' ? 'GRADE A (Thượng hạng)' : 'GRADE B'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[8px] uppercase font-bold block">Độ ngọt Brix:</span>
                      <span className="font-bold text-slate-900 text-[10px]">≥ {harvest.brix_level || 7.5}°</span>
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <span className="text-slate-500 text-[8px] uppercase font-bold block">Thửa đất xuất xứ:</span>
                    <span className="font-bold text-slate-800 text-[9.5px] truncate block">
                      {harvest.plot_code} • {harvest.plot_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Bar */}
              <div className="border-t border-slate-900 pt-1 flex items-center justify-between text-[8px] text-slate-600 font-medium">
                <div>Đóng gói tại: HTX Tân Tiến, Đạ Sar, Lạc Dương, Lâm Đồng</div>
                <div className="font-mono font-bold">Hotline: 0263 382 9988</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="text-xs text-slate-500">
            Link tra cứu công khai: <span className="font-mono text-emerald-700 font-bold">{qrUrl}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Tem Nhãn (Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
