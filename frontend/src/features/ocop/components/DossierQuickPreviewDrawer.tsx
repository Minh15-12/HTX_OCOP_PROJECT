import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, ChevronRight, FileCheck, X } from 'lucide-react';
import { OcopDossierItem } from '../../../services/ocopService';

interface DossierQuickPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: OcopDossierItem | null;
  onOpenQd148Modal: () => void;
}

export const DossierQuickPreviewDrawer: React.FC<DossierQuickPreviewDrawerProps> = ({
  isOpen,
  onClose,
  dossier,
  onOpenQd148Modal,
}) => {
  const navigate = useNavigate();
  const [previewTab, setPreviewTab] = useState<'overview' | 'eval' | 'evidences' | 'package'>('overview');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dossier) return null;

  return (
    <>
      {/* Semi-transparent Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Sheet / Panel */}
      <div
        id="dossier-preview-sheet"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">Xem Nhanh Hồ Sơ OCOP</span>
            <span className="pill-badge pill-amber text-[10px]">{dossier.statusLabel}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Đóng xem nhanh"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1 flex flex-col">
      {/* Header Product Card */}
      <div className="flex items-start justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img
              src={dossier.productImage || 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'}
              alt={dossier.productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm leading-tight">{dossier.productName}</h3>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Mã hồ sơ: {dossier.code}</div>
            <span className="pill-badge pill-amber text-[10px] mt-1">{dossier.statusLabel}</span>
          </div>
        </div>

        {/* Circular Gauge Score */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-600 flex flex-col items-center justify-center shrink-0 shadow-xs">
          <span className="text-xs font-black text-emerald-950">{dossier.progressPercent}%</span>
          <span className="text-[8px] text-emerald-700 font-bold uppercase">Hoàn thiện</span>
        </div>
      </div>

      {/* Preview Sub-Tabs */}
      <div className="flex items-center border-b text-xs font-bold text-slate-500 overflow-x-auto">
        <button
          onClick={() => setPreviewTab('overview')}
          className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
            previewTab === 'overview' ? 'border-emerald-700 text-emerald-900 font-black' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setPreviewTab('eval')}
          className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
            previewTab === 'eval' ? 'border-emerald-700 text-emerald-900 font-black' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Tự đánh giá
        </button>
        <button
          onClick={() => setPreviewTab('evidences')}
          className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
            previewTab === 'evidences' ? 'border-emerald-700 text-emerald-900 font-black' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Minh chứng
        </button>
        <button
          onClick={() => setPreviewTab('package')}
          className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
            previewTab === 'package' ? 'border-emerald-700 text-emerald-900 font-black' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Bộ hồ sơ
        </button>
      </div>

      {/* Tab 1: Overview */}
      {previewTab === 'overview' && (
        <div className="space-y-4 text-xs font-medium">
          {/* Product Info */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs border-b pb-1">Thông tin sản phẩm</h4>
            <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
              <span className="text-slate-500">Tên sản phẩm:</span>
              <span className="font-bold text-slate-900 text-right break-words">{dossier.productName}</span>
              <span className="text-slate-500">Nhóm sản phẩm:</span>
              <span className="font-semibold text-slate-800 text-right break-words">{dossier.productCategory}</span>
              <span className="text-slate-500">Mục tiêu OCOP:</span>
              <span className="font-bold text-amber-600 text-right">{dossier.targetStar} sao</span>
              <span className="text-slate-500">Điểm tự chấm:</span>
              <span className="font-bold text-emerald-700 text-right">{dossier.totalScore} / 100 điểm</span>
            </div>
          </div>

          {/* Subject HTX Info */}
          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-extrabold text-slate-900 text-xs border-b pb-1 flex items-center justify-between">
              <span>Thông tin chủ thể</span>
            </h4>
            <div className="space-y-1 text-[11.5px]">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 shrink-0">Tên chủ thể:</span>
                <span className="font-bold text-slate-900 text-right break-words">{dossier.subjectName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 shrink-0">Địa chỉ:</span>
                <span className="font-semibold text-slate-800 text-right break-words">{dossier.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người đại diện:</span>
                <span className="font-bold text-slate-900">{dossier.representative}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Eval */}
      {previewTab === 'eval' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <div className="text-[11px] text-emerald-800 font-bold">Tổng điểm tự đánh giá QĐ 148</div>
            <div className="text-2xl font-black text-emerald-950">{dossier.totalScore} <span className="text-xs font-semibold text-emerald-700">/ 100 điểm</span></div>
            <p className="text-[10px] text-emerald-700">Dự kiến đạt phân hạng {dossier.targetStar} sao cấp Tỉnh/Trung ương.</p>
          </div>
          <button
            onClick={() => navigate(`/ocop/dossiers/${dossier.id}`)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            Xem bảng chi tiết 3 phần tiêu chí <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab 3: Evidences */}
      {previewTab === 'evidences' && (
        <div className="space-y-3 text-xs">
          <p className="text-[11px] text-slate-500">Tình trạng tài liệu minh chứng theo tiêu chí QĐ 148:</p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Tiến độ nộp minh chứng:</span>
              <span className="font-bold text-slate-900">{dossier.progressPercent}% hoàn tất</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Chỉ tiêu bắt buộc (*):</span>
              <span className={`pill-badge ${dossier.mandatoryPassed ? 'pill-green' : 'pill-amber'} text-[10px]`}>
                {dossier.mandatoryPassed ? 'Đã đạt tiêu chuẩn cứng' : 'Cần bổ sung minh chứng'}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/ocop/dossiers/${dossier.id}`)}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-emerald-200 cursor-pointer"
          >
            Quản lý kho minh chứng chi tiết <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab 4: Package */}
      {previewTab === 'package' && (
        <div className="space-y-3 text-xs">
          <p className="text-[11px] text-slate-500">Danh mục thành phần bộ hồ sơ OCOP:</p>
          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Biểu mẫu 01: Đơn đề nghị đánh giá</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">QĐ 148</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Biểu mẫu 02: Phiếu tự đánh giá chấm điểm</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{dossier.totalScore}đ</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Biểu mẫu 03: Danh mục tài liệu minh chứng</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Bản số hóa</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t space-y-2 mt-auto">
        <button
          onClick={() => navigate(`/ocop/dossiers/${dossier.id}`)}
          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          Mở Workspace Chấm điểm OCOP &rsaquo;
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenQd148Modal}
            className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Xuất Biểu mẫu QĐ 148
          </button>
          <button
            onClick={() => navigate(`/ocop/dossiers/${dossier.id}`)}
            className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 cursor-pointer"
          >
            Xem toàn bộ hồ sơ
          </button>
        </div>
      </div>
    </div>
  </div>
</>
  );
};
