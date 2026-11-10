import React, { useEffect, useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Download,
  Link,
  RefreshCw,
  Trash2,
  X,
  FileCheck,
  History,
} from 'lucide-react';
import { EvidenceRecord } from './evidenceTypes';
import { LiveEvidenceDocumentViewer } from './LiveEvidenceDocumentViewer';

interface EvidencePreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecord: EvidenceRecord | null;
  onDownload?: (item: EvidenceRecord) => void;
  onLinkIndicator?: (item: EvidenceRecord) => void;
  onReplaceVersion?: (item: EvidenceRecord) => void;
  onDelete?: (item: EvidenceRecord) => void;
}

export const EvidencePreviewDrawer: React.FC<EvidencePreviewDrawerProps> = ({
  isOpen,
  onClose,
  activeRecord,
  onDownload,
  onLinkIndicator,
  onReplaceVersion,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'DOCUMENT' | 'METADATA'>('DOCUMENT');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeRecord) return null;

  return (
    <>
      {/* Semi-transparent Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Sheet / Panel */}
      <div
        id="evidence-preview-sheet"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-4xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-emerald-600" />
              <span>Nội dung minh chứng số hóa</span>
            </h3>
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('DOCUMENT')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'DOCUMENT'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Văn bản & Bảng số liệu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('METADATA')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'METADATA'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thuộc tính & Lịch sử
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`pill-badge text-[10px] ${
                activeRecord.status === 'VALID'
                  ? 'pill-green'
                  : activeRecord.status === 'PENDING'
                  ? 'pill-amber'
                  : 'pill-red'
              }`}
            >
              {activeRecord.statusLabel}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Đóng chi tiết"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'DOCUMENT' ? (
            <LiveEvidenceDocumentViewer
              evidence={{
                id: activeRecord.id,
                title: activeRecord.name,
                category: activeRecord.category,
                fileName: activeRecord.fileName || activeRecord.name,
                fileSize: activeRecord.size,
                sha256: activeRecord.checksum,
                checksum: activeRecord.checksum,
                status: activeRecord.statusLabel,
                format: activeRecord.format,
                uploadedAt: activeRecord.uploadDate,
                downloadUrl: activeRecord.downloadUrl,
                sourceType: activeRecord.sourceType,
                dossierCode: activeRecord.dossierCode,
                uploader: activeRecord.uploader,
              }}
            />
          ) : (
            <>
              {/* Document Title & Checksum */}
              <div className="space-y-2 text-xs">
                <div className="font-extrabold text-slate-900 text-sm leading-snug">{activeRecord.name}</div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                  <span>Nhóm tiêu chí:</span>
                  <span className="font-bold text-slate-800">{activeRecord.category}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Liên kết hồ sơ:</span>
                  <span className="font-mono font-bold text-emerald-700">{activeRecord.dossierCode}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Kích thước / Định dạng:</span>
                  <span className="font-semibold text-slate-800">
                    {activeRecord.size} ({activeRecord.format})
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10.5px] break-all space-y-1">
                  <span className="text-slate-500 font-bold">Mã băm SHA-256 (Tamper-evident):</span>
                  <div className="text-slate-800 font-bold select-all bg-white p-2 rounded border border-slate-200">
                    {activeRecord.checksum}
                  </div>
                </div>
              </div>
            </>
          )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => onDownload?.(activeRecord)}
          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Download className="w-4 h-4" /> Tải xuống
        </button>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onLinkIndicator?.(activeRecord)}
            className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
          >
            <Link className="w-3.5 h-3.5" /> Liên kết chỉ tiêu
          </button>
          <button
            onClick={() => onReplaceVersion?.(activeRecord)}
            className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thay phiên bản
          </button>
        </div>
        <button
          onClick={() => onDelete?.(activeRecord)}
          className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Xóa tệp minh chứng
        </button>
      </div>

      {/* Version History */}
      <div className="space-y-2 pt-2 border-t text-xs">
        <h4 className="font-extrabold text-slate-900 text-[11.5px]">Lịch sử phiên bản</h4>
        <div className="space-y-1.5 text-[10.5px]">
          <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border">
            <div>
              <span className="font-bold text-slate-900">v1.0</span> &bull;{' '}
              <span className="text-slate-500">{activeRecord.uploadDate}</span>
            </div>
            <span className="text-slate-500">Tài liệu gốc</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</>
  );
};
