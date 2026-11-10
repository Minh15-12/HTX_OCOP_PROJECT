import React, { useState } from 'react';
import { X, CheckCircle, ThumbsUp, ThumbsDown, MinusCircle, AlertCircle, Loader2 } from 'lucide-react';
import { meetingApi, Meeting, CastVotePayload } from '@/services/meetingApi';

interface CastVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onSuccess: () => void;
}

export const CastVoteModal: React.FC<CastVoteModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSuccess,
}) => {
  const [resolutionCode, setResolutionCode] = useState('NQ-01');
  const [resolutionType, setResolutionType] = useState<'REGULAR' | 'CRITICAL'>('REGULAR');
  const [choice, setChoice] = useState<'FOR' | 'AGAINST' | 'ABSTAIN'>('FOR');
  const [weight, setWeight] = useState<number>(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !meeting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!resolutionCode.trim()) {
      setErrorMsg('Vui lòng nhập mã nghị quyết biểu quyết');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CastVotePayload = {
        resolution_code: resolutionCode.trim().toUpperCase(),
        resolution_type: resolutionType,
        choice,
        weight: Number(weight) || 1.0,
      };

      await meetingApi.castVote(meeting.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.response?.data?.code === 'DUPLICATE_VOTE' || err?.message?.includes('biểu quyết')) {
        setErrorMsg('Bạn đã thực hiện biểu quyết cho nghị quyết này rồi (chống gian lận biểu quyết)');
      } else {
        setErrorMsg(err?.message || 'Có lỗi xảy ra khi ghi nhận phiếu biểu quyết');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bỏ Phiếu Biểu Quyết Nghị Quyết</h2>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {meeting.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mã Nghị quyết / Nội dung lấy ý kiến <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={resolutionCode}
              onChange={(e) => setResolutionCode(e.target.value)}
              placeholder="VD: NQ-01, NQ-2026-BAOCAO..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phân loại Nghị quyết (Luật HTX 2023 Điều 72) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setResolutionType('REGULAR')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  resolutionType === 'REGULAR'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold">Thông thường ( $\ge$ 50% )</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Kế hoạch SXKD, tài chính hàng năm</div>
              </button>
              <button
                type="button"
                onClick={() => setResolutionType('CRITICAL')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  resolutionType === 'CRITICAL'
                    ? 'bg-amber-50/80 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold">Trọng yếu ( $\ge$ 75% )</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Sửa Điều lệ, tổ chức lại, giải thể</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Ý kiến biểu quyết <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setChoice('FOR')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  choice === 'FOR'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${choice === 'FOR' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Tán thành</span>
              </button>

              <button
                type="button"
                onClick={() => setChoice('AGAINST')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  choice === 'AGAINST'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ThumbsDown className={`w-5 h-5 ${choice === 'AGAINST' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Không tán thành</span>
              </button>

              <button
                type="button"
                onClick={() => setChoice('ABSTAIN')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  choice === 'ABSTAIN'
                    ? 'bg-slate-100 border-slate-400 text-slate-800 shadow-xs ring-2 ring-slate-400/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MinusCircle className={`w-5 h-5 ${choice === 'ABSTAIN' ? 'text-slate-600' : 'text-slate-400'}`} />
                <span>Phiếu trắng</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trọng số biểu quyết (tỷ trọng vốn góp / cổ phần)
            </label>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Mặc định 1.0 (hoặc tỷ lệ vốn góp của thành viên theo Điều lệ HTX).
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Ghi nhận biểu quyết
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
