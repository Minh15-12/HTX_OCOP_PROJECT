import React from 'react';
import type { HarvestItem } from '@/types/agriculture';
import { DataFieldRow } from '@/components/common/DataFieldRow';
import { QrCodeSvg } from '../../QrCodeSvg';
import { QrCode, ExternalLink, ShieldCheck, Box, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HarvestTabTraceabilityProps {
  harvest: HarvestItem;
}

export const HarvestTabTraceability: React.FC<HarvestTabTraceabilityProps> = ({ harvest }) => {
  const navigate = useNavigate();
  const lotCode = harvest.lot_code || harvest.harvest_code;
  const publicUrl = `${window.location.origin}/trace/${lotCode}`;

  return (
    <div className="space-y-4">
      {/* CARD 1: QR CODE PREVIEW & PUBLIC PORTAL */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-emerald-600" />
            Mã QR Truy Xuất Nguồn Gốc Công Khai
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            GS1 Traceability Standard
          </span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
            <QrCodeSvg value={publicUrl} size={130} />
          </div>

          <div className="space-y-2 text-xs text-slate-600 min-w-0 flex-1">
            <div className="font-mono text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 truncate">
              {lotCode}
            </div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              Mã QR này được in lên bao bì tem nhãn OCOP để người tiêu dùng và cơ quan chức năng quét tra cứu nhật ký phân bón, thuốc BVTV sinh học, và chứng nhận chất lượng.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => window.open(`/trace/${lotCode}`, '_blank')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Mở Cổng Tra Cứu Công Khai
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: CẤU TRÚC MÃ LÔ GS1 QUỐC TẾ */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100">
          Cấu trúc định danh GS1 (Application Identifiers)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Mã định danh sản phẩm (AI 01 - GTIN)"
            value={harvest.gtin || (harvest as any).product_gtin || 'Chưa đăng ký mã GTIN'}
            isMono
            highlight
          />
          <DataFieldRow
            label="Số hiệu lô hàng (AI 10 - Batch/Lot)"
            value={lotCode}
            isMono
            highlight
          />
          <DataFieldRow
            label="Ngày thu hoạch (AI 11 - Prod Date)"
            value={harvest.harvest_date ? harvest.harvest_date.replace(/-/g, '').slice(2) : '-'}
            isMono
          />
          <DataFieldRow
            label="Mã vùng trồng cấp phép (PUC)"
            value={harvest.puc_code || (harvest as any).production_unit_code || 'Vùng sản xuất tập trung HTX'}
            isMono
          />
        </div>
      </div>

      {/* CARD 3: ĐÓNG GÓI & BẢO QUẢN */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Box className="w-4 h-4 text-blue-600" />
            Quy cách đóng gói & Chuỗi cung ứng lạnh
          </span>
          <span className="text-xs font-bold text-slate-600">Cold Chain 10-12°C</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Quy cách bao bì hoàn thiện"
            value="Thùng carton 5 lớp (5.0 kg tịnh), lót màng xốp PE"
          />
          <DataFieldRow
            label="Nhiệt độ bảo quản khuyến nghị"
            value="10°C – 12°C (Độ ẩm 90% – 95%)"
          />
          <DataFieldRow
            label="Hạn sử dụng khuyến nghị"
            value="21 ngày kể từ ngày đóng gói hoàn thiện"
          />
          <DataFieldRow
            label="Tiêu chuẩn phân hạng OCOP"
            value="OCOP 4 sao tỉnh Lâm Đồng (Hạng A)"
            highlight
          />
        </div>
      </div>
    </div>
  );
};
