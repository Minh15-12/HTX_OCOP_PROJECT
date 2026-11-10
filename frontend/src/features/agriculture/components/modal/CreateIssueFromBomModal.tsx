import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Warehouse,
  Calendar,
  Users,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CropSeason, CropSeasonBomItem } from '@/services/cropSeasonApi';
import { inventoryApi } from '@/services/inventoryApi';
import { useToast } from '@/components/ui/ToastNotification';

interface CreateIssueFromBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: CropSeason;
  boms: CropSeasonBomItem[];
  allocatedPlots: any[];
  onSuccess: () => void;
}

const PHASES = [
  { value: 'ALL', label: 'Tất cả các giai đoạn' },
  { value: 'SEEDLING', label: '1. Ươm & Bén rễ' },
  { value: 'VEGETATIVE', label: '2. Sinh dưỡng thân lá' },
  { value: 'FLOWERING', label: '3. Ra hoa & Đậu quả' },
  { value: 'FRUITING', label: '4. Nuôi quả & Thu hoạch' },
];

export const CreateIssueFromBomModal: React.FC<CreateIssueFromBomModalProps> = ({
  isOpen,
  onClose,
  season,
  boms,
  allocatedPlots,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isCredit, setIsCredit] = useState<boolean>(true);
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [purpose, setPurpose] = useState<string>('');

  // Lấy danh sách các xã viên tham gia vụ
  const seasonMembers = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    allocatedPlots.forEach((p) => {
      const mId = p.member_id || p.member?.id;
      const mName = p.member_name || p.member?.user?.name || p.member?.code;
      if (mId && mName && !map.has(mId)) {
        map.set(mId, { id: mId, name: mName });
      }
    });
    return Array.from(map.values());
  }, [allocatedPlots]);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedPhase('ALL');
      setSelectedMemberId(seasonMembers[0]?.id || '');
      setIsCredit(true);
      setIssueDate(new Date().toISOString().slice(0, 10));
      setPurpose(`Cấp phát vật tư nông nghiệp phục vụ ${season.name}`);
    }
  }, [isOpen, season, seasonMembers]);

  // Lọc các dòng BOM theo giai đoạn đã chọn
  const filteredBoms = useMemo(() => {
    if (selectedPhase === 'ALL') return boms;
    return boms.filter((b) => b.stage_phase === selectedPhase);
  }, [boms, selectedPhase]);

  // Tính tổng giá trị phiếu xuất
  const totalIssueAmount = filteredBoms.reduce((sum, b) => {
    const remainingQty = Math.max(0, Number(b.planned_quantity || 0) - Number(b.issued_quantity || 0));
    return sum + remainingQty * (Number(b.estimated_unit_price) || 0);
  }, 0);

  const createIssueMutation = useMutation({
    mutationFn: async () => {
      const lines = filteredBoms
        .map((b) => {
          const remainingQty = Math.max(0, Number(b.planned_quantity || 0) - Number(b.issued_quantity || 0));
          return {
            material_id: b.material_id,
            quantity: remainingQty > 0 ? remainingQty : Number(b.planned_quantity || 1),
            unit_price: Number(b.estimated_unit_price) || 0,
            batch_code: undefined,
          };
        })
        .filter((l) => l.quantity > 0);

      if (lines.length === 0) {
        throw new Error('Không có dòng vật tư nào hợp lệ để tạo phiếu xuất kho');
      }

      return inventoryApi.createStockIssue({
        issue_date: issueDate,
        member_id: selectedMemberId || undefined,
        crop_season_id: season.id,
        is_credit: isCredit,
        purpose: purpose.trim() || `Xuất vật tư theo định mức mùa vụ ${season.name}`,
        lines: lines as any,
      });
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['seasonBoms', season.id] });
      queryClient.invalidateQueries({ queryKey: ['stockIssues'] });
      showToast(`Đã khởi tạo Phiếu xuất kho [${res?.id || res?.issue_number || 'Mới'}] thành công! Chờ thủ kho duyệt.`);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi tạo phiếu xuất kho', 'error');
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-md">
              <Warehouse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-teal-800">
                Tích hợp Mùa vụ &bull; Quản lý Kho Vật tư
              </p>
              <h3 className="mt-0.5 text-lg font-black text-slate-900">
                Lập Đề xuất Xuất kho Vật tư theo Định mức BOM
              </h3>
              <p className="text-xs text-slate-500">
                Tự động chuyển định mức phân bón, thuốc sang Phiếu xuất kho Mẫu 02-VT.
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
          {/* 1. Lọc Giai đoạn & Thông tin phiếu */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Giai đoạn sinh trưởng *</label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {PHASES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày lập phiếu xuất kho *</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Xã viên nhận vật tư</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Xuất chung cho đội kỹ thuật toàn vùng --</option>
                  {seasonMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phương thức thanh toán *</label>
                <select
                  value={isCredit ? 'CREDIT' : 'CASH'}
                  onChange={(e) => setIsCredit(e.target.value === 'CREDIT')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-emerald-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="CREDIT">Ứng trước vật tư / Trả chậm (Ghi nợ tự động)</option>
                  <option value="CASH">Thu tiền ngay (Tự động vào Sổ quỹ)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Diễn giải mục đích xuất</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="VD: Cấp phát phân bón bón lót đợt 1..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Danh mục vật tư xuất kho */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Danh mục Vật tư được đưa vào Phiếu xuất ({filteredBoms.length} món)</span>
              <span className="text-emerald-800 font-mono">
                Tổng dự kiến: {totalIssueAmount.toLocaleString()} VNĐ
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {filteredBoms.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Không có vật tư nào thuộc giai đoạn này trong bảng BOM.
                </div>
              ) : (
                filteredBoms.map((b) => {
                  const planned = Number(b.planned_quantity || 0);
                  const issued = Number(b.issued_quantity || 0);
                  const remaining = Math.max(0, planned - issued);
                  const price = Number(b.estimated_unit_price || 0);
                  const cost = remaining * price;

                  return (
                    <div key={b.id} className="p-3 bg-white hover:bg-slate-50/70 transition flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900">{b.material_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {b.sku} &bull; {b.unit} &bull; Kế hoạch: {planned} | Đã xuất: {issued}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black font-mono text-emerald-800 text-xs">
                          Xuất: {remaining > 0 ? remaining : planned} {b.unit}
                        </div>
                        <div className="text-[10.5px] font-mono text-slate-400">
                          ~{cost.toLocaleString()} đ
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
            disabled={filteredBoms.length === 0 || createIssueMutation.isPending}
            onClick={() => createIssueMutation.mutate()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition cursor-pointer"
          >
            {createIssueMutation.isPending ? (
              <span>Đang tạo phiếu xuất kho...</span>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Khởi tạo Phiếu xuất kho Mẫu 02-VT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
