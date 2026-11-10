import React, { useState } from 'react';
import { X, Award, Star, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface IssueDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    decision_number: string;
    product_name: string;
    cooperative_name: string;
    application_code: string;
    council_level: 'DISTRICT' | 'PROVINCIAL' | 'CENTRAL';
    star_rating: number;
    effective_date: string;
    signer_name: string;
    signer_title: string;
    notes?: string;
  }) => void;
  isSubmitting?: boolean;
}

export const IssueDecisionModal: React.FC<IssueDecisionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const currentYear = new Date().getFullYear();
  const [decisionNumber, setDecisionNumber] = useState(`QĐ-UBND-${currentYear}-${Date.now().toString().slice(-3)}`);
  const [productName, setProductName] = useState('');
  const [cooperativeName, setCooperativeName] = useState('');
  const [applicationCode, setApplicationCode] = useState('');
  const [councilLevel, setCouncilLevel] = useState<'DISTRICT' | 'PROVINCIAL' | 'CENTRAL'>('PROVINCIAL');
  const [starRating, setStarRating] = useState<number>(4);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      decision_number: decisionNumber,
      product_name: productName,
      cooperative_name: cooperativeName,
      application_code: applicationCode,
      council_level: councilLevel,
      star_rating: starRating,
      effective_date: effectiveDate,
      signer_name: signerName,
      signer_title: signerTitle,
      notes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                Ban hành Quyết định Công nhận OCOP
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấp thẩm quyền UBND phê duyệt & cấp giấy chứng nhận 36 tháng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Số Quyết định *</label>
              <input
                type="text"
                value={decisionNumber}
                onChange={(e) => setDecisionNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Cấp Quyết định *</label>
              <select
                value={councilLevel}
                onChange={(e) => setCouncilLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="DISTRICT">UBND Cấp Huyện (3 sao)</option>
                <option value="PROVINCIAL">UBND Cấp Tỉnh (4 sao)</option>
                <option value="CENTRAL">Bộ Nông Nghiệp & PTNT (5 sao)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã hồ sơ OCOP *</label>
              <input
                type="text"
                value={applicationCode}
                onChange={(e) => setApplicationCode(e.target.value)}
                placeholder="VD: HS-OCOP-2026-001"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Hạng sao công nhận *</label>
              <select
                value={starRating}
                onChange={(e) => setStarRating(Number(e.target.value))}
                className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl font-black text-amber-900"
              >
                <option value={3}>⭐⭐⭐ 3 Sao (Cấp huyện)</option>
                <option value={4}>⭐⭐⭐⭐ 4 Sao (Cấp tỉnh)</option>
                <option value={5}>⭐⭐⭐⭐⭐ 5 Sao (Quốc gia)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên sản phẩm OCOP *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="VD: Ớt chuông Sweet Palermo Đỏ Đà Lạt"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Chủ thể Hợp tác xã *</label>
            <input
              type="text"
              value={cooperativeName}
              onChange={(e) => setCooperativeName(e.target.value)}
              placeholder="VD: Hợp tác xã Nông nghiệp Tân Tiến"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Người ký phê duyệt *</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Họ và tên người ký"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Chức vụ người ký *</label>
              <input
                type="text"
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                placeholder="VD: Phó Chủ tịch UBND Tỉnh"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Ngày có hiệu lực *</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1 italic">
              Thời hạn hiệu lực: 36 tháng kể từ ngày ban hành (hết hạn ngày{' '}
              {new Date(new Date(effectiveDate).setFullYear(new Date(effectiveDate).getFullYear() + 3))
                .toISOString()
                .slice(0, 10)}
              )
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Nội dung quyết định / Căn cứ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang ban hành...' : 'Ban hành Quyết định'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
