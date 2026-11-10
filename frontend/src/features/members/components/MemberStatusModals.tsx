import React, { useState } from 'react';
import { UserX, UserCheck, XCircle, AlertTriangle } from 'lucide-react';
import { Member, MEMBER_TYPE_LABELS } from '@/types/memberTypes';

interface DeleteMemberModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !member) return null;

  const currentDebt = member.current_debt || 0;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-modal overflow-hidden p-6 space-y-4 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <UserX className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Xác nhận ngưng hoạt động xã viên?</h3>
          <p className="text-[13px] text-slate-600 mt-1">
            Chuyển trạng thái cho xã viên <strong className="text-slate-900">{member.full_name}</strong> (
            <span className="font-mono">{member.member_code}</span>) sang{' '}
            <strong>"Đã ngưng hoạt động / Đã rút khỏi HTX"</strong>.
          </p>
        </div>

        {currentDebt > 0 ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-[12px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> KHÔNG THỂ NGƯNG HOẠT ĐỘNG (DƯ NỢ CÔNG NỢ)
            </div>
            <p className="text-slate-700">
              Xã viên <strong>{member.full_name}</strong> hiện còn dư nợ{' '}
              <strong className="text-red-700 font-extrabold">{currentDebt.toLocaleString('vi-VN')} ₫</strong> tại HTX.
            </p>
            <p className="text-[11px] text-red-700 font-medium italic pt-1 border-t border-red-200/60 mt-1">
              💡 Theo Luật Hợp tác xã 2023, xã viên phải hoàn tất nghĩa vụ tài chính/thu hồi công nợ trước khi chấm dứt tư cách thành viên.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-[12px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">ℹ️ Lưu trữ dữ liệu an toàn (Soft Delete):</p>
            <p>Hệ thống không xóa vĩnh viễn dữ liệu để đảm bảo toàn vẹn chứng từ kế toán &amp; lịch sử vốn góp.</p>
            <p>
              Bạn có thể tra cứu danh sách xã viên đã ngưng hoạt động bất cứ lúc nào trong bộ lọc{' '}
              <strong>"Trạng thái: Đã ngưng hoạt động"</strong>.
            </p>
          </div>
        )}

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 text-[12.8px]"
          >
            Hủy bỏ
          </button>
          {currentDebt > 0 ? (
            <button
              disabled
              className="px-5 py-2 bg-slate-200 text-slate-400 font-bold rounded-lg text-[12.8px] cursor-not-allowed inline-flex items-center gap-1.5"
            >
              <UserX className="w-4 h-4" /> Không thể ngưng (Còn dư nợ)
            </button>
          ) : (
            <button
              onClick={onConfirm}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[12.8px] shadow-sm inline-flex items-center gap-1.5"
            >
              <UserX className="w-4 h-4" /> Xác nhận ngưng hoạt động
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ApproveRejectModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export const ApproveRejectModal: React.FC<ApproveRejectModalProps> = ({
  isOpen,
  member,
  onClose,
  onApprove,
  onReject,
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen || !member) return null;

  const actualContributed = member.contributed_capital || member.total_capital_contributed || 0;

  const handleClose = () => {
    setShowRejectForm(false);
    setRejectReason('');
    onClose();
  };

  const handleConfirmReject = () => {
    onReject(rejectReason);
    setShowRejectForm(false);
    setRejectReason('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-modal overflow-hidden p-6 space-y-4 text-center flex flex-col max-h-[90vh]">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border shrink-0 ${
            showRejectForm ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
          }`}
        >
          {showRejectForm ? <UserX className="w-7 h-7" /> : <UserCheck className="w-7 h-7" />}
        </div>

        <div className="shrink-0">
          <h3 className="text-lg font-extrabold text-slate-900">
            {showRejectForm ? 'Từ chối duyệt kết nạp xã viên' : 'Phê duyệt hồ sơ xã viên mới'}
          </h3>
          <p className="text-[13px] text-slate-600 mt-1">
            Xã viên: <strong className="text-slate-900">{member.full_name}</strong> (
            <span className="font-mono">{member.member_code}</span>)
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-700 text-left space-y-1.5 shrink-0">
          <div className="flex justify-between">
            <span className="text-slate-500">Loại xã viên:</span>{' '}
            <strong>{MEMBER_TYPE_LABELS[member.member_type]}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vốn thực góp đợt 1:</span>{' '}
            <strong className="text-emerald-800">
              {actualContributed.toLocaleString('vi-VN')} ₫
            </strong>{' '}
            ({member.capital_form === 'HIEN_VAT' ? 'Hiện vật' : 'Tiền mặt'})
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vốn cam kết:</span>{' '}
            <span className="font-mono text-slate-900">{member.committed_capital?.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">SĐT liên hệ:</span>{' '}
            <span className="font-mono">{member.phone}</span>
          </div>
        </div>

        {/* CAPITAL REFUND WARNING NOTICE IF CAPITAL WAS CONTRIBUTED */}
        {actualContributed > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11.5px] text-left space-y-1 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800">Lưu ý nghiệp vụ Tài chính HTX:</p>
              <p className="leading-relaxed">
                Xã viên này đã tạm nộp <strong>{actualContributed.toLocaleString('vi-VN')} ₫</strong> vốn góp đợt 1.
                Nếu <strong>Từ chối duyệt</strong>, HTX có nghĩa vụ lập <strong>Phiếu chi hoàn trả khoản tiền/hiện vật tạm thu</strong> này cho người nộp.
              </p>
            </div>
          </div>
        )}

        {!showRejectForm ? (
          <>
            <p className="text-[11.5px] text-slate-500 italic shrink-0">
              Vui lòng lựa chọn quyết định của Hội đồng Quản trị / Chủ tịch HTX:
            </p>

            <div className="pt-2 flex justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-[12.5px] inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserX className="w-4 h-4" /> Từ chối duyệt
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 text-[12.5px]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={onApprove}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[12.5px] shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" /> Đồng ý phê duyệt
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3 text-left animate-fade-in shrink-0">
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[12px]">Lý do từ chối kết nạp *</label>
              <textarea
                rows={2}
                required
                placeholder="Ví dụ: Hồ sơ chứng từ không đủ điều kiện, Không đạt yêu cầu Điều lệ HTX, Người nộp xin rút đơn..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-[12.5px]"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-bold text-[12px]"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[12px] shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Xác nhận từ chối kết nạp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface RefundNoticeModalProps {
  member: Member | null;
  onForwardToAccountant: (member: Member) => void;
  onConfirmRefundPaid: (member: Member) => void;
  onPostpone: (member: Member) => void;
}

export const RefundNoticeModal: React.FC<RefundNoticeModalProps> = ({
  member,
  onForwardToAccountant,
  onConfirmRefundPaid,
  onPostpone,
}) => {
  if (!member) return null;

  const refundAmount = member.contributed_capital || member.total_capital_contributed || 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300">
          <i className="ri-hand-coin-line text-3xl"></i>
        </div>

        <div>
          <span className="pill-badge pill-red text-[11px] mb-1">Đã Từ Chối Kết Nạp</span>
          <h3 className="text-lg font-extrabold text-slate-900 mt-1">Yêu cầu Hoàn trả Vốn Tạm nộp</h3>
          <p className="text-[12.5px] text-slate-600 mt-1">
            Hồ sơ của <strong>{member.full_name}</strong> (<span className="font-mono">{member.member_code}</span>) đã bị từ chối.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-[12.5px] text-left space-y-2">
          <div className="flex justify-between items-center border-b border-amber-200/80 pb-2">
            <span className="text-amber-900 font-medium">Số tiền vốn cần hoàn trả:</span>
            <strong className="text-rose-700 text-base font-mono">
              {refundAmount.toLocaleString('vi-VN')} ₫
            </strong>
          </div>
          <div className="flex justify-between text-xs text-amber-800">
            <span>Hình thức đã nộp:</span>
            <span className="font-bold">
              {member.capital_form === 'HIEN_VAT' ? 'Hiện vật (Trả lại tài sản)' : 'Tiền mặt / Chuyển khoản'}
            </span>
          </div>
          <div className="flex justify-between text-xs text-amber-800">
            <span>SĐT người nộp:</span>
            <span className="font-mono font-bold">{member.phone}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11.5px] text-slate-600 text-left leading-relaxed">
          📌 <strong>Hướng dẫn nghiệp vụ:</strong>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>
              <strong>Nếu là HĐQT/Chủ tịch:</strong> Chọn <em>Chuyển lệnh chi cho Kế toán</em> để giao việc.
            </li>
            <li>
              <strong>Nếu là Kế toán/Thủ quỹ:</strong> Chọn <em>Lập Phiếu Chi &amp; Đã chi tiền</em> nếu đã xuất quỹ hoàn xong.
            </li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onForwardToAccountant(member)}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-2xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Tạo nhắc việc cho Kế toán xuất quỹ (Tiền chưa bị trừ ngay)"
          >
            <i className="ri-send-plane-line text-sm"></i> 📋 Chuyển lệnh chi cho Kế toán
          </button>
          <button
            type="button"
            onClick={() => onConfirmRefundPaid(member)}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-2xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Kế toán/Thủ quỹ xác nhận đã giao tiền cho người nộp và trừ quỹ HTX"
          >
            <i className="ri-money-dollar-circle-line text-sm"></i> 💵 Lập Phiếu Chi &amp; Đã chi tiền
          </button>
          <button
            type="button"
            onClick={() => onPostpone(member)}
            className="w-full sm:w-auto px-3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            ⏳ Để sau (Lưu vào Nhắc việc)
          </button>
        </div>
      </div>
    </div>
  );
};
