import React from 'react';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { X, Pencil, Printer, UserCheck, UserX, AlertTriangle, Users, MapPin, Wallet, Calculator, TrendingUp, FileText, Ban, PauseCircle, PlayCircle } from 'lucide-react';

const MEMBER_TYPE_LABELS: Record<string, string> = {
  CHINH_THUC: 'Chính thức',
  LIEN_KET_GOP_VON: 'Liên kết góp vốn',
  LIEN_KET_KHONG_GOP_VON: 'Liên kết không góp vốn',
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  const parts = dateString.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateString;
};

// Simplified number to words for UI presentation
const numberToVietnameseWords = (amount: number): string => {
  if (!amount || amount === 0) return 'Không đồng';
  // A robust implementation would be here, but for UI we provide a fallback
  if (amount === 50000000) return 'Năm mươi triệu đồng';
  if (amount === 10000000) return 'Mười triệu đồng';
  return `${amount.toLocaleString('vi-VN')} đồng`;
};

interface MemberDrawerProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (m: Member) => void;
  onApprove: (m: Member) => void;
  onReject: (m: Member) => void;
  onPrint: (m: Member) => void;
  onPrintVoucher: (m: Member, tx?: CapitalTransaction) => void;
  onPreviewFile: (url: string, name: string) => void;
  onSuspend?: (m: Member) => void;
  onRestore?: (m: Member) => void;
  onTerminate?: (m: Member) => void;
  transactions: CapitalTransaction[];
}

