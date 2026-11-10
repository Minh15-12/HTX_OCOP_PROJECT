import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, X, UserX } from 'lucide-react';
import { Member } from '@/types/memberTypes';

export interface TerminationCheckResult {
  zeroDebt: boolean;
  debtAmount: number;
  noPendingHarvests: boolean;
  pendingHarvestCount: number;
  noInternalLoans: boolean;
  internalLoanCount: number;
  capitalRefundPlanned: boolean;
  canTerminate: boolean;
}

interface MemberTerminationCheckModalProps {
  isOpen: boolean;
  member: Member | null;
  result: TerminationCheckResult | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export const MemberTerminationCheckModal: React.FC<MemberTerminationCheckModalProps> = ({
  isOpen,
  member,
  result,
  onClose,
  onConfirm,
  isPending = false,
}) => {
  if (!isOpen || !member || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-700 font-extrabold text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Kiểm Tra 4 Điều Kiện Chấm Dứt Tư Cách</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
          <p className="font-bold text-slate-900">
            Xã viên: {member.full_name} ({member.member_code})
          </p>
          <p>Địa chỉ: {member.address}</p>
          <p>
            Tổng vốn góp:{' '}
            <span className="font-extrabold text-emerald-700">
              {(member.total_capital_contributed || member.contributed_capital || 0)?.toLocaleString('vi-VN')} ₫
            </span>
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <p className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
            Bảng kiểm 4 điều kiện cấn trừ công nợ &amp; nghĩa vụ (Luật HTX 2023):
          </p>

          {/* Check 1 */}
          <div
            className={`p-3 rounded-lg border flex items-start gap-2.5 ${
              result.zeroDebt ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {result.zeroDebt ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-[12.5px]">1. Không còn dư nợ vật tư trả chậm</div>
              <div className="text-[11.5px] opacity-90">
                {result.zeroDebt
                  ? 'Đã tất toán 100% công nợ vật tư.'
                  : `Tồn dư nợ: ${result.debtAmount.toLocaleString('vi-VN')} ₫ (Cần cấn trừ/thu hồi trước khi chấm dứt)`}
              </div>
            </div>
          </div>

          {/* Check 2 */}
          <div
            className={`p-3 rounded-lg border flex items-start gap-2.5 ${
              result.noPendingHarvests ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {result.noPendingHarvests ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-[12.5px]">2. Không còn hợp đồng giao nộp nông sản treo</div>
              <div className="text-[11.5px] opacity-90">
                {result.noPendingHarvests
                  ? 'Tất cả hợp đồng giao nộp sản phẩm đã nghiệm thu.'
                  : `Còn ${result.pendingHarvestCount} hợp đồng chưa thanh lý.`}
              </div>
            </div>
          </div>

          {/* Check 3 */}
          <div
            className={`p-3 rounded-lg border flex items-start gap-2.5 ${
              result.noInternalLoans ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {result.noInternalLoans ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-[12.5px]">3. Không còn khoản vay tín dụng nội bộ</div>
              <div className="text-[11.5px] opacity-90">
                {result.noInternalLoans
                  ? 'Không có khoản vay nội bộ tồn đọng.'
                  : `Còn ${result.internalLoanCount} khoản vay chưa tất toán.`}
              </div>
            </div>
          </div>

          {/* Check 4 */}
          <div
            className={`p-3 rounded-lg border flex items-start gap-2.5 ${
              result.capitalRefundPlanned ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {result.capitalRefundPlanned ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-[12.5px]">4. Phương án hoàn trả vốn góp đã được ghi nhận</div>
              <div className="text-[11.5px] opacity-90">
                {result.capitalRefundPlanned
                  ? 'Đã lập phương án hoàn trả phần vốn góp theo Điều lệ.'
                  : 'Chưa lập phương án hoàn trả vốn.'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={!result.canTerminate || isPending}
            className={`px-4 py-2 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md ${
              result.canTerminate
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <UserX className="w-4 h-4" />
            {isPending ? 'Đang xử lý...' : 'Xác nhận Chấm dứt tư cách (Soft Delete)'}
          </button>
        </div>
      </div>
    </div>
  );
};
