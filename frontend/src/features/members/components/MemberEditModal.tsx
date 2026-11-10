import React, { useState, useEffect, useRef } from 'react';
import { Member } from '@/types/memberTypes';
import { X, Save } from 'lucide-react';
import { EditSectionPersonal } from './editModal/EditSectionPersonal';
import { EditSectionContact } from './editModal/EditSectionContact';
import { EditSectionCapital } from './editModal/EditSectionCapital';
import { EditSectionProfit } from './editModal/EditSectionProfit';

interface MemberEditModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: Member) => void;
  triggerToast: (msg: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
}

export const MemberEditModal: React.FC<MemberEditModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
  triggerToast,
}) => {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Sync editing member data when modal opens
  useEffect(() => {
    if (isOpen && member) {
      setEditingMember({ ...member });
      setFieldErrors({});
    } else {
      setEditingMember(null);
    }
  }, [isOpen, member]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !editingMember) return null;

  const validateEdit = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editingMember.full_name?.trim()) errors.full_name = 'Họ tên không được để trống';
    if (!editingMember.cccd?.trim()) errors.cccd = 'CCCD không được để trống';
    if (!editingMember.phone?.trim()) errors.phone = 'SĐT không được để trống';
    if (!editingMember.address?.trim()) errors.address = 'Địa chỉ thường trú không được để trống';

    setFieldErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      triggerToast('Vui lòng kiểm tra lại các trường bắt buộc có đánh dấu đỏ!', 'danger');
      const firstErrorField = errorKeys[0];
      setTimeout(() => {
        const el = document.getElementById(`field-${firstErrorField}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 50);
      return false;
    }
    return true;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEdit()) {
      onSave(editingMember);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-edit-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/50 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl translate-x-10 -translate-y-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 id="member-edit-title" className="text-lg font-black text-blue-900">
              Cập nhật thông tin: {editingMember.full_name}
            </h3>
            <p className="text-xs text-blue-700 font-medium mt-1">
              Chỉnh sửa hồ sơ xã viên mã số <span className="font-mono font-bold">{editingMember.member_code}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-colors relative z-10 shadow-xs border border-transparent hover:border-rose-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          ref={formRef}
          onSubmit={handleSave}
          className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar"
        >
          {/* Section 1: Thông tin cá nhân & Định danh */}
          <EditSectionPersonal
            editingMember={editingMember}
            setEditingMember={setEditingMember}
            fieldErrors={fieldErrors}
          />

          {/* Section 2: Địa chỉ & Liên lạc */}
          <EditSectionContact
            editingMember={editingMember}
            setEditingMember={setEditingMember}
            fieldErrors={fieldErrors}
          />

          {/* Section 3: Vốn góp điều lệ */}
          <EditSectionCapital
            editingMember={editingMember}
            setEditingMember={setEditingMember}
          />

          {/* Section 4: Lợi nhuận & Ngân hàng */}
          <EditSectionProfit
            editingMember={editingMember}
            setEditingMember={setEditingMember}
          />
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0 items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 text-sm transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Cập nhật Thông tin
          </button>
        </div>
      </div>
    </div>
  );
};
