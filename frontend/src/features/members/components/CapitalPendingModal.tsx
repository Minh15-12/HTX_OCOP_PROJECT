import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { CapitalTransaction } from '@/types/memberTypes';

interface CapitalPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTransactions: CapitalTransaction[];
  onApprove: (txId: string) => void;
  onReject: (txId: string) => void;
}

export const CapitalPendingModal: React.FC<CapitalPendingModalProps> = ({
  isOpen,
  onClose,
  pendingTransactions,
  onApprove,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full shadow-modal overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[85vh]"
      >
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Giao dịch Góp vốn Chờ Phê duyệt</h3>
              <p className="text-[11.5px] text-slate-300">
                Phê duyệt bút toán nộp tiền mặt, chuyển khoản & ruộng đất đóng góp của xã viên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50/50">
          {pendingTransactions.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="font-extrabold text-slate-900 text-sm">Tất cả giao dịch đã được phê duyệt!</div>
              <p className="text-xs text-slate-500">Hiện không có bút toán nộp vốn nào cần duyệt thêm.</p>
            </div>
          ) : (
            pendingTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-emerald-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{tx.member_name}</span>
                      <span className="font-mono text-xs text-slate-500 font-bold">({tx.member_code})</span>
                      <span className="pill-badge pill-amber text-[10px]">Chờ duyệt</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mã chứng từ: <strong className="font-mono text-slate-800">{tx.transaction_code || tx.receipt_number}</strong> &bull; Ngày nộp: {tx.contribution_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</div>
                    <span className="text-[11px] text-slate-500 font-bold">
                      {tx.payment_method === 'CASH' ? 'Tiền mặt' : tx.payment_method === 'LAND' ? 'Ruộng đất (QSDĐ)' : 'Chuyển khoản'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700 border border-slate-100">
                  <div>Nội dung: <strong>{tx.content}</strong></div>
                  {tx.notes && <div>Ghi chú: <span className="italic text-slate-600">{tx.notes}</span></div>}
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Người tạo: {tx.recorded_by || tx.member_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReject(tx.id)}
                      className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-xs transition-all cursor-pointer"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => onApprove(tx.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Phê duyệt & Cấp Vốn
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-600" /> Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
