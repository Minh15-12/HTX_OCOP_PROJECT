import React from 'react';
import { Briefcase, Save } from 'lucide-react';
import { SystemSettings } from '@/services/systemService';

interface BusinessSettingsCardProps {
  settings: SystemSettings;
  onChange: (field: keyof SystemSettings, value: any) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const BusinessSettingsCard: React.FC<BusinessSettingsCardProps> = ({
  settings,
  onChange,
  onSave,
  isSaving,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-800">Cấu hình Nghiệp vụ HTX</h2>
        </div>
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Vốn góp & Thành viên</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Vốn góp tối thiểu (VNĐ)</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                value={settings.min_capital_contribution || 10000000}
                onChange={(e) => onChange('min_capital_contribution', Number(e.target.value))}
              />
              <p className="text-[11px] text-slate-400 mt-1">Mức vốn góp bắt buộc đối với xã viên chính thức khi gia nhập HTX.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Hoạt động & Dịch vụ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tỷ lệ phí dịch vụ HTX (%)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                value={settings.service_fee_rate || 2.5}
                onChange={(e) => onChange('service_fee_rate', Number(e.target.value))}
              />
              <p className="text-[11px] text-slate-400 mt-1">Phần trăm trích lại từ doanh thu bán nông sản để bù đắp chi phí vận hành HTX.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 mb-4">Phân chia Lợi nhuận (Theo Luật HTX 2023)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tỷ lệ cho Xã viên (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                value={settings.profit_share_member_rate ?? 70}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  const val = isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
                  onChange('profit_share_member_rate', val);
                  onChange('profit_share_coop_rate', 100 - val);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tỷ lệ giữ lại HTX (%)</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium bg-slate-100 cursor-not-allowed"
                value={settings.profit_share_coop_rate || 30}
                disabled
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Theo nghị quyết Đại hội thành viên, mặc định phân chia 70% cho xã viên (theo mức độ sử dụng dịch vụ và vốn góp), 30% giữ lại trích lập các quỹ HTX.</p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Lưu cấu hình nghiệp vụ</span>
        </button>
      </div>
    </div>
  );
};
