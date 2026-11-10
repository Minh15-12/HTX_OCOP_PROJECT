import React, { useState } from 'react';
import { X, Calendar, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { meetingApi, CreateMeetingPayload } from '@/services/meetingApi';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState<'ANNUAL' | 'EXTRAORDINARY' | 'REGULAR'>('ANNUAL');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'>('PLANNED');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề cuộc họp / đại hội');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateMeetingPayload = {
        title: title.trim(),
        meeting_type: meetingType,
        meeting_date: meetingDate,
        status,
        description: description.trim() || undefined,
      };

      await meetingApi.createMeeting(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi tạo cuộc họp');
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
            <h2 className="text-base font-bold text-slate-900">Thiết Lập Cuộc Họp / Đại Hội Mới</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Căn cứ theo Luật Hợp tác xã 2023 & Điều lệ HTX
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
              Tiêu đề cuộc họp / Đại hội <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đại hội thành viên thường niên năm 2026..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Loại hình cuộc họp
              </label>
              <select
                value={meetingType}
                onChange={(e: any) => setMeetingType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="ANNUAL">Đại hội thường niên</option>
                <option value="EXTRAORDINARY">Đại hội bất thường</option>
                <option value="REGULAR">Họp định kỳ HĐQT / Xã viên</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày tổ chức <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Trạng thái ban đầu
            </label>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="PLANNED">Dự kiến (Lên kế hoạch)</option>
              <option value="IN_PROGRESS">Đang diễn ra (Mở biểu quyết)</option>
              <option value="COMPLETED">Đã bế mạc (Khóa biểu quyết)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nội dung / Chương trình nghị sự / Dự thảo Nghị quyết
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú nội dung trọng tâm lấy ý kiến hoặc dự thảo nghị quyết..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
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
                  Đang khởi tạo...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Khởi tạo cuộc họp
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
