import React from 'react';
import { Users, Sprout, MapPin, Receipt, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { StockReceipt } from '@/types/inventory';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface StockReceiptTabRecipientProps {
  receipt: StockReceipt;
}

export const StockReceiptTabRecipient: React.FC<StockReceiptTabRecipientProps> = ({ receipt }) => {
  const isOut = receipt.type === 'OUT';
  const hasAllocation = !!(receipt.memberName || receipt.seasonName || receipt.farmPlotName);

  return (
    <div className="space-y-4">
      {/* Allocation Context Header */}
      {isOut ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-blue-900 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-800 shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold text-sm text-blue-950">
              Cơ chế Cấp phát Vật tư & Cấn trừ Công nợ (BR-FIN-003)
            </h4>
            <p className="text-blue-800 leading-relaxed">
              Vật tư xuất cấp phát cho xã viên phục vụ mùa vụ được tự động ghi nhận vào công nợ
              tạm ứng và sẽ được đối trừ tự động khi quyết toán thu hoạch nông sản cuối vụ.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold text-sm text-emerald-950">
              Nhập kho Bổ sung & Kiểm định Nguồn gốc (KCS Cấp 1)
            </h4>
            <p className="text-emerald-800 leading-relaxed">
              Lô vật tư nhập kho bổ sung đã được kiểm tra tem nhãn, hạn sử dụng và danh mục thuốc
              BVTV cho phép theo quy chuẩn OCOP và VietGAP trước khi nhập kho.
            </p>
          </div>
        </div>
      )}

      {/* Target Recipient Details */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          Đối tượng thụ hưởng & Vùng tiếp nhận
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow
            label="Xã viên nhận cấp phát"
            value={
              receipt.memberName ? (
                <span className="font-bold text-slate-900">{receipt.memberName}</span>
              ) : (
                <span className="text-slate-400">Không ghi nhận đích danh xã viên</span>
              )
            }
          />
          <DataFieldRow
            label="Mùa vụ áp dụng"
            value={
              receipt.seasonName ? (
                <span className="font-bold text-emerald-800">{receipt.seasonName}</span>
              ) : (
                <span className="text-slate-400">Xuất kho chung / Chưa gán mùa vụ</span>
              )
            }
          />
          <DataFieldRow
            label="Thửa đất / Nhà màng nhận"
            value={
              receipt.farmPlotName ? (
                <span className="font-mono text-slate-800">{receipt.farmPlotName}</span>
              ) : (
                <span className="text-slate-400">Chưa chỉ định thửa đất</span>
              )
            }
          />
        </div>
      </div>

      {/* Debt Linkage Card */}
      {isOut && (
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            Hồ sơ Kế toán & Công nợ liên kết
          </h4>
          <div className="divide-y divide-slate-200/60 text-xs">
            <DataFieldRow
              label="Tài khoản hạch toán nợ"
              value="TK 1388 (Phải thu khác - Tạm ứng vật tư xã viên)"
              isMono
            />
            <DataFieldRow
              label="Tài khoản hạch toán có"
              value="TK 152 (Nguyên liệu, vật liệu tồn kho)"
              isMono
            />
            <DataFieldRow
              label="Trạng thái cấn trừ"
              value={
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Chờ cấn trừ tại đợt thu hoạch
                </span>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
