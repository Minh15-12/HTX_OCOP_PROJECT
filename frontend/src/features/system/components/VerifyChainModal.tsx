import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  RefreshCw,
  Hash,
  Lock,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { AuditLogItem, auditApi, HashChainVerificationResult } from '@/services/auditApi';

interface VerifyChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
}

export const VerifyChainModal: React.FC<VerifyChainModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<HashChainVerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportExcel = () => {
    if (!verifiedResult) return;
    const wb = XLSX.utils.book_new();
    const rows = [
      ['BIÊN BẢN ĐỐI SOÁT TOÀN VẸN CHUỖI KIỂM TOÁN SHA-256 (TCVN 12850)'],
      ['Thời điểm đối soát', new Date(verifiedResult.verified_at).toLocaleString('vi-VN')],
      ['Thuật toán mật mã', verifiedResult.algorithm || 'SHA-256 Tamper-evident'],
      ['Trạng thái toàn vẹn', verifiedResult.is_valid ? 'HỢP LỆ & LIỀN MẠCH 100%' : 'CẢNH BÁO ĐỨT GÃY'],
      ['Độ tin cậy', `${verifiedResult.integrity_score}%`],
      ['Tổng số khối kiểm tra', verifiedResult.total_blocks_checked],
      ['Số khối liên tục hợp lệ', verifiedResult.verified_continuous_blocks],
      ['Số điểm bất thường', verifiedResult.anomaly_count],
      ['Mã băm khối mới nhất', verifiedResult.latest_block_hash],
      [],
    ];
    if (verifiedResult.anomalies && verifiedResult.anomalies.length > 0) {
      rows.push(['STT', 'Vị trí khối', 'Hành động', 'Mô tả bất thường']);
      verifiedResult.anomalies.forEach((a, i) => {
        rows.push([i + 1, `Khối #${a.index}`, a.action, a.description]);
      });
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 25 }, { wch: 50 }, { wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, ws, 'KetQuaDoiSoat');
    XLSX.writeFile(wb, `bien_ban_doi_soat_sha256_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleStartVerification = async () => {
    try {
      setIsVerifying(true);
      setErrorMessage(null);
      setVerifiedResult(null);

      const result = await auditApi.verifyHashChain();
      setVerifiedResult(result);
    } catch (err: any) {
      console.error('Lỗi kiểm tra chuỗi băm:', err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Không thể kết nối máy chủ để kiểm tra chuỗi băm');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Kiểm Tra Toàn Vẹn Chuỗi Băm SHA-256
              </h3>
              <p className="text-xs text-slate-300">
                Thuật toán tamper-evident phát hiện sai lệch và đứt gãy chuỗi kiểm toán
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!verifiedResult && !isVerifying && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                <Hash className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Sẵn sàng quét {logs.length} bản ghi Audit Trail
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hệ thống sẽ đối soát từng khối thay đổi trạng thái, con trỏ chuỗi băm cha-con và chữ ký số SHA-256 để phát hiện mọi hành vi can thiệp trái phép.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-[11px] text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Lock className="w-3.5 h-3.5" /> Lưu ý quy tắc an toàn dữ liệu:
                </div>
                <p>
                  Chuỗi băm SHA-256 là biện pháp phát hiện sai lệch (tamper-evident). Toàn bộ thao tác ghi sổ và thay đổi điểm OCOP đều được bảo vệ trong Database Transaction nghiêm ngặt.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartVerification}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 mx-auto"
              >
                <FileCheck className="w-4 h-4" />
                Bắt đầu quét đối soát ngay
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isVerifying && (
            <div className="text-center py-8 space-y-4">
              <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Đang đối soát mật mã SHA-256 trên toàn bộ cơ sở dữ liệu...
                </h4>
                <p className="text-xs text-slate-500">
                  Kiểm tra con trỏ liên kết khối băm cha-con và phát hiện can thiệp ngoài ứng dụng
                </p>
              </div>
            </div>
          )}

          {verifiedResult && (
            <div data-pdf-container="true" className="space-y-4 animate-fade-in break-words">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  verifiedResult.is_valid
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900'
                }`}
              >
                {verifiedResult.is_valid ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold">
                    {verifiedResult.is_valid
                      ? 'Chuỗi Kiểm Toán Hoàn Toàn Liền Mạch & Hợp Lệ (100%)'
                      : `Hệ Thống Đạt Độ Toàn Vẹn: ${verifiedResult.integrity_score}%`}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {verifiedResult.is_valid
                      ? 'Tất cả các khối thay đổi trạng thái, giao dịch tài chính và điểm số OCOP giữ nguyên vẹn chuỗi băm SHA-256, không có dấu hiệu sửa đổi trực tiếp database.'
                      : `Phát hiện ${verifiedResult.anomaly_count} điểm đứt gãy hoặc con trỏ băm chưa khởi tạo trong lịch sử.`}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-[10.5px] text-slate-500 font-medium">Tổng khối</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {verifiedResult.total_blocks_checked}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <div className="text-[10.5px] text-emerald-700 font-medium">Khối liền mạch</div>
                  <div className="text-base font-bold font-mono text-emerald-800 mt-0.5">
                    {verifiedResult.verified_continuous_blocks}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                  <div className="text-[10.5px] text-blue-700 font-medium">Độ tin cậy</div>
                  <div className="text-base font-bold font-mono text-blue-800 mt-0.5">
                    {verifiedResult.integrity_score}%
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-[10.5px] text-slate-500 font-medium">Bất thường</div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${verifiedResult.anomaly_count > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                    {verifiedResult.anomaly_count}
                  </div>
                </div>
              </div>

              {/* Latest Block Hash */}
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                  <span className="font-semibold">Mã băm khối kiểm toán mới nhất ({verifiedResult.algorithm}):</span>
                  <span className="text-emerald-400 font-mono font-bold">TCVN 12850</span>
                </div>
                <div className="text-[10.5px] font-mono break-all text-emerald-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {verifiedResult.latest_block_hash}
                </div>
              </div>

              {/* Anomalies List (if any) */}
              {verifiedResult.anomalies && verifiedResult.anomalies.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700">Chi tiết điểm bất thường phát hiện:</div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-amber-50/50 border border-amber-200 rounded-xl text-[11px]">
                    {verifiedResult.anomalies.map((a, i) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-amber-100 space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span>Khối #{a.index} • [{a.action}]</span>
                          <span className="text-[10px] text-slate-400">{a.timestamp ? new Date(a.timestamp).toLocaleString('vi-VN') : ''}</span>
                        </div>
                        <div className="text-slate-600 text-[10.5px]">{a.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-400 font-mono text-right">
                Thời điểm đối soát: {new Date(verifiedResult.verified_at).toLocaleString('vi-VN')}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {verifiedResult ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartVerification}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Quét lại
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                title="Tải biên bản đối soát SHA-256 (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Xuất Excel (.xlsx)
              </button>
            </div>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
