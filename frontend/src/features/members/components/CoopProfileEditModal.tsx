import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Loader2 } from 'lucide-react';
import { Cooperative } from '@/types/tenant';

interface CoopProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cooperative: Cooperative | null;
  onSave: (data: Partial<Cooperative>) => Promise<void>;
  isSubmitting?: boolean;
}

export const CoopProfileEditModal: React.FC<CoopProfileEditModalProps> = ({
  isOpen,
  onClose,
  cooperative,
  onSave,
  isSubmitting = false,
}) => {
  const [legalName, setLegalName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [shortName, setShortName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cooperative && isOpen) {
      setLegalName(cooperative.legal_name || '');
      setTaxCode(cooperative.tax_code || (cooperative as any).legal_information?.tax_code || '');
      setShortName(cooperative.short_name || cooperative.display_name || '');
      setAddress(cooperative.address || (cooperative as any).contact_information?.address || '');
      setPhone(cooperative.phone || cooperative.phone_number || (cooperative as any).contact_information?.phone_number || '');
      setEmail((cooperative as any).email || (cooperative as any).contact_information?.email || '');
      setRepresentativeName(cooperative.representative_name || (cooperative as any).legal_information?.representative_name || '');
      setErrors({});
    }
  }, [cooperative, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!legalName.trim()) {
      newErrors.legalName = 'Vui lòng nhập tên pháp nhân Hợp tác xã';
    }
    if (!taxCode.trim()) {
      newErrors.taxCode = 'Vui lòng nhập Mã số thuế / Mã số HTX';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSave({
      legal_name: legalName.trim(),
      tax_code: taxCode.trim(),
      short_name: shortName.trim(),
      display_name: shortName.trim() || legalName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      phone_number: phone.trim(),
      email: email.trim(),
      representative_name: representativeName.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Chỉnh sửa Hồ sơ Pháp nhân HTX</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật thông tin đăng ký kinh doanh & đại diện pháp luật
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Tên pháp nhân đầy đủ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => {
                setLegalName(e.target.value);
                if (errors.legalName) setErrors((prev) => ({ ...prev, legalName: '' }));
              }}
              placeholder="VD: HỢP TÁC XÃ NÔNG NGHIỆP XANH PHÚ THỊNH"
              className={`w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800 uppercase focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                errors.legalName ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
              }`}
            />
            {errors.legalName && (
              <p className="text-red-600 text-[11px] mt-1 font-semibold">{errors.legalName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Mã số thuế / Mã số HTX <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={taxCode}
                onChange={(e) => {
                  setTaxCode(e.target.value);
                  if (errors.taxCode) setErrors((prev) => ({ ...prev, taxCode: '' }));
                }}
                placeholder="VD: 5801458921"
                className={`w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                  errors.taxCode ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                }`}
              />
              {errors.taxCode && (
                <p className="text-red-600 text-[11px] mt-1 font-semibold">{errors.taxCode}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên viết tắt / Tên giao dịch</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="VD: HTX Phú Thịnh"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Địa chỉ trụ sở chính</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Số 12 Hòn Bồ, Phường 12, TP. Đà Lạt, Tỉnh Lâm Đồng"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912 345 678"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email chính thức</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: info@htxphuthinh.vn"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Người đại diện pháp luật (Chủ tịch / Giám đốc)</label>
            <input
              type="text"
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              placeholder="VD: Mai Văn Tân"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
