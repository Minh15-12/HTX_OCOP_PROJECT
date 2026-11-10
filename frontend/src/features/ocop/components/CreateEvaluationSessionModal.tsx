import React, { useState } from 'react';
import { X, Calendar, Award, Building, Users } from 'lucide-react';

interface CreateEvaluationSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    session_code: string;
    session_name: string;
    council_level: 'DISTRICT' | 'PROVINCIAL' | 'CENTRAL';
    evaluation_date: string;
    location: string;
    notes?: string;
  }) => void;
  isSubmitting?: boolean;
}

export const CreateEvaluationSessionModal: React.FC<CreateEvaluationSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [sessionCode, setSessionCode] = useState(`HD-TN-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`);
  const [sessionName, setSessionName] = useState('');
  const [councilLevel, setCouncilLevel] = useState<'DISTRICT' | 'PROVINCIAL' | 'CENTRAL'>('PROVINCIAL');
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      session_code: sessionCode,
      session_name: sessionName,
      council_level: councilLevel,
      evaluation_date: evaluationDate,
      location,
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Khởi tạo Phiên Đánh giá OCOP mới</h3>
              <p className="text-xs text-slate-500 mt-0.5">Theo quy định Quyết định 148/QĐ-TTg & 1489/QĐ-TTg</p>
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
              <label className="block text-slate-700 font-bold mb-1">Mã phiên đánh giá *</label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Cấp Hội đồng thẩm định *</label>
              <select
                value={councilLevel}
                onChange={(e) => setCouncilLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
              >
                <option value="DISTRICT">Cấp Huyện (Đánh giá 3 sao)</option>
                <option value="PROVINCIAL">Cấp Tỉnh (Đánh giá 4 sao & đề xuất 5 sao)</option>
                <option value="CENTRAL">Cấp Trung Ương (Công nhận 5 sao quốc gia)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên phiên họp Hội đồng *</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="VD: Hội đồng Đánh giá & Phân hạng Sản phẩm OCOP Tỉnh Lâm Đồng Đợt 2"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Ngày tổ chức chấm *</label>
              <input
                type="date"
                value={evaluationDate}
                onChange={(e) => setEvaluationDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Địa điểm / Phòng họp</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Phòng họp số 1..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Ghi chú / Quyết định thành lập HĐ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Căn cứ Quyết định thành lập Hội đồng đánh giá phân hạng OCOP..."
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo Phiên Đánh Giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
