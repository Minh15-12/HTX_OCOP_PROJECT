import React, { useState, useEffect } from 'react';
import { Member, MemberType, CapitalForm } from '@/types/memberTypes';
import { X, Save, AlertTriangle, User, MapPin, Wallet, Calculator } from 'lucide-react';

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
  const [editTab, setEditTab] = useState<'personal' | 'contact' | 'capital' | 'profit'>('personal');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && member) {
      setEditingMember({ ...member });
      setEditTab('personal');
      setFieldErrors({});
    } else {
      setEditingMember(null);
    }
  }, [isOpen, member]);

  if (!isOpen || !editingMember) return null;

  const validateEdit = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editingMember.full_name.trim()) errors.full_name = 'Họ tên không được để trống';
    if (!editingMember.cccd.trim()) errors.cccd = 'CCCD không được để trống';
    if (!editingMember.phone.trim()) errors.phone = 'SĐT không được để trống';
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      triggerToast('Vui lòng kiểm tra lại các trường bắt buộc!', 'danger');
      if (errors.full_name || errors.cccd) setEditTab('personal');
      else if (errors.phone) setEditTab('contact');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl translate-x-10 -translate-y-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-black text-blue-900">Cập nhật thông tin: {editingMember.full_name}</h3>
            <p className="text-xs text-blue-700 font-medium mt-1">Chỉnh sửa hồ sơ xã viên mã số {editingMember.member_code}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-colors relative z-10 shadow-sm border border-transparent hover:border-rose-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex px-4 pt-3 gap-2 bg-slate-50 border-b border-slate-200 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setEditTab('personal')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm flex items-center gap-2 transition-all border-x border-t ${
              editTab === 'personal'
                ? 'bg-white text-blue-700 border-slate-200 border-b-transparent shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'
            }`}
            style={editTab === 'personal' ? { marginBottom: '-1px' } : {}}
          >
            <User className={`w-4 h-4 ${editTab === 'personal' ? 'text-blue-600' : 'text-slate-400'}`} /> Cá nhân
            {fieldErrors.full_name || fieldErrors.cccd ? <AlertTriangle className="w-3.5 h-3.5 text-rose-500 ml-1" /> : null}
          </button>
          
          <button
            type="button"
            onClick={() => setEditTab('contact')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm flex items-center gap-2 transition-all border-x border-t ${
              editTab === 'contact'
                ? 'bg-white text-blue-700 border-slate-200 border-b-transparent shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'
            }`}
            style={editTab === 'contact' ? { marginBottom: '-1px' } : {}}
          >
            <MapPin className={`w-4 h-4 ${editTab === 'contact' ? 'text-blue-600' : 'text-slate-400'}`} /> Liên hệ
            {fieldErrors.phone ? <AlertTriangle className="w-3.5 h-3.5 text-rose-500 ml-1" /> : null}
          </button>
          
          <button
            type="button"
            onClick={() => setEditTab('capital')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm flex items-center gap-2 transition-all border-x border-t ${
              editTab === 'capital'
                ? 'bg-white text-blue-700 border-slate-200 border-b-transparent shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'
            }`}
            style={editTab === 'capital' ? { marginBottom: '-1px' } : {}}
          >
            <Wallet className={`w-4 h-4 ${editTab === 'capital' ? 'text-blue-600' : 'text-slate-400'}`} /> Vốn góp
          </button>
          
          <button
            type="button"
            onClick={() => setEditTab('profit')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm flex items-center gap-2 transition-all border-x border-t ${
              editTab === 'profit'
                ? 'bg-white text-blue-700 border-slate-200 border-b-transparent shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'
            }`}
            style={editTab === 'profit' ? { marginBottom: '-1px' } : {}}
          >
            <Calculator className={`w-4 h-4 ${editTab === 'profit' ? 'text-blue-600' : 'text-slate-400'}`} /> Lợi nhuận & NH
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
          {/* TAB 1: CÁ NHÂN */}
          {editTab === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingMember.full_name}
                    onChange={(e) => setEditingMember({ ...editingMember, full_name: e.target.value.toUpperCase() })}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.full_name ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-blue-500'} rounded-lg font-bold text-slate-800 transition-colors uppercase`}
                  />
                  {fieldErrors.full_name && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Giới tính</label>
                  <select
                    value={editingMember.gender}
                    onChange={(e) => setEditingMember({ ...editingMember, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày sinh</label>
                  <input
                    type="date"
                    required
                    value={editingMember.dob}
                    onChange={(e) => setEditingMember({ ...editingMember, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Trình độ học vấn</label>
                  <input
                    type="text"
                    value={editingMember.education_level || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, education_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Thông tin định danh</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Số CCCD <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingMember.cccd}
                      onChange={(e) => setEditingMember({ ...editingMember, cccd: e.target.value })}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.cccd ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-blue-500'} rounded-lg font-mono font-bold text-slate-800`}
                    />
                    {fieldErrors.cccd && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.cccd}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày cấp</label>
                    <input
                      type="date"
                      required
                      value={editingMember.cccd_issue_date}
                      onChange={(e) => setEditingMember({ ...editingMember, cccd_issue_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nơi cấp</label>
                    <input
                      type="text"
                      required
                      value={editingMember.cccd_issue_place}
                      onChange={(e) => setEditingMember({ ...editingMember, cccd_issue_place: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIÊN HỆ */}
          {editTab === 'contact' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Địa chỉ thường trú (Đầy đủ) <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={2}
                    required
                    value={editingMember.address}
                    onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-medium text-slate-800"
                  ></textarea>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Thông tin liên lạc</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại <span className="text-rose-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={editingMember.phone}
                      onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.phone ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-blue-500'} rounded-lg font-mono font-bold text-slate-800`}
                    />
                    {fieldErrors.phone && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={editingMember.email || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Zalo (SĐT)</label>
                    <input
                      type="text"
                      value={editingMember.zalo || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, zalo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook (Link)</label>
                    <input
                      type="text"
                      value={editingMember.facebook || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, facebook: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VỐN GÓP */}
          {editTab === 'capital' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại thành viên <span className="text-rose-500">*</span></label>
                  <select
                    value={editingMember.member_type}
                    onChange={(e) => setEditingMember({ ...editingMember, member_type: e.target.value as MemberType })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-semibold text-slate-800"
                  >
                    <option value="CHINH_THUC">Chính thức</option>
                    <option value="LIEN_KET_GOP_VON">Liên kết góp vốn</option>
                    <option value="LIEN_KET_KHONG_GOP_VON">Liên kết không góp vốn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Hình thức vốn <span className="text-rose-500">*</span></label>
                  <select
                    value={editingMember.capital_form}
                    onChange={(e) => setEditingMember({ ...editingMember, capital_form: e.target.value as CapitalForm })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                  >
                    <option value="TIEN_MAT">Tiền mặt / Chuyển khoản</option>
                    <option value="HIEN_VAT">Hiện vật / Quyền sử dụng đất</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Thông tin số tiền</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Vốn cam kết (VNĐ) <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      required
                      value={editingMember.committed_capital}
                      onChange={(e) => setEditingMember({ ...editingMember, committed_capital: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-black text-blue-900 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Đã thực góp (VNĐ) <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      required
                      value={editingMember.total_capital_contributed}
                      onChange={(e) => setEditingMember({ ...editingMember, contributed_capital: Number(e.target.value), total_capital_contributed: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg font-black text-emerald-700 text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Bằng chữ</label>
                    <input
                      type="text"
                      value={editingMember.capital_in_words || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, capital_in_words: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 italic font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày góp vốn <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={editingMember.contribution_date || editingMember.join_date}
                      onChange={(e) => setEditingMember({ ...editingMember, contribution_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LỢI NHUẬN & NGÂN HÀNG */}
          {editTab === 'profit' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tỷ lệ phân chia lợi nhuận <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.1}
                      required
                      value={editingMember.profit_share_rate}
                      onChange={(e) => setEditingMember({ ...editingMember, profit_share_rate: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 pr-8 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-slate-900"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Hình thức nhận lợi nhuận <span className="text-rose-500">*</span></label>
                  <div className="flex items-center gap-6 pt-2 font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editPayoutMethodRadio"
                        checked={editingMember.payout_method === 'CASH'}
                        onChange={() => setEditingMember({ ...editingMember, payout_method: 'CASH' })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Bằng tiền mặt</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editPayoutMethodRadio"
                        checked={editingMember.payout_method === 'BANK_TRANSFER'}
                        onChange={() => setEditingMember({ ...editingMember, payout_method: 'BANK_TRANSFER' })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Chuyển khoản</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Thông tin tài khoản ngân hàng</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên Ngân hàng</label>
                    <input
                      type="text"
                      placeholder="VD: Agribank, Vietcombank..."
                      value={editingMember.bank_name || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, bank_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Số tài khoản</label>
                    <input
                      type="text"
                      placeholder="Nhập STK ngân hàng"
                      value={editingMember.bank_account || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, bank_account: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên chủ tài khoản</label>
                  <input
                    type="text"
                    placeholder="Tên in trên thẻ ngân hàng"
                    value={editingMember.account_holder || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, account_holder: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-slate-700 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm về thành viên..."
                    value={editingMember.notes || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-medium text-slate-700"
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0 items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 text-sm transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 inline-flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Cập nhật Thông tin
          </button>
        </div>
      </div>
    </div>
  );
};
