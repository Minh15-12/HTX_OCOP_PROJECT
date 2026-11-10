import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateSurplusPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    financial_year: number;
    total_surplus: number;
    distributable_surplus: number;
    capital_weight: number;
    service_usage_weight: number;
    custom_plan_code: string;
  }) => void;
  isPending: boolean;
}

export const CreateSurplusPlanModal: React.FC<CreateSurplusPlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}) => {
  const [createForm, setCreateForm] = useState({
    financial_year: new Date().getFullYear(),
    total_surplus: 0,
    distributable_surplus: 0,
    capital_weight: 49,
    service_usage_weight: 51,
    custom_plan_code: `PADP-${new Date().getFullYear()}-01`,
  });

  React.useEffect(() => {
    if (isOpen) {
      setCreateForm({
        financial_year: new Date().getFullYear(),
        total_surplus: 0,
        distributable_surplus: 0,
        capital_weight: 49,
        service_usage_weight: 51,
        custom_plan_code: `PADP-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      financial_year: Number(createForm.financial_year),
      total_surplus: Number(createForm.total_surplus),
      distributable_surplus: Number(createForm.distributable_surplus),
      capital_weight: Number(createForm.capital_weight),
      service_usage_weight: Number(createForm.service_usage_weight),
      custom_plan_code: createForm.custom_plan_code,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Phân hệ Tài chính HTX
            </p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900">
              Khai báo Đợt Phân chia Thặng dư Mới
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-400 shadow-xs hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mã Đợt / Phương án Phân chia *
            </label>
            <input
              type="text"
              value={createForm.custom_plan_code}
              onChange={(e) =>
                setCreateForm({ ...createForm, custom_plan_code: e.target.value })
              }
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold bg-slate-50 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Niên độ Kế toán *
              </label>
              <input
                type="number"
                value={createForm.financial_year}
                onChange={(e) =>
                  setCreateForm({ ...createForm, financial_year: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tổng Thặng dư (đ) *
              </label>
              <input
                type="number"
                value={createForm.total_surplus}
                onChange={(e) =>
                  setCreateForm({ ...createForm, total_surplus: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Thặng dư Khả dụng Phân chia (đ) *
            </label>
            <input
              type="number"
              value={createForm.distributable_surplus}
              onChange={(e) =>
                setCreateForm({ ...createForm, distributable_surplus: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 border border-emerald-300 bg-emerald-50/20 rounded-xl text-xs font-bold text-emerald-900 outline-none"
              required
            />
            <p className="text-[10.5px] text-slate-400 mt-1">
              Đã khấu trừ Quỹ chung không chia tối thiểu 5%
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tỷ trọng Dịch vụ nội bộ (%) *
              </label>
              <input
                type="number"
                min={51}
                max={100}
                value={createForm.service_usage_weight}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    service_usage_weight: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 border border-blue-300 rounded-xl text-xs font-bold text-blue-900 outline-none"
                required
              />
              <span className="text-[10px] text-blue-700 font-bold block mt-0.5">
                ≥ 51% Luật HTX 2023
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tỷ trọng Vốn góp (%) *
              </label>
              <input
                type="number"
                max={49}
                value={createForm.capital_weight}
                onChange={(e) =>
                  setCreateForm({ ...createForm, capital_weight: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ≤ 49% Phần còn lại
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
            >
              {isPending ? 'Đang tạo...' : 'Tạo đợt phân chia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
