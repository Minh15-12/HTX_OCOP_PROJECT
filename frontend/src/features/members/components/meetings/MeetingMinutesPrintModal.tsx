import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, FileSpreadsheet, X, Vote as VoteIcon, CheckCircle2 } from 'lucide-react';
import { Meeting, ResolutionSummary } from '@/services/meetingApi';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import * as XLSX from 'xlsx';

interface MeetingMinutesPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  summaries: ResolutionSummary[];
}

export const MeetingMinutesPrintModal: React.FC<MeetingMinutesPrintModalProps> = ({
  isOpen,
  onClose,
  meeting,
  summaries,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !meeting) return null;

  const coopName = activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN';
  const coopAddress = activeCooperative?.address || 'Ấp Tân Hưng, Xã Tân Hòa, Huyện Lai Vung, Đồng Tháp';

  const meetingTypeLabel =
    meeting.meeting_type === 'ANNUAL'
      ? 'ĐẠI HỘI THÀNH VIÊN THƯỜNG NIÊN'
      : meeting.meeting_type === 'EXTRAORDINARY'
      ? 'ĐẠI HỘI THÀNH VIÊN BẤT THƯỜNG'
      : 'HỘI NGHỊ THÀNH VIÊN ĐỊNH KỲ';

  // PDF Export
  const handleExportPdf = async () => {
    if (!printContainerRef.current) return;
    try {
      setIsExportingPdf(true);
      await exportPdfFromElement(
        printContainerRef.current,
        `bien_ban_nghi_quyet_dai_hoi_${meeting.meeting_date || 'htx'}.pdf`,
        { margin: [8, 10, 8, 10] }
      );
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Excel Export
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const data: (string | number)[][] = [
        ['HỢP TÁC XÃ', coopName],
        ['ĐỊA CHỈ', coopAddress],
        ['CĂN CỨ PHÁP LÝ', 'Điều 21, Điều 72 Luật Hợp tác xã số 17/2023/QH15'],
        [],
        ['BIÊN BẢN & NGHỊ QUYẾT ĐẠI HỘI THÀNH VIÊN'],
        ['Tiêu đề cuộc họp', meeting.title],
        ['Hình thức tổ chức', meetingTypeLabel],
        ['Ngày tổ chức', meeting.meeting_date],
        ['Nội dung chương trình', meeting.description || ''],
        ['Trạng thái', meeting.status === 'COMPLETED' ? 'Đã bế mạc' : 'Đang diễn ra'],
        [],
        ['KẾT QUẢ BIỂU QUYẾT CÁC NGHỊ QUYẾT'],
        ['MÃ NGHỊ QUYẾT', 'NỘI DUNG', 'TÁN THÀNH (FOR)', 'KHÔNG TÁN THÀNH (AGAINST)', 'PHIẾU TRẮNG (ABSTAIN)', 'TỶ LỆ TÁN THÀNH (%)', 'NGƯỠNG YÊU CẦU', 'KẾT LUẬN'],
      ];

      summaries.forEach((s) => {
        const isCritical = s.resolution_type === 'CRITICAL' || s.resolution_code?.includes('CRIT') || false;
        const thresholdText = isCritical ? '≥ 75% (Khoản 2 Điều 72)' : '≥ 50% (Thông thường)';
        const statusText = s.is_approved ? 'THÔNG QUA' : 'CHƯA THÔNG QUA';

        data.push([
          s.resolution_code,
          `Nghị quyết số ${s.resolution_code}`,
          s.for_count,
          s.against_count,
          s.abstain_count,
          `${s.approval_percentage}%`,
          thresholdText,
          statusText,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'BienBanNghiQuyet');
      XLSX.writeFile(wb, `bien_ban_nghi_quyet_${meeting.meeting_date || 'htx'}.xlsx`);
    } catch (err) {
      console.error('Excel export error:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl animate-fade-in p-6 space-y-4 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <VoteIcon className="w-5 h-5 text-emerald-600" />
              Biên Bản &amp; Nghị Quyết Đại Hội Thành Viên A4
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Căn cứ Điều 21 và Điều 72 Luật Hợp tác xã số 17/2023/QH15 (Nguyên tắc 1 thành viên = 1 phiếu)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar - Trio Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-bold text-slate-600">Đa phương thức In &amp; Xuất hồ sơ:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> In Trực Tiếp
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF (.pdf)'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {isExportingExcel ? 'Đang xuất Excel...' : 'Tải File Excel (.xlsx)'}
            </button>
          </div>
        </div>

        {/* Printable Document A4 Container */}
        <div
          ref={printContainerRef}
          data-pdf-container="true"
          className="p-8 border border-slate-200 rounded-2xl bg-white space-y-5 text-xs font-sans text-slate-800 break-words"
          style={{ minHeight: '520px' }}
        >
          {/* Official National Header */}
          <div className="grid grid-cols-2 text-center pb-4 border-b border-slate-300">
            <div>
              <p className="font-bold uppercase text-[11px] text-slate-800">{coopName}</p>
              <p className="text-[10px] text-slate-500 font-mono">Số: ....../BB-ĐHTV</p>
            </div>
            <div>
              <p className="font-black uppercase text-[11px] text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-[10.5px] text-slate-800">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center space-y-1 pt-2">
            <h4 className="font-black text-base uppercase text-emerald-800 tracking-tight">
              BIÊN BẢN &amp; NGHỊ QUYẾT {meetingTypeLabel}
            </h4>
            <h5 className="font-bold text-sm text-slate-800">{meeting.title}</h5>
            <p className="text-[11px] text-slate-500 italic">
              (Căn cứ Điều 21 và Điều 72 Luật Hợp tác xã số 17/2023/QH15 có hiệu lực từ ngày 01/07/2024)
            </p>
          </div>

          {/* Meeting Context */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Thời gian tổ chức:</span>{' '}
                <strong className="text-slate-900">{meeting.meeting_date}</strong>
              </div>
              <div>
                <span className="text-slate-500">Địa điểm:</span>{' '}
                <span className="text-slate-800 font-medium">Trụ sở {coopName} ({coopAddress})</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Chủ tọa:</span>{' '}
                <strong className="text-slate-900">Ban Giám đốc &amp; Hội đồng Quản trị HTX</strong>
                <span className="text-slate-500 ml-4">Thư ký:</span>{' '}
                <strong className="text-slate-900">Bộ phận Văn phòng &amp; Thư ký Hội đồng</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Nội dung chương trình:</span>{' '}
                <span className="text-slate-800 font-medium">{meeting.description || 'Thông qua kế hoạch sản xuất, phương án tài chính và biểu quyết các nghị quyết đại hội.'}</span>
              </div>
              <div className="col-span-2 text-emerald-800 font-bold">
                Túc số tham dự: Đạt yêu cầu theo quy định của Luật HTX 2023 (1 thành viên = 1 phiếu biểu quyết bình đẳng).
              </div>
            </div>
          </div>

          {/* Resolutions and Vote Summary Table */}
          <div className="space-y-2">
            <h5 className="font-bold text-xs uppercase text-slate-900 tracking-wide">
              KẾT QUẢ BIỂU QUYẾT VÀ NGHỊ QUYẾT ĐÃ THÔNG QUA
            </h5>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700 text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-3">Mã NQ</th>
                  <th className="py-2.5 px-3">Nội dung Nghị quyết</th>
                  <th className="py-2.5 px-2 text-center">Tán thành</th>
                  <th className="py-2.5 px-2 text-center">Không</th>
                  <th className="py-2.5 px-2 text-center">Trắng</th>
                  <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                  <th className="py-2.5 px-3 text-center">Kết luận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {summaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-slate-400 italic">
                      Chưa ghi nhận nghị quyết hoặc phiếu biểu quyết nào trong kỳ họp này.
                    </td>
                  </tr>
                ) : (
                  summaries.map((s) => {
                    const isCritical = s.resolution_type === 'CRITICAL' || s.resolution_code?.includes('CRIT') || false;
                    return (
                      <tr key={s.resolution_code} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{s.resolution_code}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">Nghị quyết số {s.resolution_code}</div>
                          <div className="text-[10px] text-slate-500">
                            {isCritical ? 'Nghị quyết trọng yếu (yêu cầu ≥ 75% theo K2 Đ72)' : 'Nghị quyết thông thường (yêu cầu ≥ 50%)'}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-700">{s.for_count}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-rose-600">{s.against_count}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-400">{s.abstain_count}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-slate-800">{s.approval_percentage}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.is_approved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {s.is_approved ? 'THÔNG QUA' : 'CHƯA ĐẠT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Resolutions Decree Text */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <p className="font-bold uppercase text-[11px]">QUYẾT NGHỊ CỦA ĐẠI HỘI:</p>
            <p className="leading-relaxed">
              Đại hội thành viên đã thảo luận dân chủ, biểu quyết theo nguyên tắc bình đẳng 1 thành viên = 1 phiếu theo Điều 21 Luật HTX 2023. Giao Ban Giám đốc và Hội đồng quản trị tổ chức triển khai thực hiện nghiêm túc các nghị quyết đã được thông qua và báo cáo cơ quan đăng ký HTX cấp huyện theo luật định.
            </p>
          </div>

          {/* Signatures Section */}
          <div className="grid grid-cols-3 text-center pt-6 text-[11px] text-slate-700 break-inside-avoid">
            <div>
              <p className="font-bold text-slate-800">THƯ KÝ ĐẠI HỘI</p>
              <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-600">Ban Thư ký</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">TRƯỞNG BAN KIỂM SOÁT</p>
              <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-600">Ban Kiểm soát HTX</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">CHỦ TỌA ĐẠI HỘI</p>
              <p className="text-[10px] text-slate-400 italic">(Ký tên, đóng dấu)</p>
              <div className="h-16"></div>
              <p className="font-semibold text-emerald-900">Chủ tịch HĐQT / Giám đốc</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingMinutesPrintModal;
