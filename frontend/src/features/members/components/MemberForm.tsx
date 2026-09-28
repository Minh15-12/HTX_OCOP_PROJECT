import React, { useState } from 'react';
import { Member, MemberType } from '@/types/memberTypes';
import { X, Save } from 'lucide-react';

interface MemberFormProps {
  initialData?: Partial<Member>;
  onSave: (data: Partial<Member>) => void;
  onCancel: () => void;
}

export const MemberForm: React.FC<MemberFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    full_name: '',
    phone: '',
    cccd: '',
    member_type: 'CHINH_THUC',
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData?.id ? 'Chỉnh sửa hồ sơ' : 'Thêm mới xã viên'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Họ và tên *</label>
              <input 
                name="full_name"
                required 
                value={formData.full_name || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                placeholder="Nhập họ và tên..."
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Số điện thoại *</label>
              <input 
                name="phone"
                required 
                value={formData.phone || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                placeholder="Nhập số ĐT..."
              />
            </div>
            
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Số CCCD *</label>
              <input 
                name="cccd"
                required 
                value={formData.cccd || ''} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                placeholder="12 chữ số..."
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Loại thành viên</label>
              <select 
                name="member_type"
                value={formData.member_type || 'CHINH_THUC'} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
              >
                <option value="CHINH_THUC">Thành viên Chính thức (Có góp vốn)</option>
                <option value="LIEN_KET_GOP_VON">Thành viên Liên kết Góp vốn</option>
                <option value="LIEN_KET_KHONG_GOP_VON">Thành viên Liên kết Không góp vốn</option>
              </select>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-800 text-sm">
            <strong>Lưu ý:</strong> Xã viên mới thêm sẽ ở trạng thái <strong>Chờ duyệt</strong>. Cần Ban giám đốc phê duyệt để chính thức trở thành thành viên.
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Lưu hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
