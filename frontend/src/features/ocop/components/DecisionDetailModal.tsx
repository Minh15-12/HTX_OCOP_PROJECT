import React, { useRef, useState, useEffect } from 'react';
import { Award, Download, CheckCircle, XCircle, FileText, Star, Printer, FileSpreadsheet, Eye } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import * as XLSX from 'xlsx';
import type { OCOPDecision } from '../pages/DecisionsPage';

interface DecisionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: OCOPDecision | null;
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onGenerateDossierPdf: (applicationId: string) => void;
  onGenerateCertificatePdf: (applicationId: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  isGeneratingDossier: boolean;
  isGeneratingCertificate: boolean;
}

export const DecisionDetailModal: React.FC<DecisionDetailModalProps> = ({
  isOpen,
  onClose,
  decision,
  onApprove,
  onReject,
  onGenerateDossierPdf,
  onGenerateCertificatePdf,
  isApproving,
  isRejecting,
  isGeneratingDossier,
  isGeneratingCertificate,
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [isPreviewCertificateOpen, setIsPreviewCertificateOpen] = useState(false);
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

  if (!decision) return null;

  // Căn cứ phân cấp thẩm quyền theo QĐ 148/QĐ-TTg & QĐ 1489/QĐ-TTg
  const councilLevelText =
    decision.council_level === 'DISTRICT'
      ? 'Hội đồng & UBND Cấp Huyện (Đánh giá, phân hạng 3 sao)'
      : decision.council_level === 'PROVINCIAL'
      ? 'Hội đồng & UBND Cấp Tỉnh (Đánh giá, phân hạng 4 sao)'
      : 'Hội đồng Trung ương / Bộ NN&PTNT (Đánh giá, phân hạng 5 sao)';

  const issuingAuthority =
    decision.council_level === 'DISTRICT'
      ? 'ỦY BAN NHÂN DÂN HUYỆN'
      : decision.council_level === 'PROVINCIAL'
      ? 'ỦY BAN NHÂN DÂN TỈNH'
      : 'BỘ NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN';

  // Client PDF Export
  const handleClientExportPdf = async () => {
    if (!printContainerRef.current) return;
    try {
      setIsExportingPdf(true);
      await exportPdfFromElement(
        printContainerRef.current,
        `giay_chung_nhan_ocop_${decision.application_code || decision.id}.pdf`,
        { margin: [8, 10, 8, 10] }
      );
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Client Excel Export
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const data = [
        ['QUYẾT ĐỊNH CÔNG NHẬN SẢN PHẨM OCOP', ''],
        ['Căn cứ pháp lý', 'Quyết định 148/QĐ-TTg và Quyết định 1489/QĐ-TTg của Thủ tướng Chính phủ'],
        [],
        ['Số Quyết định', decision.decision_number],
        ['Mã hồ sơ đánh giá', decision.application_code],
        ['Sản phẩm được công nhận', decision.product_name],
        ['Chủ thể Hợp tác xã', decision.cooperative_name],
        ['Phân hạng OCOP đạt được', `${decision.star_rating} SAO (★)`],
        ['Cơ quan ban hành', councilLevelText],
        ['Ngày có hiệu lực', formatDate(decision.effective_date)],
        ['Ngày hết hạn hiệu lực (36 tháng)', formatDate(decision.expiration_date)],
        ['Người ký ban hành', `${decision.signer_name || ''} - ${decision.signer_title || ''}`],
        ['Trạng thái pháp lý', decision.status === 'APPROVED' ? 'ĐÃ BAN HÀNH CHÍNH THỨC' : decision.status],
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'QuyetDinhOCOP');
      XLSX.writeFile(wb, `quyet_dinh_ocop_${decision.application_code || decision.id}.xlsx`);
    } catch (err) {
      console.error('Excel export error:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Quyết Định Công Nhận OCOP"
      size="lg"
    >
      <div className="space-y-5 break-words">
        {/* Top Banner */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Số Quyết Định chính thức
            </span>
            <div className="text-xl font-black text-emerald-900 font-mono">
              {decision.decision_number}
            </div>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Căn cứ QĐ 148/QĐ-TTg &amp; QĐ 1489/QĐ-TTg ngày 06/07/2025
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg border shadow-xs">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= decision.star_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500">Sản phẩm chứng nhận:</span>
            <div className="font-semibold text-gray-900 text-sm">{decision.product_name}</div>
          </div>
          <div>
            <span className="text-gray-500">Chủ thể Hợp tác xã:</span>
            <div className="font-semibold text-gray-900">{decision.cooperative_name}</div>
          </div>
          <div>
            <span className="text-gray-500">Ngày có hiệu lực:</span>
            <div className="font-semibold text-gray-900">{formatDate(decision.effective_date)}</div>
          </div>
          <div>
            <span className="text-gray-500">Ngày hết hạn (Hiệu lực 36 tháng):</span>
            <div className="font-semibold text-emerald-800">{formatDate(decision.expiration_date)}</div>
          </div>
          <div>
            <span className="text-gray-500">Người ký quyết định:</span>
            <div className="font-semibold text-gray-900">
              {decision.signer_name} - {decision.signer_title}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Thẩm quyền phân hạng:</span>
            <div className="font-semibold text-gray-900">{councilLevelText}</div>
          </div>
        </div>

        {/* DOCUMENT GENERATION SECTION & TRIO BUTTONS */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-xs flex items-center">
              <FileText className="w-4 h-4 mr-2 text-emerald-700" />
              Đa phương thức Kết Xuất Chứng Nhận &amp; In Ấn (RULE-TECH-DOC-01)
            </h4>
            <button
              type="button"
              onClick={() => setIsPreviewCertificateOpen(!isPreviewCertificateOpen)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              {isPreviewCertificateOpen ? 'Thu gọn xem trước' : 'Xem trước Giấy Chứng Nhận A4'}
            </button>
          </div>

          {/* Action Trio Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-1.5 text-emerald-700" />
              In Trực Tiếp
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isExportingPdf}
              onClick={handleClientExportPdf}
            >
              <Download className="w-4 h-4 mr-1.5 text-blue-600" />
              {isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF (.pdf)'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isExportingExcel}
              onClick={handleExportExcel}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              {isExportingExcel ? 'Đang xuất...' : 'Tải File Excel (.xlsx)'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isGeneratingDossier}
              onClick={() => onGenerateDossierPdf(decision.application_id)}
            >
              <Download className="w-4 h-4 mr-1.5 text-purple-600" />
              Bộ Hồ Sơ PDF Server
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isGeneratingCertificate}
              onClick={() => onGenerateCertificatePdf(decision.application_id)}
            >
              <Award className="w-4 h-4 mr-1.5" />
              Bằng Chứng Nhận Server
            </Button>
          </div>
        </div>

        {/* Printable Certificate A4 Preview Container */}
        {(isPreviewCertificateOpen || true) && (
          <div
            ref={printContainerRef}
            data-pdf-container="true"
            className="p-8 border-2 border-amber-600/40 rounded-2xl bg-amber-50/20 text-center space-y-4 text-xs font-sans text-slate-800 break-words shadow-inner"
          >
            {/* National Header */}
            <div>
              <p className="font-bold text-[11px] uppercase text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-semibold text-[10.5px] text-slate-700">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-24 h-0.5 bg-amber-600 mx-auto my-1.5"></div>
              <p className="font-black text-xs uppercase text-amber-900 mt-2">{issuingAuthority}</p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-1.5 py-2">
              <h3 className="text-lg font-black uppercase text-emerald-900 tracking-wider">
                GIẤY CHỨNG NHẬN SẢN PHẨM OCOP
              </h3>
              <p className="text-[11px] text-slate-600 italic">
                Căn cứ Quyết định 148/QĐ-TTg ngày 24/02/2023 và Quyết định 1489/QĐ-TTg ngày 06/07/2025 của Thủ tướng Chính phủ
              </p>
              <p className="text-xs font-bold text-slate-800 pt-2">CHỨNG NHẬN SẢN PHẨM:</p>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                {decision.product_name}
              </h2>
              <p className="text-xs text-slate-700">
                Chủ thể sản xuất: <strong className="text-slate-900">{decision.cooperative_name}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Mã hồ sơ: <span className="font-mono font-bold text-emerald-800">{decision.application_code}</span>
              </p>
            </div>

            {/* Star Rating Display */}
            <div className="py-2">
              <div className="inline-flex items-center gap-1.5 bg-amber-100/80 border border-amber-300 px-5 py-2 rounded-2xl shadow-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= decision.star_rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="font-black text-sm text-amber-900 uppercase mt-1.5">
                ĐẠT HẠNG {decision.star_rating} SAO OCOP
              </p>
            </div>

            {/* Validity */}
            <div className="text-[11px] text-slate-600 space-y-0.5 border-t border-dashed border-amber-300 pt-3">
              <p>Số Quyết định: <strong>{decision.decision_number}</strong></p>
              <p>Hiệu lực chứng nhận: <strong>36 tháng</strong> (Từ ngày {formatDate(decision.effective_date)} đến ngày {formatDate(decision.expiration_date)})</p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 text-center pt-4 text-[11px] text-slate-800 break-inside-avoid">
              <div>
                <p className="font-bold">CƠ QUAN THƯỜNG TRỰC OCOP</p>
                <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
                <div className="h-14"></div>
                <p className="font-semibold text-slate-600">Tổ giúp việc Hội đồng</p>
              </div>
              <div>
                <p className="font-bold uppercase text-slate-900">{issuingAuthority}</p>
                <p className="text-[10px] text-slate-400 italic">(Ký tên, đóng dấu)</p>
                <div className="h-14"></div>
                <p className="font-black text-emerald-900">{decision.signer_name || 'LÃNH ĐẠO CẤP CÓ THẨM QUYỀN'}</p>
                <p className="text-[10px] text-slate-500">{decision.signer_title || 'Chủ tịch Hội đồng OCOP'}</p>
              </div>
            </div>
          </div>
        )}

        {/* AUTHORIZATION APPROVE / REJECT BUTTONS */}
        {decision.status === 'PENDING_APPROVAL' && (
          <div className="pt-3 border-t flex justify-end space-x-3">
            <Button
              variant="danger"
              disabled={isRejecting}
              onClick={() => onReject(decision.application_id)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Từ Chối Công Nhận
            </Button>
            <Button
              variant="primary"
              disabled={isApproving}
              onClick={() => onApprove(decision.application_id)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Phê Duyệt &amp; Ban Hành Quyết Định
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DecisionDetailModal;
