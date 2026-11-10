import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Member } from '@/types/memberTypes';
import { DataFieldRow } from '../common/DataFieldRow';
import { AlertTriangle, ShieldCheck, ArrowUpRight, DollarSign, PieChart } from 'lucide-react';

interface MemberTabFinanceDebtProps {
  member: Member;
}

export const MemberTabFinanceDebt: React.FC<MemberTabFinanceDebtProps> = ({ member }) => {
  const navigate = useNavigate();
  const creditLimit = member.credit_limit ?? 0;
  const isOverLimit = creditLimit > 0 && member.current_debt > creditLimit;
  const debtUsagePercent =
    creditLimit > 0
      ? Math.min(100, Math.round((member.current_debt / creditLimit) * 100))
      : 0;

  return (
    <div className="space-y-4">
      {/* CARD 1: TÀI KHOẢN THỤ HƯỞNG & PHÂN CHIA LỢI NHUẬN */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Tài khoản ngân hàng &amp; Phân chia thặng dư</span>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            Tỷ lệ chia: {member.profit_share_rate || member.ownership_percentage || 0}%
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Hình thức chi trả"
            value={member.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Tiền mặt tại quỹ HTX'}
            highlight
          />
          <DataFieldRow
            label="Ngân hàng thụ hưởng"
            value={member.bank_name || '—'}
          />

          <DataFieldRow
            label="Số tài khoản ngân hàng"
            value={member.bank_account || '—'}
            isMono={Boolean(member.bank_account)}
            highlight={Boolean(member.bank_account)}
          />
          <DataFieldRow
            label="Tên chủ tài khoản"
            value={member.account_holder || member.full_name}
          />

          <div className="md:col-span-2">
            <DataFieldRow
              label="Tỷ lệ chia thặng dư theo vốn"
              value={`${member.profit_share_rate || member.ownership_percentage || 0}%`}
              subtitle="Căn cứ Điều 62 Luật Hợp tác xã 2023: Chia theo vốn góp và mức độ sử dụng dịch vụ nội bộ"
            />
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Kế hoạch trích lập quỹ &amp; phân chia thặng dư HTX</span>
          <button
            type="button"
            onClick={() => navigate('/profit-distribution')}
            className="px-2.5 py-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <PieChart className="w-3.5 h-3.5" />
            Phân phối lợi nhuận <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CARD 2: CÔNG NỢ VẬT TƯ & HẠN MỨC ỨNG TRƯỚC */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Công nợ vật tư đầu vụ &amp; Hạn mức ứng trước</span>
          {isOverLimit ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" /> Vượt hạn mức nợ
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Trong hạn mức an toàn
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Hạn mức ứng nợ vật tư tối đa"
            value={`${(member.credit_limit ?? 0).toLocaleString('vi-VN')} ₫`}
            subtitle="Định mức quy chế: 15.000.000 ₫/ha (Ban Giám đốc có thể ghi đè)"
            isMono
          />
          <DataFieldRow
            label="Dư nợ vật tư hiện tại"
            value={
              member.current_debt > 0
                ? `${member.current_debt.toLocaleString('vi-VN')} ₫`
                : '0 ₫ (Không có nợ)'
            }
            isMono
            highlight={member.current_debt > 0}
          />

          <DataFieldRow
            label="Tỷ lệ nợ / Hạn mức"
            value={`${debtUsagePercent}%`}
            subtitle="Thủ kho sẽ chặn xuất kho ứng vật tư nếu vượt 100%"
          />
          <DataFieldRow
            label="Hình thức thanh toán công nợ"
            value="Cấn trừ tự động vào sản lượng thu mua"
          />
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11.5px] text-slate-600 leading-relaxed">
          <strong>Quy tắc BR-FIN-002:</strong> Khi HTX thu mua nông sản theo biên bản KCS, hệ thống tự động cấn trừ công nợ vật tư phân bón, thuốc BVTV đầu vụ trước khi chi trả tiền mặt cho xã viên.
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Tra cứu chi tiết hóa đơn &amp; sổ theo dõi công nợ</span>
          <button
            type="button"
            onClick={() => navigate(`/finance?tab=receivables&search=${member.member_code}`)}
            className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Sổ công nợ tài chính <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
