import React, { useState } from 'react';
import { X, Sparkles, Sprout, CheckCircle2, ChevronRight, PackageCheck, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CropSeason, fetchBomPresets, BomPreset, saveSeasonBoms } from '@/services/cropSeasonApi';
import { inventoryApi } from '@/services/inventoryApi';
import { useToast } from '@/components/ui/ToastNotification';

interface ApplyBomPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: CropSeason;
  totalAllocatedAreaM2: number;
  onSuccess: () => void;
}

export const ApplyBomPresetModal: React.FC<ApplyBomPresetModalProps> = ({
  isOpen,
  onClose,
  season,
  totalAllocatedAreaM2,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPresetCode, setSelectedPresetCode] = useState<string>('PRESET_SWEET_PALERMO');
  const [appliedAreaM2, setAppliedAreaM2] = useState<number>(totalAllocatedAreaM2 || 10000);

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ['bomPresets'],
    queryFn: () => fetchBomPresets(),
    enabled: isOpen,
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['materials', 'for-preset-match'],
    queryFn: () => inventoryApi.getMaterials(),
    enabled: isOpen,
  });

  React.useEffect(() => {
    if (isOpen) {
      setAppliedAreaM2(totalAllocatedAreaM2 > 0 ? totalAllocatedAreaM2 : 10000);
      if (season.crop?.toLowerCase().includes('cà chua')) {
        setSelectedPresetCode('PRESET_CHERRY_TOMATO');
      } else if (season.crop?.toLowerCase().includes('sầu riêng')) {
        setSelectedPresetCode('PRESET_DURIAN_VIETGAP');
      } else {
        setSelectedPresetCode('PRESET_SWEET_PALERMO');
      }
    }
  }, [isOpen, season, totalAllocatedAreaM2]);

  const activePreset = presets.find((p) => p.preset_code === selectedPresetCode) || presets[0];

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!activePreset) return;

      // Map các item trong preset sang vật tư thật của kho nếu có
      const itemsToSave = activePreset.items.map((item) => {
        let matId = item.material.material_id;
        let price = item.material.unit_price || 35000;

        // Nếu backend chưa map được ID thì tìm thử trong danh sách kho
        if (!matId && materials.length > 0) {
          const matched = materials.find((m) =>
            m.name.toLowerCase().includes(item.material.material_name.toLowerCase()) ||
            item.material.material_name.toLowerCase().includes(m.name.toLowerCase())
          );
          if (matched) {
            matId = matched.id;
            price = matched.unitPrice || price;
          } else {
            matId = materials[0]?.id || '';
          }
        }

        const plannedQty = Math.round(appliedAreaM2 * (item.standard_rate_per_sqm || 0.05) * 10) / 10;
        const totalCost = Math.round(plannedQty * price);

        return {
          material_id: matId || materials[0]?.id || '',
          stage_phase: item.stage_phase,
          standard_rate_per_sqm: item.standard_rate_per_sqm,
          planned_quantity: plannedQty > 0 ? plannedQty : 10,
          issued_quantity: 0,
          estimated_unit_price: price,
          estimated_total_cost: totalCost,
          notes: item.notes || `Áp dụng theo ${activePreset.preset_name}`,
        };
      });

      return saveSeasonBoms(season.id, itemsToSave as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonBoms', season.id] });
      showToast(`Đã áp dụng thành công ${activePreset?.preset_name || 'định mức'} vào mùa vụ!`);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi nạp định mức mẫu', 'error');
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-6 py-4.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-emerald-700">
                Thư viện Kỹ thuật Nông nghiệp &bull; VietGAP
              </p>
              <h3 className="mt-0.5 text-lg font-black text-slate-900">
                Nạp Định mức Vật tư Mẫu theo Cây trồng (BOM Preset)
              </h3>
              <p className="text-xs text-slate-500">
                Tự động tính toán nhu cầu phân bón, thuốc sinh học chuẩn theo quy trình khuyến nông.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* 1. Chọn Quy trình */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              1. Chọn Quy trình Canh tác VietGAP chuẩn
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {presets.map((preset) => {
                const isSelected = preset.preset_code === selectedPresetCode;
                return (
                  <div
                    key={preset.preset_code}
                    onClick={() => setSelectedPresetCode(preset.preset_code)}
                    className={`p-3 rounded-2xl border transition cursor-pointer select-none text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{preset.applicable_crop}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="font-semibold text-[11px] mt-1 line-clamp-2">
                        {preset.preset_name}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {preset.items.length} giai đoạn &bull; Chuẩn VietGAP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Cấu hình diện tích áp dụng */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block">2. Diện tích canh tác áp dụng</span>
              <span className="text-[11px] text-slate-500">
                Tự động nhân định mức m² để ra khối lượng dự toán kế hoạch
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="100"
                step="100"
                value={appliedAreaM2}
                onChange={(e) => setAppliedAreaM2(Math.max(100, Number(e.target.value)))}
                className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-right text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="font-bold text-slate-600 text-xs">m² ({(appliedAreaM2 / 10000).toFixed(2)} ha)</span>
            </div>
          </div>

          {/* 3. Chi tiết các dòng vật tư trong preset */}
          {activePreset && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold">
                  Chi tiết định mức: {activePreset.preset_name}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  {activePreset.items.length} nhóm vật tư
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {activePreset.items.map((item, idx) => {
                  const estQty = Math.round(appliedAreaM2 * item.standard_rate_per_sqm * 10) / 10;
                  const price = item.material.unit_price || 35000;
                  const estCost = Math.round(estQty * price);

                  return (
                    <div key={idx} className="p-3 bg-white hover:bg-slate-50/70 transition flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.material.material_name}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                            {item.stage_name}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-0.5">
                          {item.notes} &bull; Định mức: <span className="font-mono font-bold text-slate-700">{item.standard_rate_per_sqm}</span> {item.material.unit}/m²
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black font-mono text-emerald-800 text-xs">
                          {estQty.toLocaleString()} {item.material.unit}
                        </div>
                        <div className="text-[10.5px] font-mono text-slate-400">
                          ~{estCost.toLocaleString()} đ
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            disabled={!activePreset || applyMutation.isPending}
            onClick={() => applyMutation.mutate()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition cursor-pointer"
          >
            {applyMutation.isPending ? (
              <span>Đang nạp định mức...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Nạp định mức vào Kế hoạch mùa vụ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
