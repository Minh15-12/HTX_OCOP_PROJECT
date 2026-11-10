import React, { useState } from 'react';
import { X, Users, UserCheck, Shield, Check, Plus } from 'lucide-react';

interface EvaluatorOption {
  id: string;
  name: string;
  agency: string;
  title: string;
  role: 'CHAIRMAN' | 'SECRETARY' | 'REVIEWER' | 'MEMBER';
}

const DEFAULT_EVALUATORS_POOL: EvaluatorOption[] = [
  {
    id: 'eval-01',
    name: 'TS. Nguyễn Văn Hùng',
    agency: 'Sở Nông Nghiệp & PTNT',
    title: 'Phó Giám đốc Sở',
    role: 'CHAIRMAN',
  },
  {
    id: 'eval-02',
    name: 'ThS. Trần Thị Mai',
    agency: 'Chi cục Quản lý Chất lượng NLT&TS',
    title: 'Chi cục trưởng',
    role: 'REVIEWER',
  },
  {
    id: 'eval-03',
    name: 'KS. Lê Văn Cường',
    agency: 'Sở Khoa học & Công nghệ',
    title: 'Trưởng phòng Tiêu chuẩn Đo lường',
    role: 'REVIEWER',
  },
  {
    id: 'eval-04',
    name: 'CN. Phạm Thị Thủy',
    agency: 'Văn phòng Điều phối NTM Tỉnh',
    title: 'Chuyên viên chính',
    role: 'SECRETARY',
  },
  {
    id: 'eval-05',
    name: 'Bác sĩ Đỗ Tuấn Anh',
    agency: 'Trung tâm Kiểm soát Bệnh tật CDC',
    title: 'Trưởng khoa ATTP',
    role: 'MEMBER',
  },
];

interface AssignEvaluatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionName?: string;
  sessionId?: string;
  onSubmit: (data: { sessionId: string; selectedEvaluatorIds: string[] }) => void;
}

export const AssignEvaluatorsModal: React.FC<AssignEvaluatorsModalProps> = ({
  isOpen,
  onClose,
  sessionName = 'Phiên đánh giá Hội đồng',
  sessionId = 'sess-01',
  onSubmit,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleEvaluator = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 giám khảo cho Hội đồng');
      return;
    }
    onSubmit({ sessionId, selectedEvaluatorIds: selectedIds });
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
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Phân công Ban Giám khảo Hội đồng</h3>
              <p className="text-xs text-slate-500 mt-0.5">{sessionName}</p>
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
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-700">
              Đã chọn: <strong className="text-emerald-700">{selectedIds.length}</strong> giám khảo
            </span>
            <span className="text-[11px] text-slate-500">
              (Hội đồng OCOP tiêu chuẩn: 5–7 thành viên)
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {DEFAULT_EVALUATORS_POOL.map((evaluator) => {
              const isChecked = selectedIds.includes(evaluator.id);
              return (
                <div
                  key={evaluator.id}
                  onClick={() => toggleEvaluator(evaluator.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isChecked
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{evaluator.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {evaluator.title} • {evaluator.agency}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      evaluator.role === 'CHAIRMAN'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : evaluator.role === 'SECRETARY'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {evaluator.role === 'CHAIRMAN'
                      ? 'Chủ tịch HĐ'
                      : evaluator.role === 'SECRETARY'
                      ? 'Thư ký HĐ'
                      : 'Ủy viên HĐ'}
                  </span>
                </div>
              );
            })}
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98"
            >
              Lưu phân công ({selectedIds.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
