import React from 'react';
import { Member } from '@/types/memberTypes';
import { User, CreditCard } from 'lucide-react';

interface EditSectionPersonalProps {
  editingMember: Member;
  setEditingMember: React.Dispatch<React.SetStateAction<Member | null>>;
  fieldErrors: Record<string, string>;
}

export const EditSectionPersonal: React.FC<EditSectionPersonalProps> = ({
  editingMember,
  setEditingMember,
  fieldErrors,
}) => {
  return (
    <div className="space-y-5">
      {/* SECTION HEADER 1 */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <User className="w-4 h-4 text-blue-600" />
        <h4 className="text-[13px] font-extrabold uppercase text-slate-700 tracking-wider">
          Thông tin cá nhân &amp; Nhân thân
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <input
            id="field-full_name"
            type="text"
            required
            value={editingMember.full_name}
            onChange={(e) => setEditingMember({ ...editingMember, full_name: e.target.value })}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
              fieldErrors.full_name
                ? 'border-rose-300 ring-2 ring-rose-100'
                : 'border-slate-200 focus:border-blue-500'
            } rounded-lg text-sm text-slate-800 font-semibold`}
            placeholder="Nhập họ và tên đầy đủ"
          />
          {fieldErrors.full_name && (
            <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.full_name}</p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Nghề nghiệp</label>
          <input
            type="text"
            value={editingMember.occupation || ''}
            onChange={(e) => setEditingMember({ ...editingMember, occupation: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
            placeholder="Ví dụ: Nông dân sản xuất, Kỹ sư..."
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Giới tính</label>
          <select
            value={editingMember.gender}
            onChange={(e) =>
              setEditingMember({ ...editingMember, gender: e.target.value as any })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Ngày sinh</label>
          <input
            type="date"
            required
            value={editingMember.dob}
            onChange={(e) => setEditingMember({ ...editingMember, dob: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Trình độ học vấn</label>
          <input
            type="text"
            value={editingMember.education_level || ''}
            onChange={(e) =>
              setEditingMember({ ...editingMember, education_level: e.target.value })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
            placeholder="Ví dụ: 12/12, Trung cấp nông nghiệp, Đại học..."
          />
        </div>
      </div>

      {/* SUB-SECTION: ĐỊNH DANH */}
      <div className="pt-3 border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-slate-500" />
          <h5 className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">
            Thông tin định danh công dân
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Số CCCD / CMND <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-cccd"
              type="text"
              required
              value={editingMember.cccd}
              onChange={(e) => setEditingMember({ ...editingMember, cccd: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                fieldErrors.cccd
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500'
              } rounded-lg font-mono font-bold text-sm text-slate-800`}
              placeholder="12 chữ số CCCD"
            />
            {fieldErrors.cccd && (
              <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.cccd}</p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Ngày cấp</label>
            <input
              type="date"
              required
              value={editingMember.cccd_issue_date}
              onChange={(e) =>
                setEditingMember({ ...editingMember, cccd_issue_date: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Nơi cấp</label>
            <input
              type="text"
              required
              value={editingMember.cccd_issue_place}
              onChange={(e) =>
                setEditingMember({ ...editingMember, cccd_issue_place: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
              placeholder="Ví dụ: Cục Cảnh sát QLHC về TTXH"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
