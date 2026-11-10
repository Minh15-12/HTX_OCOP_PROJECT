import React from 'react';
import type { HarvestItem } from '@/types/agriculture';
import { DataFieldRow } from '@/components/common/DataFieldRow';
import { formatNumber } from '@/utils/formatters';
import { DollarSign, Coins, Receipt, ArrowRightLeft } from 'lucide-react';

interface HarvestTabSettlementProps {
  harvest: HarvestItem;
}

const formatMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const HarvestTabSettlement: React.FC<HarvestTabSettlementProps> = ({ harvest }) => {
  const priceGradeA = 65000; // 65,000 ₫/kg
  const priceGradeB = 45000; // 45,000 ₫/kg

  const gradeAQty = Number(harvest.grade_a_kg) || 0;
  const gradeBQty = Number(harvest.grade_b_kg) || 0;

  const valueGradeA = gradeAQty * priceGradeA;
  const valueGradeB = gradeBQty * priceGradeB;
  const totalGrossValue = valueGradeA + valueGradeB;

  return (
    <div className="space-y-4">
      {/* Quick Settlement Summary */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Tổng giá trị bao tiêu dự toán (Tạm tính)</span>
          </div>
          <div className="text-lg font-black font-mono text-emerald-950 mt-1">
            {formatMoney(totalGrossValue)}
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-emerald-800 border border-emerald-300 shadow-2xs">
          Chờ kết chuyển quyết toán
        </span>
      </div>

      {/* CARD 1: CHI TIẾT BẢNG GIÁ THU MUA THEO PHẨM CẤP */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Định giá thu mua theo phẩm cấp KCS
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Tạm tính theo hợp đồng bao tiêu
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Đơn giá Grade A (Thượng hạng)"
            value={formatMoney(priceGradeA)}
            isMono
            highlight
          />
          <DataFieldRow
            label="Thành tiền Grade A"
            value={formatMoney(valueGradeA)}
            isMono
            highlight
          />
          <DataFieldRow
            label="Đơn giá Grade B (Tiêu chuẩn)"
            value={formatMoney(priceGradeB)}
            isMono
          />
          <DataFieldRow
            label="Thành tiền Grade B"
            value={formatMoney(valueGradeB)}
            isMono
          />
          <DataFieldRow
            label="Đơn giá Hàng loại (Reject)"
            value="0 ₫ (Trả về xã viên xử lý)"
            isMono
          />
          <DataFieldRow
            label="Tổng khối lượng thương phẩm"
            value={`${formatNumber(gradeAQty + gradeBQty)} kg`}
            isMono
          />
        </div>
      </div>

      {/* CARD 2: CƠ CHẾ CẤN TRỪ CÔNG NỢ VẬT TƯ */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            Cấn trừ công nợ & Quyết toán xã viên
          </span>
          <span className="text-xs font-bold text-slate-600">Điều lệ HTX</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Theo quy định của Điều lệ Hợp tác xã Nông nghiệp, giá trị sản phẩm thu hoạch từ thửa đất{' '}
            <strong className="text-slate-900">{harvest.plot_code}</strong> sẽ được tự động đưa vào danh sách đối soát quyết toán cuối vụ:
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">1. Giá trị thu hoạch tạm tính:</span>
              <span className="font-mono font-bold text-slate-900">+{formatMoney(totalGrossValue)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">2. Cấn trừ nợ tạm ứng phân bón & thuốc BVTV:</span>
              <span className="font-mono font-bold text-amber-800">Tự động khấu trừ tại phân hệ Tài chính</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-slate-200">
              <span className="text-slate-700 font-bold">3. Thực nhận của xã viên:</span>
              <span className="font-mono font-black text-emerald-700">Chi trả qua Chuyển khoản ngân hàng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
