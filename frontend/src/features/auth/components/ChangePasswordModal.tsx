import React, { useState } from 'react';
import { X, KeyRound, Check, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự');
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      setSuccessMessage('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Mật khẩu hiện tại không chính xác hoặc có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Đổi mật khẩu cá nhân</h2>
              <p className="text-xs text-slate-500">Bảo mật tài khoản HTX-OCOP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Mật khẩu hiện tại *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu đang sử dụng"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Mật khẩu mới *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Xác nhận mật khẩu mới *</label>
            <input
              type="password"
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
