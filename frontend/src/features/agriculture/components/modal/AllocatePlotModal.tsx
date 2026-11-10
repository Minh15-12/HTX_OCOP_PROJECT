import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Calendar, Calculator, AlertCircle, ShieldAlert } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CropSeason, allocateSeasonPlot, AllocatePlotFormData } from '@/services/cropSeasonApi';
import { FarmPlot } from '@/services/farmPlotApi';
import { getMembersFromApi } from '@/services/memberService';
import { useToast } from '@/components/ui/ToastNotification';

interface AllocatePlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: CropSeason;
  plots: FarmPlot[];
  onSuccess: () => void;
}

export const AllocatePlotModal: React.FC<AllocatePlotModalProps> = ({
  isOpen,
  onClose,
  season,
  plots,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [plotId, setPlotId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [allocatedArea, setAllocatedArea] = useState<string>('');
  const [cropVariety, setCropVariety] = useState<string>('Sweet Palermo Đỏ F1');
  const [plantingDate, setPlantingDate] = useState<string>('');
  const [expectedHarvestStart, setExpectedHarvestStart] = useState<string>('');
  const [expectedHarvestEnd, setExpectedHarvestEnd] = useState<string>('');
  const [targetYieldKg, setTargetYieldKg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Lấy danh sách thành viên HTX
  const { data: members = [] } = useQuery({
    queryKey: ['members', 'for-allocation'],
    queryFn: () => getMembersFromApi({ per_page: 100 }),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      const defaultStart = season.start_date ? season.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const harvestStart = new Date(defaultStart);
      harvestStart.setDate(harvestStart.getDate() + 75);
      const defaultHarvestStart = harvestStart.toISOString().slice(0, 10);
      const defaultHarvestEnd = season.expected_end_date ? season.expected_end_date.slice(0, 10) : defaultHarvestStart;

      const firstPlot = plots[0];
      const initialAreaNum = Number(firstPlot?.area || 0);
      const initialAreaM2 = initialAreaNum > 0 ? (initialAreaNum < 100 ? initialAreaNum * 10000 : initialAreaNum) : 3000;

      setPlotId(firstPlot?.id || '');
      setMemberId('');
      setAllocatedArea(String(initialAreaM2));
      setCropVariety(season.crop?.includes('Palermo') ? 'Sweet Palermo Đỏ F1' : season.crop || 'Ớt chuông F1');
      setPlantingDate(defaultStart);
      setExpectedHarvestStart(defaultHarvestStart);
      setExpectedHarvestEnd(defaultHarvestEnd);
      setTargetYieldKg(String(Math.round(initialAreaM2 * 4.5)));
      setNotes('');
    }
  }, [isOpen, season, plots]);

  // Khi người dùng đổi thửa đất
  const handlePlotChange = (selectedId: string) => {
    setPlotId(selectedId);
    const found = plots.find((p) => p.id === selectedId);
    if (found) {
      const areaNum = Number(found.area) || 0;
      const areaM2 = areaNum > 0 ? (areaNum < 100 ? areaNum * 10000 : areaNum) : 3000;
      setAllocatedArea(String(areaM2));
      setTargetYieldKg(String(Math.round(areaM2 * 4.5)));

      // Thử tìm xã viên liên kết
      const relMemberId = (found as any).land_relation?.member_id;
      if (relMemberId) {
        setMemberId(relMemberId);
      }
    }
  };

  // Tính lại ngày thu hoạch khi đổi ngày gieo
  const handlePlantingDateChange = (newDate: string) => {
    setPlantingDate(newDate);
    if (newDate) {
      const d = new Date(newDate);
      d.setDate(d.getDate() + 75);
      setExpectedHarvestStart(d.toISOString().slice(0, 10));
    }
  };

  // Tự động tính sản lượng mục tiêu
  const handleAutoCalculateYield = () => {
    const area = parseFloat(allocatedArea);
    if (!Number.isNaN(area) && area > 0) {
      const yieldKg = Math.round(area * 4.5);
      setTargetYieldKg(String(yieldKg));
      showToast(`Đã ước tính sản lượng cam kết: ${yieldKg.toLocaleString()} kg (Định mức 4.5 kg/m²)`);
    }
  };

  const allocateMutation = useMutation({
    mutationFn: (payload: AllocatePlotFormData) => allocateSeasonPlot(season.id, payload),
    onSuccess: (data) => {
      showToast(`Đã phân bổ thửa đất [${data.plot_code || 'thành công'}] vào mùa vụ!`);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi phân bổ thửa đất vào mùa vụ', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!plotId) {
      alert('Vui lòng chọn thửa đất tham gia vụ');
      return;
    }

    const area = parseFloat(allocatedArea);
    if (Number.isNaN(area) || area <= 0) {
      alert('Vui lòng nhập diện tích hợp lệ');
      return;
    }

    if (!plantingDate || !expectedHarvestStart || !expectedHarvestEnd) {
      alert('Vui lòng nhập đầy đủ ngày gieo hạt và khung thời gian thu hoạch');
      return;
    }

    if (new Date(expectedHarvestEnd) < new Date(expectedHarvestStart)) {
      alert('Ngày kết thúc thu hoạch phải sau ngày bắt đầu thu hoạch');
      return;
    }

    allocateMutation.mutate({
      plot_id: plotId,
      member_id: memberId || null,
      allocated_area: area,
      crop_variety: cropVariety.trim() || season.crop,
      planting_date: plantingDate,
      expected_harvest_start: expectedHarvestStart,
      expected_harvest_end: expectedHarvestEnd,
      target_yield_kg: targetYieldKg ? parseFloat(targetYieldKg) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  const selectedPlot = plots.find((p) => p.id === plotId);
  const isQuarantine = selectedPlot?.status === 'IN_QUARANTINE';

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Điều phối rải vụ &amp; Giao khoán
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              Phân bổ Thửa đất vào Mùa vụ
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Vụ: <span className="font-bold text-slate-700">{season.name}</span>
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

        {/* Warning if plot in quarantine */}
        {isQuarantine && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Lưu ý:</span> Thửa đất này đang trong thời gian cách ly thuốc BVTV (PHI). Cần đảm bảo ngày thu hoạch sau thời hạn cách ly an toàn.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-3.5 px-6 py-5 text-xs max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* 1. Chọn Thửa đất */}
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Thửa đất canh tác *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={plotId}
                  onChange={(e) => handlePlotChange(e.target.value)}
                  className={`${inputCls} pl-10`}
                  required
                >
                  <option value="">-- Chọn thửa đất --</option>
                  {plots.map((p) => {
                    const a = Number(p.area || 0);
                    const ha = a < 100 ? a : a / 10000;
                    const m2 = a < 100 ? a * 10000 : a;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.plot_code} - Diện tích: {ha.toLocaleString('vi-VN')} ha ({m2.toLocaleString('vi-VN')} m²) {p.status === 'IN_QUARANTINE' ? '(Đang cách ly PHI)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* 2. Chọn Xã viên phụ trách */}
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Xã viên nhận khoán phụ trách (Luật HTX 2023)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className={`${inputCls} pl-10`}
                >
                  <option value="">-- Chọn xã viên phụ trách --</option>
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.member_code} - {m.full_name || m.name} ({m.phone || 'SĐT: —'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Diện tích & Giống cây */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  Diện tích tham gia vụ (m²) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={allocatedArea}
                  onChange={(e) => setAllocatedArea(e.target.value)}
                  className={inputCls}
                  placeholder="3000"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  Giống cây cụ thể *
                </label>
                <input
                  type="text"
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  className={inputCls}
                  placeholder="Sweet Palermo Đỏ F1"
                  required
                />
              </div>
            </div>

            {/* 4. Lịch Xuống giống & Rải vụ */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  Điều phối Lịch Rải vụ (Staggered Planting)
                </span>
                <span className="text-[11px] font-normal text-emerald-700">
                  Lệch 10 - 15 ngày chống dội chợ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Ngày xuống giống *
                  </label>
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => handlePlantingDateChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Thu bói dự kiến *
                  </label>
                  <input
                    type="date"
                    value={expectedHarvestStart}
                    onChange={(e) => setExpectedHarvestStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Kết thúc thu hoạch *
                  </label>
                  <input
                    type="date"
                    value={expectedHarvestEnd}
                    onChange={(e) => setExpectedHarvestEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 5. Sản lượng cam kết bao tiêu */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Sản lượng cam kết giao nộp cho HTX (kg) *
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalculateYield}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  <Calculator className="w-3 h-3" />
                  Tính theo định mức (4.5 kg/m²)
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={targetYieldKg}
                onChange={(e) => setTargetYieldKg(e.target.value)}
                className={inputCls}
                placeholder="13500"
                required
              />
            </div>

            {/* 6. Ghi chú */}
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Ghi chú điều phối kỹ thuật
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputCls}
                placeholder="VD: Xuống giống đợt 2, luống 1-20, dùng giá thể xơ dừa xử lý EC..."
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={allocateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
            >
              {allocateMutation.isPending ? 'Đang lưu phân bổ...' : 'Xác nhận phân bổ thửa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
