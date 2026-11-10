import React from 'react';
import { MemberWizardFormState } from './wizardTypes';

interface Step1Props {
  formData: MemberWizardFormState;
  onChange: (patch: Partial<MemberWizardFormState>) => void;
  fieldErrors: Record<string, string>;
  onClearError?: (field: string) => void;
}

export const MemberWizardStep1Personal: React.FC<Step1Props> = ({
  formData,
  onChange,
  fieldErrors,
  onClearError,
}) => {
  return (
    <div className="space-y-4">
      {/* Thông tin Cơ bản */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="md:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Thông tin Cơ bản</h4>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => {
              onChange({ full_name: e.target.value.toUpperCase() });
              if (fieldErrors.full_name && onClearError) onClearError('full_name');
            }}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
              fieldErrors.full_name ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
            } rounded-lg text-sm font-bold text-slate-800 transition-colors uppercase`}
            placeholder="NGUYỄN VĂN A"
          />
          {fieldErrors.full_name && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.full_name}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Giới tính <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => onChange({ gender: e.target.value as 'Nam' | 'Nữ' | 'Khác' })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Ngày sinh <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => {
              onChange({ dob: e.target.value });
              if (fieldErrors.dob && onClearError) onClearError('dob');
            }}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
              fieldErrors.dob ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
            } rounded-lg text-sm text-slate-700`}
          />
          {fieldErrors.dob && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.dob}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Nghề nghiệp hiện tại</label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => onChange({ occupation: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
            placeholder="VD: Nông dân, Kỹ sư..."
          />
        </div>
      </div>

      {/* Định danh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="md:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Định danh</h4>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Số CCCD/CMND <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.cccd}
            onChange={(e) => {
              onChange({ cccd: e.target.value });
              if (fieldErrors.cccd && onClearError) onClearError('cccd');
            }}
            maxLength={12}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
              fieldErrors.cccd ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
            } rounded-lg text-sm text-slate-700 font-mono`}
            placeholder="Đúng 12 chữ số"
          />
          {fieldErrors.cccd && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.cccd}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Ngày cấp <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={formData.cccd_issue_date}
            onChange={(e) => {
              onChange({ cccd_issue_date: e.target.value });
              if (fieldErrors.cccd_issue_date && onClearError) onClearError('cccd_issue_date');
            }}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
              fieldErrors.cccd_issue_date ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
            } rounded-lg text-sm text-slate-700`}
          />
          {fieldErrors.cccd_issue_date && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.cccd_issue_date}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nơi cấp <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.cccd_issue_place}
            onChange={(e) => {
              onChange({ cccd_issue_place: e.target.value });
              if (fieldErrors.cccd_issue_place && onClearError) onClearError('cccd_issue_place');
            }}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
              fieldErrors.cccd_issue_place ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
            } rounded-lg text-sm text-slate-700`}
            placeholder="VD: Cục Cảnh sát QLHC về trật tự xã hội"
          />
          {fieldErrors.cccd_issue_place && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.cccd_issue_place}</p>}
        </div>
      </div>
    </div>
  );
};
