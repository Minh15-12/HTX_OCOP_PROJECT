import React from 'react';
import { MemberWizardFormState } from './wizardTypes';

interface Step2Props {
  formData: MemberWizardFormState;
  onChange: (patch: Partial<MemberWizardFormState>) => void;
  fieldErrors: Record<string, string>;
  onClearError?: (field: string) => void;
}

export const MemberWizardStep2Contact: React.FC<Step2Props> = ({
  formData,
  onChange,
  fieldErrors,
  onClearError,
}) => {
  return (
    <div className="space-y-4">
      {/* Địa chỉ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="md:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Địa chỉ</h4>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Tỉnh/Thành phố</label>
          <select
            value={formData.province}
            onChange={(e) => onChange({ province: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
          >
            <option value="Lâm Đồng">Lâm Đồng</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Quận/Huyện</label>
          <select
            value={formData.district}
            onChange={(e) => onChange({ district: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
          >
            <option value="Huyện Lâm Hà">Huyện Lâm Hà</option>
            <option value="Đà Lạt">Đà Lạt</option>
            <option value="Bảo Lộc">Bảo Lộc</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Phường/Xã</label>
          <select
            value={formData.ward}
            onChange={(e) => onChange({ ward: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
          >
            <option value="Xã Mê Linh">Xã Mê Linh</option>
            <option value="Thị trấn Đinh Văn">Thị trấn Đinh Văn</option>
            <option value="Xã Đông Thanh">Xã Đông Thanh</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Địa chỉ chi tiết (Thôn/Số nhà) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.detail_address}
            onChange={(e) => {
              onChange({ detail_address: e.target.value });
              if (fieldErrors.detail_address && onClearError) onClearError('detail_address');
            }}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
              fieldErrors.detail_address ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
            } rounded-lg text-sm text-slate-700`}
            placeholder="VD: Thôn 2, Xã Mê Linh..."
          />
          {fieldErrors.detail_address && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.detail_address}</p>}
        </div>
      </div>

      {/* Liên lạc trực tuyến */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="md:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Liên lạc trực tuyến</h4>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Số điện thoại <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              onChange({ phone: e.target.value });
              if (fieldErrors.phone && onClearError) onClearError('phone');
            }}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
              fieldErrors.phone ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
            } rounded-lg text-sm text-slate-700 font-mono`}
            placeholder="10 chữ số"
          />
          {fieldErrors.phone && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email (Tùy chọn)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Zalo (Tùy chọn)</label>
          <input
            type="text"
            value={formData.zalo}
            onChange={(e) => onChange({ zalo: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
            placeholder="Số ĐT Zalo"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook (Tùy chọn)</label>
          <input
            type="text"
            value={formData.facebook}
            onChange={(e) => onChange({ facebook: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
            placeholder="Link hoặc Tên FB"
          />
        </div>
      </div>
    </div>
  );
};
