import React from 'react';
import { Building, Mail, Phone, MapPin, Globe, Clock, Calendar, Shield, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SystemSettings } from '@/services/systemService';

interface Props {
  settings: SystemSettings;
  onChange: (field: keyof SystemSettings, value: any) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const SystemInfoCard: React.FC<Props> = ({ settings, onChange, onSave, isSaving }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
            <Building className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Thông tin hệ thống</h3>
            <p className="text-xs text-slate-500">Cấu hình thông tin cơ bản của hệ thống và tổ chức HTX</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="http://localhost:8000/docs/api" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" type="button">
              Test API (Swagger / Scalar)
            </Button>
          </a>
          <Button variant="primary" size="sm" onClick={onSave} isLoading={isSaving}>
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Logo preview */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mb-3 shadow-xs">
              <ImageIcon className="w-9 h-9" />
            </div>
            <span className="text-xs font-medium text-slate-700">Logo HTX</span>
            <p className="text-[11px] text-slate-400 text-center mt-1">PNG, JPG tối đa 2MB</p>
            <Button variant="secondary" size="sm" className="mt-3">
              Thay đổi logo
            </Button>
          </div>

          {/* Form fields */}
          <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên hệ thống"
              requiredAsterisk
              value={settings.system_name}
              onChange={(e) => onChange('system_name', e.target.value)}
            />

            <Input
              label="Đơn vị quản lý"
              requiredAsterisk
              value={settings.managing_unit}
              onChange={(e) => onChange('managing_unit', e.target.value)}
            />

            <div className="md:col-span-2">
              <Input
                label="Địa chỉ"
                requiredAsterisk
                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                value={settings.address}
                onChange={(e) => onChange('address', e.target.value)}
              />
            </div>

            <Input
              label="Email hỗ trợ"
              requiredAsterisk
              type="email"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={settings.support_email}
              onChange={(e) => onChange('support_email', e.target.value)}
            />

            <Input
              label="Số điện thoại"
              requiredAsterisk
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              value={settings.support_phone}
              onChange={(e) => onChange('support_phone', e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngôn ngữ mặc định</label>
              <select
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={settings.default_language}
                onChange={(e) => onChange('default_language', e.target.value)}
              >
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Múi giờ</label>
              <select
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={settings.timezone}
                onChange={(e) => onChange('timezone', e.target.value)}
              >
                <option value="(GMT+07:00) Asia/Ho_Chi_Minh">(GMT+07:00) Asia/Ho_Chi_Minh</option>
                <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Định dạng ngày</label>
              <select
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={settings.date_format}
                onChange={(e) => onChange('date_format', e.target.value)}
              >
                <option value="dd/mm/yyyy">dd/mm/yyyy</option>
                <option value="yyyy-mm-dd">yyyy-mm-dd</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phiên bản hệ thống</label>
              <input
                type="text"
                disabled
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-500 font-mono"
                value={settings.system_version}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
