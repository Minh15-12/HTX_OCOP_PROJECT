import React, { useState } from 'react';
import { X, Recycle, AlertTriangle, CheckCircle2, Camera, ShieldCheck, Info } from 'lucide-react';
import { StockIssue } from '../../../types/inventory';

interface ReturnPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: StockIssue | null;
  onSubmit: (issueId: string, count: number, proofPhotoUrl?: string) => Promise<void>;
}

export const ReturnPackagingModal: React.FC<ReturnPackagingModalProps> = ({
  isOpen,
  onClose,
  issue,
  onSubmit,
}) => {
  const [count, setCount] = useState<number>(0);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [tripleRinsedConfirmed, setTripleRinsedConfirmed] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !issue) return null;

  const expected = issue.emptyBottlesExpected || 0;
  const alreadyReturned = issue.emptyBottlesReturned || 0;
  const remaining = Math.max(0, expected - alreadyReturned);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0) {
      setError('Vui lòng nhập số lượng vỏ chai/gói thuốc BVTV thu hồi hợp lệ');
      return;
    }
    if (!tripleRinsedConfirmed) {
      setError('Bắt buộc xác nhận quy trình súc rửa 3 lần theo quy định Thông tư 05/2016');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(issue.id, count, photoUrl.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi ghi nhận thu hồi vỏ bao bì');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wide uppercase">
                Ghi Nhận Thu Hồi Vỏ Bao Bì Thuốc BVTV
              </h3>
              <p className="text-[11px] text-emerald-200/90">
                Căn cứ TTLT 05/2016/TTLT-BNNPTNT-BTNMT & Tiêu chí OCOP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Thông tin phiếu xuất */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Mã phiếu xuất kho:</span>
              <span className="font-mono font-bold text-slate-900">{issue.issueCode}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Xã viên nhận vật tư:</span>
              <span className="font-bold text-slate-900">{issue.memberName || 'Xã viên HTX'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-700">Chỉ tiêu vỏ thuốc BVTV cần thu hồi:</span>
              <span className="font-mono font-extrabold text-emerald-800 text-sm">
                {expected} vỏ chai/gói
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Đã thu hồi trước đó:</span>
              <span className="font-mono font-bold text-slate-700">{alreadyReturned} vỏ</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-semibold text-amber-800">Còn lại cần thu hồi đủ:</span>
              <span className="font-mono font-extrabold text-amber-700">{remaining} vỏ</span>
            </div>
          </div>

          {/* Ô nhập số lượng thu hồi */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Số lượng vỏ chai/gói thu nộp đợt này <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={expected || 1000}
                value={count || ''}
                onChange={(e) => setCount(Number(e.target.value))}
                placeholder={`Nhập số vỏ thu hồi (còn thiếu: ${remaining})...`}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold text-slate-900"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                vỏ chai/gói
              </span>
            </div>
          </div>

          {/* Minh chứng ảnh chụp bể chứa / vỏ thuốc */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Link ảnh minh chứng bể chứa vỏ thuốc / súc rửa (Tùy chọn)
            </label>
            <div className="relative">
              <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://storage.htx.vn/proofs/packaging_return_12.jpg"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <p className="text-[10.5px] text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              Ảnh chụp làm minh chứng phục vụ Hội đồng thẩm định OCOP 4-5 sao (QĐ 148).
            </p>
          </div>

          {/* Cam kết súc rửa 3 lần */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tripleRinsedConfirmed}
                onChange={(e) => setTripleRinsedConfirmed(e.target.checked)}
                className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <div className="text-[11px] text-emerald-950 font-medium leading-relaxed">
                <span className="font-bold text-emerald-900">Xác nhận kỹ thuật: </span>
                Vỏ chai/bao bì đã được súc rửa sạch 3 lần ngay khi pha chế, nước rửa đã đổ vào bình phun, vỏ khô ráo và cho vào bể thu gom chất thải nguy hại của HTX.
              </div>
            </label>
          </div>

          {/* Footer nút bấm */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : 'Xác nhận thu hồi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