export const MemberDrawer: React.FC<MemberDrawerProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onPrint,
  onPrintVoucher,
  onPreviewFile,
  onSuspend,
  onRestore,
  onTerminate,
  transactions,
}) => {
  if (!isOpen || !member) return null;

  const memberTransactions = transactions.filter(
    (t) => t.member_id === member.id || t.member_code === member.member_code
  );

  return (
    <div id="member-detail-panel" className="bg-white/95 backdrop-blur-xl border border-[#e7e9ec] rounded-2xl shadow-xl animate-fade-in max-h-[calc(100vh-140px)] flex flex-col overflow-hidden sticky top-16 z-20">
      {/* Fixed Header */}
      <div className="p-5 border-b border-[#e7e9ec] bg-white z-10 flex items-start justify-between shrink-0 shadow-sm relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl translate-x-10 -translate-y-10 pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-xl shadow-md shrink-0">
            {member.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              {member.full_name}
              {member.status === 'ACTIVE' && (
                <span className="pill-badge pill-green text-[10px]">Đang hoạt động</span>
              )}
              {member.status === 'PENDING' && (
                <span className="pill-badge pill-amber text-[10px]">Chờ duyệt</span>
              )}
              {member.status === 'INACTIVE' && (
                <span className="pill-badge pill-slate bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">Đã ngưng hoạt động</span>
              )}
              {member.status === 'REJECTED' && (
                <span className="pill-badge bg-rose-100 text-rose-700 border border-rose-200 text-[10px]">Đã từ chối</span>
              )}
              {member.status === 'SUSPENDED' && (
                <span className="pill-badge bg-orange-100 text-orange-700 border border-orange-200 text-[10px]">Tạm đình chỉ</span>
              )}
              {member.status === 'PENDING_TERMINATION' && (
                <span className="pill-badge bg-purple-100 text-purple-700 border border-purple-200 text-[10px]">Chờ quyết toán</span>
              )}
              {member.status === 'TERMINATED' && (
                <span className="pill-badge bg-slate-200 text-slate-500 border border-slate-300 text-[10px]">Đã chấm dứt</span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1 font-medium">
              Mã: <strong className="text-emerald-700">{member.member_code}</strong> &bull; Tham gia: {formatDate(member.join_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 relative z-10">
          <button
            onClick={() => onPrint(member)}
            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
            title="In hồ sơ xã viên"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(member)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
            title="Chỉnh sửa thông tin"
          >
            <Pencil className="w-4 h-4" />
          </button>
          
          {member.status === 'ACTIVE' && onSuspend && (
            <button
              onClick={() => onSuspend(member)}
              className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100 ml-1"
              title="Tạm đình chỉ"
            >
              <PauseCircle className="w-4 h-4" />
            </button>
          )}
          {member.status === 'SUSPENDED' && onRestore && (
            <button
              onClick={() => onRestore(member)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100 ml-1"
              title="Khôi phục"
            >
              <PlayCircle className="w-4 h-4" />
            </button>
          )}
          {(member.status === 'ACTIVE' || member.status === 'SUSPENDED') && onTerminate && (
            <button
              onClick={() => onTerminate(member)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100 ml-1"
              title="Chấm dứt tư cách"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100 ml-2"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Body Content */}
      <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar bg-slate-50/50">
        
        {/* Approval Notice Banner */}
        {member.status === 'PENDING' && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-[12px] flex items-center justify-between gap-2 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <strong className="text-amber-900 font-black block text-sm">Hồ sơ chưa được phê duyệt</strong>
                <span className="text-amber-700/80 text-[11.5px] font-medium">Cần Chủ tịch/HĐQT phê duyệt để kích hoạt thành viên.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onApprove(member)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" /> Duyệt
              </button>
              <button
                onClick={() => onReject(member)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserX className="w-4 h-4" /> Từ chối
              </button>
            </div>
          </div>
        )}

        {/* Badges Summary Bar */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm text-[11.5px]">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Loại xã viên</span>
            <strong className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{MEMBER_TYPE_LABELS[member.member_type] || member.member_type}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Tỷ lệ sở hữu HTX</span>
            <strong className="text-slate-800 bg-slate-100 px-2 py-1 rounded-md">{member.ownership_percentage}% Vốn</strong>
          </div>
        </div>

        {/* 1. THÔNG TIN CÁ NHÂN */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 text-[12.5px] shadow-sm hover:border-emerald-200 transition-colors">
          <div className="text-[11.5px] uppercase tracking-wider text-emerald-800 font-black flex items-center gap-2 border-b border-slate-100 pb-2">
            <Users className="w-4 h-4 text-emerald-600" /> 1. Thông tin cá nhân
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1">
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Họ và tên:</span>
              <strong className="text-slate-900 text-sm">{member.full_name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Giới tính:</span>
              <span className="font-semibold text-slate-800">{member.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Ngày sinh:</span>
              <span className="font-semibold text-slate-800">{formatDate(member.dob)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Số CCCD:</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1 rounded">{member.cccd || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Ngày cấp:</span>
              <span className="text-slate-700 font-medium">{formatDate(member.cccd_issue_date)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Nơi cấp:</span>
              <span className="text-slate-700 font-medium truncate block" title={member.cccd_issue_place}>{member.cccd_issue_place || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Trình độ học vấn:</span>
              <span className="font-semibold text-slate-800">{member.education_level || 'Chưa xác định'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Nghề nghiệp:</span>
              <span className="font-semibold text-slate-800">{member.occupation || 'Nông dân'}</span>
            </div>
          </div>
        </div>

        {/* 2. THÔNG TIN LIÊN HỆ & ĐỊA CHỈ */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 text-[12.5px] shadow-sm hover:border-emerald-200 transition-colors">
          <div className="text-[11.5px] uppercase tracking-wider text-emerald-800 font-black flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> 2. Thông tin liên hệ &amp; Địa chỉ
          </div>
          <div className="space-y-3 pt-1">
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold mb-0.5">Địa chỉ thường trú:</span>
              <span className="font-medium text-slate-800 leading-relaxed block bg-slate-50 p-2 rounded-lg border border-slate-100">{member.address}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <div>
                <span className="text-slate-400 block text-[10.5px] font-bold">Số điện thoại:</span>
                <strong className="font-mono text-blue-700 text-sm">{member.phone}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px] font-bold">Email:</span>
                <span className="text-slate-700 font-medium truncate block" title={member.email}>{member.email || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px] font-bold">Zalo:</span>
                <span className="text-slate-700 font-medium">{member.zalo || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px] font-bold">Facebook:</span>
                <span className="text-slate-700 font-medium truncate block" title={member.facebook}>{member.facebook || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. THÔNG TIN VỐN GÓP */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 text-[12.5px] shadow-sm hover:border-emerald-200 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-xl translate-x-10 -translate-y-10 pointer-events-none"></div>
          
          <div className="text-[11.5px] uppercase tracking-wider text-emerald-800 font-black flex items-center justify-between border-b border-slate-100 pb-2 relative z-10">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" /> 3. Thông tin vốn góp
            </span>
            {member.capital_status === 'DU_VON' ? (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">Đã góp đủ</span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px] uppercase">Chưa đủ</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1 relative z-10">
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Hình thức góp:</span>
              <span className="font-semibold text-slate-800">{member.capital_form === 'TIEN_MAT' ? 'Tiền mặt' : 'Hiện vật'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Phương thức góp:</span>
              <span className="font-semibold text-slate-800">{member.contribution_method || 'Góp một lần'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Vốn cam kết:</span>
              <strong className="text-slate-900 text-sm">{(member.committed_capital || member.total_capital_contributed)?.toLocaleString('vi-VN')} ₫</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Đã thực góp:</span>
              <strong className="text-emerald-600 text-sm">{(member.contributed_capital || member.total_capital_contributed)?.toLocaleString('vi-VN')} ₫</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Ngày góp vốn:</span>
              <span className="text-slate-700 font-medium">{formatDate(member.contribution_date || member.join_date)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Số cổ phần:</span>
              <strong className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{member.total_shares_held} cổ phần</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10.5px] font-bold">Bằng chữ:</span>
              <span className="italic text-slate-700 font-medium bg-slate-50 p-2 rounded-lg block border border-slate-100">"{member.capital_in_words || numberToVietnameseWords(member.committed_capital || member.total_capital_contributed)}"</span>
            </div>
          </div>
        </div>

        {/* 4. PHÂN CHIA LỢI NHUẬN & NGÂN HÀNG */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 text-[12.5px] shadow-sm hover:border-emerald-200 transition-colors">
          <div className="text-[11.5px] uppercase tracking-wider text-emerald-800 font-black flex items-center gap-2 border-b border-slate-100 pb-2">
            <Calculator className="w-4 h-4 text-emerald-600" /> 4. Phân chia lợi nhuận &amp; Ngân hàng
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1">
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Tỷ lệ chia lợi nhuận:</span>
              <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-sm">{member.profit_share_rate}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10.5px] font-bold">Hình thức nhận:</span>
              <span className="font-semibold text-slate-800">{member.payout_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
            </div>
            {member.bank_account && (
              <div className="col-span-2 space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Ngân hàng:</span>
                  <span className="font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-100">{member.bank_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Số tài khoản:</span>
                  <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">{member.bank_account}</span>
                </div>
                {member.account_holder && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-800 uppercase">{member.account_holder}</span>
                  </div>
                )}
              </div>
            )}
            {member.notes && (
              <div className="col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[10.5px] font-bold mb-1">Ghi chú:</span>
                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-100 text-[11.5px] italic leading-relaxed">{member.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. THỐNG KÊ HOẠT ĐỘNG VÀ CÔNG NỢ (Added based on 33_FINANCE_WORKFLOW) */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/80 rounded-xl space-y-3 text-[12.5px] shadow-sm hover:border-emerald-300 transition-colors">
          <div className="text-[11.5px] uppercase tracking-wider text-emerald-800 font-black flex items-center gap-2 border-b border-slate-200 pb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> 5. Hoạt động &amp; Mùa vụ
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Sản lượng cung ứng (Năm)</span>
              <strong className="text-slate-900 text-lg">{(member.annual_product_output_kg || 0).toLocaleString('vi-VN')} <span className="text-xs text-slate-500">kg</span></strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Công nợ vật tư đầu vụ</span>
              <strong className={member.current_debt > 0 ? 'text-rose-600 text-lg' : 'text-emerald-600 text-lg'}>
                {member.current_debt ? `${member.current_debt.toLocaleString('vi-VN')} ₫` : 'Không có nợ'}
              </strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 italic">
            * Công nợ vật tư sẽ được cấn trừ vào giá trị nông sản khi kết thúc mùa vụ theo quy định (Harvest Settlement).
          </p>
        </div>

        {/* 6. HỒ SƠ & CHỨNG TỪ ĐÍNH KÈM */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 text-[12.5px] shadow-sm hover:border-emerald-200 transition-colors">
          <div className="text-[11.5px] uppercase tracking-wider text-emerald-800 font-black flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> 6. Hồ sơ &amp; Chứng từ
            </div>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">Lưu trữ tệp tin</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* File 1: Giấy đăng ký kết nạp / Chứng từ nộp vốn */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <strong className="text-slate-800 block truncate text-sm">
                    {member.notary_document_url ? 'Giay_Bien_Nhan_Gop_Von.pdf' : `Phieu_Thu_Gop_Von_${member.member_code}.pdf`}
                  </strong>
                  <span className="text-[11px] text-slate-500 block font-medium mt-0.5">Phiếu thu/Chứng từ nộp vốn đợt 1</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onPrintVoucher(member)}
                  className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  title="In/Xem chứng từ kế toán chuẩn theo mẫu docs"
                >
                  <Printer className="w-3.5 h-3.5" /> In chứng từ
                </button>
                <button
                  onClick={() =>
                    onPreviewFile(
                      member.notary_document_url || 'dummy',
                      `Phiếu thu góp vốn ${member.member_code}.pdf`
                    )
                  }
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Xem tệp
                </button>
              </div>
            </div>

            {/* Transaction Receipts attached */}
            {memberTransactions.map((tx) => (
              <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-200 rounded-xl gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <strong className="text-slate-800 block truncate text-sm">{tx.receipt_file_name || `Chung_Tu_${tx.receipt_number || tx.transaction_code}.pdf`}</strong>
                    <span className="text-[11px] text-slate-500 block font-mono mt-0.5">Số: {tx.receipt_number || tx.transaction_code} ({formatDate(tx.contribution_date)})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPrintVoucher(member, tx)}
                    className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                    title="In chứng từ mẫu chuẩn theo quy định"
                  >
                    <Printer className="w-3.5 h-3.5" /> In chứng từ
                  </button>
                  <button
                    onClick={() =>
                      onPreviewFile(
                        tx.receipt_file_url || 'dummy',
                        tx.receipt_file_name || `Chung_Tu_${tx.receipt_number || tx.transaction_code}.pdf`
                      )
                    }
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Xem tệp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
