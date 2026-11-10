import React, { useState, useEffect } from 'react';
import { X, CalendarDays, Sprout, MapPin, CircleCheck } from 'lucide-react';
import { CropSeason, CropSeasonFormData } from '@/services/cropSeasonApi';
import { ProductionUnit } from '@/services/farmPlotApi';

interface CropSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonToEdit: CropSeason | null;
  units: ProductionUnit[];
  onSubmit: (formData: CropSeasonFormData, id?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const CropSeasonModal: React.FC<CropSeasonModalProps> = ({
  isOpen,
  onClose,
  seasonToEdit,
  units,
  onSubmit,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [unitId, setUnitId] = useState('');
  const [crop, setCrop] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [seedSupplier, setSeedSupplier] = useState('');
  const [pucQuotaKg, setPucQuotaKg] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [phcCode, setPhcCode] = useState('');

  useEffect(() => {
    if (seasonToEdit) {
      setName(seasonToEdit.name);
      setUnitId(seasonToEdit.production_unit_id);
      setCrop(seasonToEdit.crop);
      setStartDate(seasonToEdit.start_date?.slice(0, 10) || '');
      setExpectedEndDate(seasonToEdit.expected_end_date?.slice(0, 10) || '');
      setSeedSupplier(seasonToEdit.seed_supplier || '');
      setPucQuotaKg(seasonToEdit.puc_quota_kg ? String(seasonToEdit.puc_quota_kg) : '');
      setBuyerName(seasonToEdit.buyer_contract_info?.buyer_name || '');
      setPhcCode(seasonToEdit.buyer_contract_info?.phc_code || '');
    } else {
      setName('');
      setUnitId(units[0]?.id || '');
      setCrop(units[0]?.crop || '');
      setStartDate(new Date().toISOString().slice(0, 10));
      const nextQuarter = new Date();
      nextQuarter.setMonth(nextQuarter.getMonth() + 4);
      setExpectedEndDate(nextQuarter.toISOString().slice(0, 10));
      setSeedSupplier('');
      setPucQuotaKg('');
      setBuyerName('');
      setPhcCode('');
    }
  }, [seasonToEdit, isOpen, units]);

  if (!isOpen) return null;

  const handleUnitChange = (id: string) => {
    setUnitId(id);
    const found = units.find((u) => u.id === id);
    if (found && !crop) {
      setCrop(found.crop);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitId || !crop.trim() || !startDate || !expectedEndDate) {
      alert('Vui lòng điền đầy đủ tất cả các trường bắt buộc');
      return;
    }

    if (new Date(expectedEndDate) <= new Date(startDate)) {
      alert('Ngày dự kiến kết thúc phải sau ngày bắt đầu gieo trồng');
      return;
    }

    await onSubmit(
      {
        name: name.trim(),
        production_unit_id: unitId,
        crop: crop.trim(),
        start_date: startDate,
        expected_end_date: expectedEndDate,
        seed_supplier: seedSupplier.trim() || null,
        puc_quota_kg: pucQuotaKg ? parseFloat(pucQuotaKg) : null,
        buyer_contract_info: (buyerName.trim() || phcCode.trim()) ? {
          buyer_name: buyerName.trim(),
          phc_code: phcCode.trim() || null,
        } : null,
      },
      seasonToEdit?.id
    );
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Quản lý mùa vụ canh tác</p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              {seasonToEdit ? 'Chỉnh sửa kế hoạch mùa vụ' : 'Khai báo mùa vụ canh tác mới'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Khởi tạo chu kỳ mùa vụ gắn liền với vùng sản xuất và quy trình VietGAP/OCOP.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3.5 px-6 py-5 text-xs">
            <div>
              <label className="mb-1 block font-bold text-slate-700">Tên mùa vụ *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="VD: Vụ Ớt Chuông Sweet Palermo Thu Đông 2026"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-700">Vùng sản xuất áp dụng *</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={unitId}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className={`${inputCls} pl-10`}
                  required
                >
                  <option value="">-- Chọn vùng sản xuất --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit_code} - {u.name} ({u.area} ha)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-700">Cây trồng & Giống *</label>
              <div className="relative">
                <Sprout className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className={`${inputCls} pl-10`}
                  placeholder="VD: Ớt chuông Sweet Palermo Đỏ F1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-bold text-slate-700">Ngày bắt đầu gieo trồng *</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`${inputCls} pl-10`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">Ngày dự kiến thu hoạch xong *</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                    className={`${inputCls} pl-10`}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-bold text-slate-700">Hãng giống / Cơ sở giống</label>
                <input
                  value={seedSupplier}
                  onChange={(e) => setSeedSupplier(e.target.value)}
                  className={inputCls}
                  placeholder="VD: Syngenta Seeds / F1 Bokken"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">Hạn mức sản lượng PUC Quota (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={pucQuotaKg}
                  onChange={(e) => setPucQuotaKg(e.target.value)}
                  className={inputCls}
                  placeholder="VD: 26250"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-bold text-slate-700">Doanh nghiệp bao tiêu / Thu mua</label>
                <input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className={inputCls}
                  placeholder="VD: Công ty CP Nông sản An Phú"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">Mã cơ sở đóng gói (PHC)</label>
                <input
                  value={phcCode}
                  onChange={(e) => setPhcCode(e.target.value)}
                  className={inputCls}
                  placeholder="VD: PHC-VN-LAMDONG-088"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800">
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Nhật ký canh tác, định danh đất đai và các đợt thu hoạch KCS sẽ được hạch toán theo mùa vụ này.
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : seasonToEdit ? 'Lưu thay đổi' : 'Khởi tạo mùa vụ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
