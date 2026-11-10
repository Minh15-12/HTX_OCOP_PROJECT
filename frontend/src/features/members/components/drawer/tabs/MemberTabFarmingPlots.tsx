import React, { useState } from 'react';
import { Member } from '@/types/memberTypes';
import { formatDate } from '@/utils/formatters';
import {
  FileText,
  Eye,
  CheckCircle2,
  History,
  Upload,
  ShieldCheck,
  Award,
  FileCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/services/auditApi';
import { useToast } from '@/components/ui/ToastNotification';

interface MemberTabFarmingPlotsProps {
  member: Member;
  onPrintVoucher?: (m: Member) => void;
  onPreviewFile?: (url: string, name: string) => void;
  onPrintCertificate?: (m: Member) => void;
  onPrintProfile?: (m: Member) => void;
}

export const MemberTabFarmingPlots: React.FC<MemberTabFarmingPlotsProps> = ({
  member,
  onPrintProfile,
  onPrintCertificate,
}) => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Truy vết chuỗi sự kiện kiểm toán vòng đời xã viên từ Backend API
  const { data: traceData } = useQuery({
    queryKey: ['memberAuditTrace', member.id],
    queryFn: () => auditApi.traceMember(member.id),
    enabled: Boolean(member.id),
  });

  const timeline = traceData?.audit_timeline || [];

  const formatTimelineLabel = (action: string) => {
    switch (action) {
      case 'MEMBER_CREATED':
        return 'Nộp hồ sơ xin gia nhập HTX';
      case 'MEMBER_APPROVED':
        return 'Đại hội / HĐQT phê duyệt kết nạp xã viên';
      case 'MEMBER_UPDATED':
        return 'Cập nhật thông tin hồ sơ nhân thân';
      case 'CAPITAL_CONTRIBUTION_RECORDED':
        return 'Nộp tiền vốn góp điều lệ HTX';
      case 'LAND_CONTRIBUTION_RECORDED':
        return 'Góp vốn bằng quyền sử dụng đất (Sổ đỏ)';
      case 'MEMBER_SUSPENDED':
        return 'Tạm đình chỉ quyền lợi xã viên';
      case 'MEMBER_RESTORED':
        return 'Khôi phục tư cách hoạt động chính thức';
      case 'MEMBER_TERMINATED':
        return 'Chấm dứt tư cách thành viên HTX';
      default:
        return action;
    }
  };

  const handleUploadMock = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      showToast('Đã ghi nhận tài liệu đính kèm vào hồ sơ xã viên!', 'success');
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* KHỐI 1: HỒ SƠ & TÀI LIỆU PHÁP LÝ SỐ HÓA */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Hồ sơ &amp; Giấy tờ pháp lý lưu trữ</span>
          </h3>
          <button
            type="button"
            onClick={handleUploadMock}
            disabled={isUploading}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Đang lưu...' : '+ Đính kèm tài liệu'}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {/* File 1: Đơn xin gia nhập HTX */}
          <div className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-800 truncate">
                  {`Don_Xin_Gia_Nhap_${member.member_code}.pdf`}
                </div>
                <div className="text-[11px] text-slate-500">
                  Đơn xin gia nhập &amp; Cam kết tuân thủ Điều lệ HTX
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {onPrintProfile && (
                <button
                  type="button"
                  onClick={() => onPrintProfile(member)}
                  className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  Xem hồ sơ
                </button>
              )}
            </div>
          </div>

          {/* File 2: Bản sao CCCD / CMND */}
          <div className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-800 truncate">Ban_Sao_CCCD_Dinh_Danh.pdf</div>
                <div className="text-[11px] text-slate-500">
                  Số CCCD: {member.cccd} &bull; Cấp ngày: {formatDate(member.cccd_issue_date)}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Đã đối soát
            </span>
          </div>

          {/* File 3: Hợp đồng liên kết sản xuất / dịch vụ */}
          <div className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-800 truncate">
                  {`Hop_Dong_Lien_Ket_San_Xuat_${member.member_code}.pdf`}
                </div>
                <div className="text-[11px] text-slate-500">
                  Hợp đồng bao tiêu nông sản &amp; Thỏa thuận cung ứng dịch vụ
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đang hiệu lực
            </span>
          </div>

          {/* File 4: Giấy chứng nhận phần vốn góp */}
          <div className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-800 truncate">
                  {`Giay_Chung_Nhan_Von_Gop_${member.member_code}.pdf`}
                </div>
                <div className="text-[11px] text-slate-500">
                  Chứng nhận vốn góp điều lệ theo Luật Hợp tác xã 2023
                </div>
              </div>
            </div>
            {onPrintCertificate ? (
              <button
                type="button"
                onClick={() => onPrintCertificate(member)}
                className="px-2.5 py-1 text-xs font-bold text-purple-800 bg-white hover:bg-purple-50 border border-purple-300 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                Xem GCN
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Đã cấp
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KHỐI 2: DÒNG THỜI GIAN BIẾN ĐỘNG & VÒNG ĐỜI XÃ VIÊN (AUDIT TIMELINE) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-600" />
            <span>Lịch sử sự kiện &amp; Vòng đời xã viên</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            {timeline.length > 0 ? `${timeline.length} sự kiện ghi nhận` : 'Khởi tạo'}
          </span>
        </h3>

        <div className="space-y-3.5">
          {/* Mốc sự kiện từ Audit Events */}
          {timeline.length > 0 &&
            timeline.slice(0, 8).map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0 ring-4 ring-emerald-50" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800">{formatTimelineLabel(evt.action)}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {new Date(evt.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}

          {/* Mốc Khởi Đầu Chính Thức: Ngày gia nhập HTX */}
          <div className="flex items-start gap-3 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1 shrink-0 ring-4 ring-emerald-100" />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900">
                Chính thức gia nhập Hợp tác xã Nông nghiệp
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {formatDate(member.join_date)} &bull; Mã xã viên: {member.member_code}
              </div>
            </div>
          </div>

          {timeline.length === 0 && (
            <p className="text-[11.5px] text-slate-400 italic pt-1 border-t border-slate-100">
              Chưa ghi nhận thêm biến động nhân sự hoặc giao dịch mới sau ngày gia nhập.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
