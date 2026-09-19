import React from 'react';
import { ShieldCheck, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SystemSettings } from '@/services/systemService';

interface Props {
  settings: SystemSettings;
  onChange: (field: keyof SystemSettings, value: any) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const SecuritySettingsCard: React.FC<Props> = ({ settings, onChange, onSave, isSaving }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Cài đặt bảo mật</h3>
            <p className="text-xs text-slate-500">Thiết lập các tùy chọn bảo mật hệ thống HTX</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onSave} isLoading={isSaving}>
          Cập nhật
        </Button>
      </div>

      <div className="p-5 space-y-4">
        {/* Toggle 2FA */}
        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-emerald-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Yêu cầu xác thực 2 lớp (2FA)</span>
            <span className="text-[11px] text-slate-500">Bắt buộc nhập mã OTP qua ứng dụng Authenticator khi đăng nhập</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.enable_2fa}
              onChange={(e) => onChange('enable_2fa', e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Toggle Lock Failed Login */}
        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-emerald-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Giới hạn đăng nhập sai</span>
            <span className="text-[11px] text-slate-500">Tự động tạm khóa tài khoản 15 phút khi nhập sai mật khẩu quá 5 lần</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.limit_failed_login}
              onChange={(e) => onChange('limit_failed_login', e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Toggle Auto Logout */}
        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-emerald-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Tự động đăng xuất khi không hoạt động</span>
            <span className="text-[11px] text-slate-500">Hệ thống sẽ xóa phiên đăng nhập nếu người dùng không tương tác</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.auto_logout_idle}
              onChange={(e) => onChange('auto_logout_idle', e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Idle timeout minutes */}
        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-700">Thời gian tự động đăng xuất</span>
          <div className="flex items-center gap-2">
            <select
              className="h-8 px-3 rounded border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-emerald-500"
              value={settings.idle_timeout_minutes}
              onChange={(e) => onChange('idle_timeout_minutes', parseInt(e.target.value))}
            >
              <option value={15}>15 phút</option>
              <option value={30}>30 phút</option>
              <option value={60}>60 phút</option>
              <option value={120}>120 phút</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
