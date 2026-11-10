import React, { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import { ALL_INDICATORS } from '../data/ocopQd148Data';
import { AutoExtractInternalEvidenceTab } from './AutoExtractInternalEvidenceTab';

interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    indicatorCode: string;
    title: string;
    evidenceType: 'CERTIFICATE' | 'LAB_REPORT' | 'PROCESS_PHOTO' | 'LEGAL_DOCUMENT';
    file?: File;
    sourceType?: string;
    sourceRef?: string;
    productionUnitId?: string;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'AUTO_EXTRACT'>('UPLOAD');
  const [indicatorCode, setIndicatorCode] = useState(ALL_INDICATORS[0]?.code || 'TC-A.1.1');
  const [title, setTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState<
    'CERTIFICATE' | 'LAB_REPORT' | 'PROCESS_PHOTO' | 'LEGAL_DOCUMENT'
  >('CERTIFICATE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên tài liệu minh chứng');
      return;
    }
    if (!selectedFile) {
      alert('Vui lòng đính kèm tệp tài liệu minh chứng (PDF, JPG, PNG)');
      return;
    }
    onSubmit({
      indicatorCode,
      title: title.trim(),
      evidenceType,
      file: selectedFile,
      sourceType: 'FILE_UPLOAD',
    });
  };

  const handleAutoExtractSubmit = (data: {
    indicatorCode: string;
    title: string;
    sourceType: string;
    sourceRef: string;
    productionUnitId?: string;
  }) => {
    onSubmit({
      ...data,
      evidenceType: 'LEGAL_DOCUMENT',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setSelectedFile(f);
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div>
            <h3 className="font-black text-slate-900 text-sm">Thêm minh chứng số hóa OCOP</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đính kèm minh chứng cho bộ tiêu chí QĐ 148/QĐ-TTg
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('UPLOAD')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'UPLOAD'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Tải lên tệp thủ công</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AUTO_EXTRACT')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'AUTO_EXTRACT'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>⚡ Trích xuất từ HTX (Auto Cross-Ref)</span>
          </button>
        </div>

        {/* TAB 1: MANUAL UPLOAD */}
        {activeTab === 'UPLOAD' && (
          <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Chỉ tiêu OCOP liên quan *</label>
                <select
                  value={indicatorCode}
                  onChange={(e) => setIndicatorCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  {ALL_INDICATORS.map((ind) => (
                    <option key={ind.code} value={ind.code}>
                      {ind.code} - {ind.criterionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Loại minh chứng *</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="CERTIFICATE">Chứng nhận chất lượng (VietGAP, ISO...)</option>
                  <option value="LAB_REPORT">Phiếu kiểm nghiệm Lab / Dư lượng PHI</option>
                  <option value="PROCESS_PHOTO">Hình ảnh thực tế / Bao bì / Tem nhãn</option>
                  <option value="LEGAL_DOCUMENT">Văn bản pháp lý / Hợp đồng chuỗi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên tài liệu minh chứng *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Phiếu kiểm nghiệm ISO 17025 về an toàn thực phẩm..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tệp đính kèm (Bảo mật mã băm SHA-256) *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50'
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">
                        {selectedFile.name.split('.').pop()?.toUpperCase()}
                      </div>
                      <div className="text-left truncate">
                        <p className="font-bold text-slate-800 text-xs truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB &bull; Sẵn sàng tính băm SHA-256
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                    >
                      Đổi file
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                    <p className="font-bold text-slate-700 text-xs">Kéo thả file hoặc nhấp để chọn từ máy tính</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ PDF, JPG, PNG (Tối đa 50MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? 'Đang tải lên & mã hóa SHA-256...' : 'Lưu minh chứng'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: AUTO EXTRACT */}
        {activeTab === 'AUTO_EXTRACT' && (
          <AutoExtractInternalEvidenceTab
            onAttachEvidence={handleAutoExtractSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};
