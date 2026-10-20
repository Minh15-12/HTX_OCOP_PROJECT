import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Wallet, UserCheck, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskItem } from '@/stores/taskNotificationStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onComplete: (taskId: string, resolutionNote: string) => void;
}

export const QuickActionTaskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  task,
  onComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK'>('BANK');
  const [bankAccount, setBankAccount] = useState('1029384756 - Vietcombank');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      let resolution = '';
      if (task.actionType === 'REFUND_CAPITAL') {
        resolution = `Đã lập Phiếu Chi ${paymentMethod === 'BANK' ? 'chuyển khoản' : 'tiền mặt'} hoàn trả ${task.meta?.amount?.toLocaleString('vi-VN')} ₫ cho xã viên ${task.meta?.memberName}.`;
      } else if (task.actionType === 'APPROVE_MEMBER') {
        resolution = `HĐQT đã phê duyệt chính thức kết nạp xã viên ${task.meta?.memberName} (${task.meta?.memberCode}).`;
      } else {
        resolution = `Đã hoàn thành xử lý nhiệm vụ: ${task.title}.`;
      }

      onComplete(task.id, resolution);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-300 font-bold">
              {task.actionType === 'REFUND_CAPITAL' ? (
                <Wallet className="w-4.5 h-4.5" />
              ) : (
                <UserCheck className="w-4.5 h-4.5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {task.actionType === 'REFUND_CAPITAL'
                  ? 'Thao tác Nhanh: Lập Phiếu Chi Hoàn Tiền Vốn'
                  : 'Thao tác Nhanh: Phê Duyệt Kết Nạp Xã Viên'}
              </h3>
              <p className="text-xs text-emerald-200">Xử lý dứt điểm nhiệm vụ ngay tại Bàn làm việc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Task Summary Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Nhiệm vụ cần xử lý: {task.title}</span>
            </div>
            <p className="text-[11.5px] text-amber-800/90 leading-relaxed pl-5">
              {task.description}
            </p>
          </div>

          {/* Action Form 1: REFUND CAPITAL */}
          {task.actionType === 'REFUND_CAPITAL' && (
            <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Xã viên thụ hưởng</label>
                  <input
                    type="text"
                    disabled
                    value={`${task.meta?.memberName} (${task.meta?.memberCode})`}
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số tiền hoàn trả</label>
                  <input
                    type="text"
                    disabled
                    value={`${task.meta?.amount?.toLocaleString('vi-VN')} ₫`}
                    className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hình thức chi trả</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK')}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'BANK'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Chuyển khoản Ngân hàng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Tiền mặt tại Quỹ HTX</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'BANK' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số tài khoản đích nhận hoàn tiền</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    placeholder="Số tài khoản - Ngân hàng"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi chú phiếu chi (Tùy chọn)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi rõ lý do hoàn tiền theo biên bản từ chối kết nạp số 08/BB-HTX..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Action Form 2: APPROVE MEMBER */}
          {task.actionType === 'APPROVE_MEMBER' && (
            <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Người nộp đơn:</span>
                  <span className="font-extrabold text-emerald-950 text-sm">{task.meta?.memberName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Mã định danh tạm thời:</span>
                  <span className="font-mono font-bold text-slate-800">{task.meta?.memberCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Mức vốn đăng ký góp:</span>
                  <span className="font-mono font-bold text-emerald-800">{task.meta?.amount?.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Trạng thái hồ sơ:</span>
                  <span className="pill-badge pill-amber text-[10px]">Đã qua thẩm tra điều kiện</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nghị quyết phê duyệt của HĐQT</label>
                <input
                  type="text"
                  defaultValue="Nghị quyết HĐQT số 15/NQ-HĐQT-2026 về kết nạp xã viên mới"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11.5px]">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Sau khi phê duyệt, xã viên sẽ được cấp Mã xã viên chính thức và kích hoạt quyền biểu quyết.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {task.actionType === 'REFUND_CAPITAL'
              ? 'Xác nhận Lập Phiếu Chi & Đóng Việc'
              : 'Phê duyệt Chính thức & Đóng Việc'}
          </Button>
        </div>
      </div>
    </div>
  );
};
