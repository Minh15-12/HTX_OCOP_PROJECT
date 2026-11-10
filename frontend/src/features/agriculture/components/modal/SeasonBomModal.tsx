import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, PackageCheck, DollarSign, Calculator } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CropSeason, CropSeasonBomItem, saveSeasonBoms } from '@/services/cropSeasonApi';
import { inventoryApi } from '@/services/inventoryApi';
import { useToast } from '@/components/ui/ToastNotification';

interface SeasonBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: CropSeason;
  existingBoms: CropSeasonBomItem[];
  onSuccess: () => void;
}

interface BomFormRow {
  material_id: string;
  stage_phase: string;
  standard_rate_per_sqm: number;
  planned_quantity: number;
  estimated_unit_price: number;
  estimated_total_cost: number;
  notes: string;
}

const PHASES = [
  { value: 'GENERAL', label: 'Toàn vụ chung' },
  { value: 'SEEDLING', label: '1. Ươm & Bén rễ' },
  { value: 'VEGETATIVE', label: '2. Sinh dưỡng thân lá' },
  { value: 'FLOWERING', label: '3. Ra hoa & Đậu quả' },
  { value: 'FRUITING', label: '4. Nuôi quả & Thu hoạch' },
];

export const SeasonBomModal: React.FC<SeasonBomModalProps> = ({
  isOpen,
  onClose,
  season,
  existingBoms,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [rows, setRows] = useState<BomFormRow[]>([]);

  // Lấy danh mục vật tư kho
  const { data: materials = [] } = useQuery({
    queryKey: ['materials', 'for-bom'],
    queryFn: () => inventoryApi.getMaterials(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      if (existingBoms && existingBoms.length > 0) {
        setRows(
          existingBoms.map((b) => ({
            material_id: b.material_id,
            stage_phase: b.stage_phase || 'GENERAL',
            standard_rate_per_sqm: Number(b.standard_rate_per_sqm) || 0,
            planned_quantity: Number(b.planned_quantity) || 1,
            estimated_unit_price: Number(b.estimated_unit_price) || 0,
            estimated_total_cost: Number(b.estimated_total_cost) || 0,
            notes: b.notes || '',
          }))
        );
      } else {
        // Khởi tạo hàng trống nếu chưa có BOM
        const defaultMat = materials[0];
        const defaultPrice = defaultMat?.unitPrice || 0;
        setRows([
          {
            material_id: defaultMat?.id || '',
            stage_phase: 'SEEDLING',
            standard_rate_per_sqm: 0,
            planned_quantity: 1,
            estimated_unit_price: defaultPrice,
            estimated_total_cost: defaultPrice,
            notes: '',
          },
        ]);
      }
    }
  }, [isOpen, existingBoms, materials]);

  const handleMaterialChange = (idx: number, matId: string) => {
    const mat = materials.find((m) => m.id === matId);
    setRows((prev) => {
      const next = [...prev];
      const price = mat?.unitPrice || next[idx].estimated_unit_price || 0;
      const qty = next[idx].planned_quantity || 1;
      next[idx] = {
        ...next[idx],
        material_id: matId,
        estimated_unit_price: price,
        estimated_total_cost: Math.round(qty * price),
      };
      return next;
    });
  };

  const handleQtyChange = (idx: number, qtyVal: string) => {
    const qty = parseFloat(qtyVal) || 0;
    setRows((prev) => {
      const next = [...prev];
      const price = next[idx].estimated_unit_price || 0;
      next[idx] = {
        ...next[idx],
        planned_quantity: qty,
        estimated_total_cost: Math.round(qty * price),
      };
      return next;
    });
  };

  const handlePriceChange = (idx: number, priceVal: string) => {
    const price = parseFloat(priceVal) || 0;
    setRows((prev) => {
      const next = [...prev];
      const qty = next[idx].planned_quantity || 0;
      next[idx] = {
        ...next[idx],
        estimated_unit_price: price,
        estimated_total_cost: Math.round(qty * price),
      };
      return next;
    });
  };

  const handleAddRow = () => {
    const firstMat = materials[0];
    setRows((prev) => [
      ...prev,
      {
        material_id: firstMat?.id || '',
        stage_phase: 'GENERAL',
        standard_rate_per_sqm: 0,
        planned_quantity: 10,
        estimated_unit_price: firstMat?.unitPrice || 0,
        estimated_total_cost: 10 * (firstMat?.unitPrice || 0),
        notes: '',
      },
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalBudget = rows.reduce((sum, r) => sum + (Number(r.estimated_total_cost) || 0), 0);

  const saveBomMutation = useMutation({
    mutationFn: (items: any[]) => saveSeasonBoms(season.id, items),
    onSuccess: () => {
      showToast('Đã lưu bảng dự toán định mức vật tư (BOM) mùa vụ thành công!');
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi lưu dự toán BOM', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rows.length === 0) {
      alert('Vui lòng thêm ít nhất một danh mục vật tư dự toán');
      return;
    }

    const invalid = rows.find((r) => !r.material_id || r.planned_quantity <= 0);
    if (invalid) {
      alert('Vui lòng chọn vật tư và nhập số lượng dự toán lớn hơn 0 cho tất cả các dòng');
      return;
    }

    saveBomMutation.mutate(rows);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Kế hoạch Vật tư &amp; Ngân sách Đầu vụ
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              Lập Dự toán Định mức Vật tư Đầu vào (BOM)
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Mùa vụ: <span className="font-bold text-slate-700">{season.name}</span>
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

        {/* Total Budget Banner */}
        <div className="bg-emerald-800 text-white px-6 py-3 flex items-center justify-between shrink-0 shadow-inner">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-semibold text-emerald-100">
              Tổng chi phí vật tư dự toán của mùa vụ:
            </span>
          </div>
          <span className="text-lg font-black font-mono tracking-tight text-white">
            {totalBudget.toLocaleString()} VNĐ
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                Danh sách vật tư dự toán ({rows.length} loại)
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dòng vật tư
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, idx) => {
                const selectedMat = materials.find((m) => m.id === row.material_id);

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center relative"
                  >
                    {/* 1. Loại Vật tư */}
                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Loại vật tư kho *
                      </label>
                      <select
                        value={row.material_id}
                        onChange={(e) => handleMaterialChange(idx, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                        required
                      >
                        <option value="">-- Chọn vật tư --</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Giai đoạn sinh trưởng */}
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Giai đoạn dùng
                      </label>
                      <select
                        value={row.stage_phase}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], stage_phase: val };
                            return next;
                          });
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none"
                      >
                        {PHASES.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Khối lượng dự toán */}
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Số lượng ({selectedMat?.unit || 'đơn vị'}) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={row.planned_quantity || ''}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                        placeholder="100"
                        required
                      />
                    </div>

                    {/* 4. Đơn giá */}
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Đơn giá (VNĐ)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={row.estimated_unit_price || ''}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                        placeholder="180000"
                      />
                    </div>

                    {/* 5. Thành tiền & Xóa */}
                    <div className="md:col-span-2 flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[11px] font-bold text-slate-500 mb-0.5">
                          Thành tiền
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          {Number(row.estimated_total_cost || 0).toLocaleString()} đ
                        </span>
                      </div>

                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center cursor-pointer shrink-0"
                          title="Xóa dòng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 shrink-0">
            <span className="text-xs text-slate-500">
              * Định mức BOM được liên thông để kiểm soát trần xuất kho vật tư cho xã viên (TT 71/2024/TT-BTC).
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saveBomMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
              >
                {saveBomMutation.isPending ? 'Đang lưu dự toán...' : 'Lưu bảng dự toán BOM'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
