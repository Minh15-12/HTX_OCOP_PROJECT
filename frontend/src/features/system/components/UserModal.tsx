import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Role, UserItem } from '@/services/systemService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  roles: Role[];
  userToEdit: UserItem | null;
  isLoading: boolean;
}

export const UserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  roles,
  userToEdit,
  isLoading,
}) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleCode, setRoleCode] = useState('HTX_STAFF');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrors({});
    if (userToEdit) {
      setUsername(userToEdit.username);
      setFullName(userToEdit.full_name);
      setEmail(userToEdit.email);
      setPhone(userToEdit.phone_number || '');
      setPassword('');
      const r = Array.isArray(userToEdit.roles) && userToEdit.roles.length > 0
        ? typeof userToEdit.roles[0] === 'string'
          ? userToEdit.roles[0]
          : userToEdit.roles[0].code
        : 'HTX_STAFF';
      setRoleCode(r);
    } else {
      setUsername('');
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('password123');
      setRoleCode('HTX_STAFF');
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    }
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không đúng định dạng (VD: user@htx.vn)';
    }
    if (!userToEdit && (!password || password.length < 6)) {
      newErrors.password = 'Mật khẩu khởi tạo phải có ít nhất 6 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      username: username.trim(),
      full_name: fullName.trim(),
      email: email.trim(),
      phone_number: phone.trim(),
      password: password || undefined,
      role_code: roleCode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">
            {userToEdit ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản người dùng mới'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <span className="font-bold">⚠️ Vui lòng sửa các lỗi sau:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                {Object.values(errors).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <Input
            label="Tên đăng nhập"
            requiredAsterisk
            disabled={Boolean(userToEdit)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            value={username}
            error={errors.username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
            }}
          />

          <Input
            label="Họ và tên"
            requiredAsterisk
            value={fullName}
            error={errors.fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
            }}
          />

          <Input
            label="Email"
            requiredAsterisk
            type="email"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
          />

          <Input
            label="Số điện thoại"
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {!userToEdit && (
            <Input
              label="Mật khẩu khởi tạo"
              requiredAsterisk
              type="password"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              value={password}
              error={errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vai trò trong hệ thống</label>
            <select
              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.code}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {userToEdit ? 'Lưu cập nhật' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
