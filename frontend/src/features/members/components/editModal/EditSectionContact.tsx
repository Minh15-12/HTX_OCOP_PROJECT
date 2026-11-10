import React from 'react';
import { Member } from '@/types/memberTypes';
import { MapPin, Phone } from 'lucide-react';

interface EditSectionContactProps {
  editingMember: Member;
  setEditingMember: React.Dispatch<React.SetStateAction<Member | null>>;
  fieldErrors: Record<string, string>;
}

export const EditSectionContact: React.FC<EditSectionContactProps> = ({
  editingMember,
  setEditingMember,
  fieldErrors,
}) => {
  return (
    <div className="space-y-5">
      {/* SECTION HEADER 2 */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <MapPin className="w-4 h-4 text-emerald-600" />
        <h4 className="text-[13px] font-extrabold uppercase text-slate-700 tracking-wider">
          Địa chỉ thường trú &amp; Liên lạc
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Địa chỉ thường trú (Đầy đủ) <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="field-address"
            rows={2}
            required
            value={editingMember.address}
            onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm font-medium text-slate-800"
            placeholder="Số nhà, đường/thôn, xã/phường, quận/huyện, tỉnh/thành phố..."
          ></textarea>
        </div>
      </div>

      {/* SUB-SECTION: LIÊN LẠC */}
      <div className="pt-3 border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-slate-500" />
          <h5 className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">
            Kênh liên lạc trực tiếp
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Số điện thoại di động <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-phone"
              type="tel"
              required
              value={editingMember.phone}
              onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                fieldErrors.phone
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500'
              } rounded-lg font-mono font-bold text-sm text-slate-800`}
              placeholder="09xx xxx xxx"
            />
            {fieldErrors.phone && (
              <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email liên hệ</label>
            <input
              type="email"
              value={editingMember.email || ''}
              onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
              placeholder="ten@gmail.com"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Zalo (Số điện thoại)</label>
            <input
              type="text"
              value={editingMember.zalo || ''}
              onChange={(e) => setEditingMember({ ...editingMember, zalo: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-mono text-sm text-slate-700"
              placeholder="Số điện thoại đăng ký Zalo"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Facebook (Link trang cá nhân)</label>
            <input
              type="text"
              value={editingMember.facebook || ''}
              onChange={(e) => setEditingMember({ ...editingMember, facebook: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
