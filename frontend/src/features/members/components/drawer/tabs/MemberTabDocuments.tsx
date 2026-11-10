import React from 'react';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { FileText, Printer, Eye, Award, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface MemberTabDocumentsProps {
  member: Member;
  transactions: CapitalTransaction[];
  onPrintVoucher?: (m: Member, tx?: CapitalTransaction) => void;
  onPreviewFile?: (url: string, name: string) => void;
  onPrintCertificate?: (m: Member) => void;
  onPrintProfile?: (m: Member) => void;
}

export const MemberTabDocuments: React.FC<MemberTabDocumentsProps> = ({
  member,
  onPrintVoucher,
  onPreviewFile,
  onPrintCertificate,
  onPrintProfile,
}) => {
  return (
    <div className="space-y-4">
      {/* CARD 1: HỒ SƠ PHÁP LÝ & GIẤY TỜ ĐÍNH KÈM */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            Hồ sơ pháp lý &amp; Tài liệu số hóa
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Lưu trữ mã băm SHA-256
          </span>
        </h3>

        <div className="space-y-3">
          {/* File 1: Đơn xin gia nhập & Phiếu thu vốn */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <strong className="text-slate-900 block truncate text-sm font-bold">
                  {member.notary_document_url
                    ? 'Giay_Bien_Nhan_Gop_Von.pdf'
                    : `Don_Gia_Nhap_HTX_${member.member_code}.pdf`}
                </strong>
                <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
                  Đơn xin gia nhập HTX &amp; Xác nhận tư cách thành viên
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onPrintVoucher && (
                <button
                  onClick={() => onPrintVoucher(member)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> In phiếu thu
                </button>
              )}
              {onPrintProfile ? (
                <button
                  onClick={() => onPrintProfile(member)}
                  className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem hồ sơ (PDF)
                </button>
              ) : onPreviewFile ? (
                <button
                  onClick={() =>
                    onPreviewFile(
                      member.notary_document_url || '/docs/sample_agreement.pdf',
                      'Đơn gia nhập HTX'
                    )
                  }
                  className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem tài liệu
                </button>
              ) : null}
            </div>
          </div>

          {/* File 2: Bản sao CCCD / CMND */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="truncate">
                <strong className="text-slate-900 block truncate text-sm font-bold">
                  Ban_Sao_CCCD_Cong_Chung.pdf
                </strong>
                <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
                  Số CCCD: {member.cccd} &bull; Cấp ngày: {formatDate(member.cccd_issue_date)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                Đã đối soát danh tính
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: GIẤY CHỨNG NHẬN CỔ PHẦN HTX */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            Giấy chứng nhận vốn góp &amp; Cổ phần HTX
          </span>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
            Mẫu Điều lệ HTX 2023
          </span>
        </h3>

        <div className="p-4 bg-gradient-to-r from-amber-50/60 to-yellow-50/40 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-amber-950">
              Giấy Chứng Nhận Cổ Phần ({member.total_shares_held || 0} Cổ phần)
            </h4>
            <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
              Cấp cho xã viên <strong>{member.full_name}</strong> &bull; Sở hữu{' '}
              <strong>{member.ownership_percentage}%</strong> tổng vốn điều lệ của Hợp tác xã.
            </p>
          </div>

          {onPrintCertificate && (
            <button
              onClick={() => onPrintCertificate(member)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              Xem &amp; In Giấy Chứng Nhận (PDF)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
