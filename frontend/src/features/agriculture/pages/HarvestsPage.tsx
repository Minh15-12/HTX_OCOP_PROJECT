import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wheat,
  Plus,
  ShieldAlert,
  ShieldCheck,
  GitBranch,
  Printer,
  QrCode,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatNumber } from '@/utils/formatters';
import { useToast } from '@/components/ui/ToastNotification';
import { fetchHarvests, createHarvest } from '@/services/harvestApi';
import { getAllStoredPlots, type FarmPlot } from '@/services/farmPlotApi';
import { HarvestLabelPrintModal } from '../components/HarvestLabelPrintModal';
import type { HarvestItem, QualityGrade, QuickLabResult } from '@/types/agriculture';

export const HarvestsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHarvestForPrint, setSelectedHarvestForPrint] = useState<HarvestItem | null>(null);

  // Form State
  const [plotId, setPlotId] = useState('plot-101');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantityKg, setQuantityKg] = useState('1800');
  const [gradeAKg, setGradeAKg] = useState('1550');
  const [gradeBKg, setGradeBKg] = useState('250');
  const [rejectKg, setRejectKg] = useState('0');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('GRADE_A');
  const [brixLevel, setBrixLevel] = useState('8.2');
  const [uniformityRate, setUniformityRate] = useState('94.0');

  // Quick Lab Form
  const [quickLabResult, setQuickLabResult] = useState<QuickLabResult>('LAB_PASSED');
  const [labKitCode, setLabKitCode] = useState('KIT-RAPID-PEST-449');
  const [residuePpm, setResiduePpm] = useState('0.0');

  // Fetch plots for dropdown & real-time PHI checking
  const plots: FarmPlot[] = getAllStoredPlots();
  const selectedPlot = plots.find((p) => p.id === plotId || p.plot_code === plotId);

  // Real-time Gate Check PHI verification
  const isPhiViolated = Boolean(
    selectedPlot?.safe_harvest_date &&
      new Date(harvestDate) < new Date(selectedPlot.safe_harvest_date)
  );

  // Query Harvests
  const { data: harvestList = [], isLoading } = useQuery<HarvestItem[]>({
    queryKey: ['harvests'],
    queryFn: async () => {
      return fetchHarvests();
    },
  });

  // Create Harvest Mutation
  const createHarvestMutation = useMutation({
    mutationFn: async (payload: any) => {
      return createHarvest(payload);
    },
    onSuccess: (newItem: HarvestItem) => {
      showToast(
        `Ghi nhận thu hoạch thành công! Đã tự động sinh mã lô GS1: ${newItem.lot_code}`,
        'success'
      );
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Ghi nhận thu hoạch thất bại.', 'error');
    },
  });

  const columns: Column<HarvestItem>[] = [
    {
      key: 'harvest_code',
      header: 'Mã Lệnh Thu Hoạch',
      render: (item) => (
        <div>
          <span className="font-bold text-emerald-800">{item.harvest_code}</span>
          <div className="text-[11px] text-slate-400 font-mono">
            {formatDate(item.harvest_date)}
          </div>
        </div>
      ),
    },
    {
      key: 'lot_code',
      header: 'Mã Lô GS1 (Lot Code)',
      render: (item) => (
        <div>
          <span className="font-mono text-xs font-extrabold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-300">
            {item.lot_code}
          </span>
          <div className="text-[10px] text-slate-400 mt-0.5">Chuẩn GS1 Traceability</div>
        </div>
      ),
    },
    {
      key: 'plot_name',
      header: 'Thửa Đất / Vùng Trồng',
      render: (item) => (
        <div>
          <span className="text-xs font-bold text-slate-800">{item.plot_code}</span>
          <div className="text-[11px] text-slate-500">{item.plot_name}</div>
        </div>
      ),
    },
    {
      key: 'quantity_kg',
      header: 'Sản Lượng KCS',
      render: (item) => (
        <div>
          <span className="font-black text-slate-900 text-xs">
            {formatNumber(item.quantity_kg)} kg
          </span>
          <div className="text-[10.5px] text-slate-500 font-medium">
            Grade A: <strong className="text-emerald-700">{formatNumber(item.grade_a_kg || 0)} kg</strong>
            {item.grade_b_kg ? ` • B: ${formatNumber(item.grade_b_kg)} kg` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'quality_grade',
      header: 'Phẩm Cấp & KCS',
      render: (item) => (
        <div>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
              item.quality_grade === 'GRADE_A'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : item.quality_grade === 'GRADE_B'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {item.quality_grade === 'GRADE_A'
              ? 'GRADE A (Thượng hạng)'
              : item.quality_grade === 'GRADE_B'
              ? 'GRADE B (Tiêu chuẩn)'
              : 'REJECT'}
          </span>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Brix: {item.brix_level || 7.5}° • ĐĐ: {item.uniformity_rate || 90}%
          </div>
        </div>
      ),
    },
    {
      key: 'phi_status',
      header: 'Khóa PHI & Lab',
      render: (item) => (
        <div className="space-y-0.5">
          {item.is_phi_cleared ? (
            <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Gate PHI: Pass
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10.5px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <ShieldAlert className="w-3 h-3 text-rose-600" /> Chưa hết PHI
            </span>
          )}
          <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Quick Lab: Âm tính
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao Tác & Tem Nhãn',
      render: (item) => (
        <div className="flex items-center gap-2">
          {/* Button In Tem Nhãn */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedHarvestForPrint(item)}
            leftIcon={<Printer className="w-3.5 h-3.5 text-emerald-600" />}
            className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
          >
            In Tem QR
          </Button>

          {/* Button Cây Truy Xuất */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/agriculture/lots/${item.id}/traceability`)}
            leftIcon={<GitBranch className="w-3.5 h-3.5 text-cop-600" />}
            title="Xem cây phả hệ truy xuất nội bộ"
          >
            Cây Truy Xuất
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Thu Hoạch, KCS 3 Cấp & Mã Lô GS1"
        subtitle="Kiểm soát an toàn PHI Guard, kiểm nghiệm lab, phân hạng Grade A/B và in tem nhãn GS1 QR xuất xưởng cho HTX Tân Tiến"
        action={
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Ghi Nhận Thu Hoạch
          </Button>
        }
      />

      <DataTable columns={columns} data={harvestList} isLoading={isLoading} />

      {/* Modal Add Harvest with 3-Tier KCS */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ghi Nhận Thu Hoạch & Kiểm Soát KCS 3 Cấp (HTX Tân Tiến)"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              disabled={isPhiViolated || createHarvestMutation.isPending}
              isLoading={createHarvestMutation.isPending}
              onClick={() => {
                createHarvestMutation.mutate({
                  plot_id: plotId,
                  crop_season_id: 'season-palermo-01',
                  harvest_date: harvestDate,
                  quantity_kg: parseFloat(quantityKg) || 0,
                  grade_a_kg: parseFloat(gradeAKg) || 0,
                  grade_b_kg: parseFloat(gradeBKg) || 0,
                  reject_kg: parseFloat(rejectKg) || 0,
                  brix_level: parseFloat(brixLevel) || 8.0,
                  uniformity_rate: parseFloat(uniformityRate) || 90.0,
                  quality_grade: qualityGrade,
                  kcs_status: quickLabResult === 'LAB_PASSED' ? 'PASSED' : 'REJECTED',
                  kcs_gate_check: {
                    passed: !isPhiViolated,
                    phi_checked: true,
                    safe_harvest_date: selectedPlot?.safe_harvest_date || harvestDate,
                    harvest_date: harvestDate,
                    note: isPhiViolated ? 'Vi phạm ngày an toàn PHI' : 'Đối soát cổng hợp lệ',
                  },
                  kcs_quick_lab: {
                    test_result: quickLabResult,
                    kit_code: labKitCode,
                    residue_ppm: parseFloat(residuePpm) || 0,
                    tested_at: new Date().toISOString(),
                    tester_name: 'Tổ KCS HTX Tân Tiến',
                  },
                });
              }}
            >
              Xác Nhận Thu Hoạch & Sinh Mã Lô GS1
            </Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* HARD PHI BLOCK ALERT IF VIOLATED */}
          {isPhiViolated ? (
            <div className="p-4 bg-rose-100 border-2 border-rose-500 rounded-2xl text-rose-950 text-xs shadow-md animate-pulse">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-rose-900 uppercase">
                    🛑 Khóa an toàn PHI: Chặn thu hoạch hoàn toàn (ERR_HARVEST_PHI_VIOLATION)
                  </h4>
                  <p className="mt-1 leading-relaxed text-rose-900 font-semibold">
                    Thửa đất <strong>[{selectedPlot?.plot_code}]</strong> đang trong thời gian cách ly thuốc BVTV an toàn đến hết ngày{' '}
                    <span className="underline font-bold text-rose-950">{selectedPlot?.safe_harvest_date}</span>.
                    Lệnh thu hoạch vào ngày <span className="underline font-bold">{harvestDate}</span> vi phạm nghiêm trọng quy tắc an toàn BR-FARM-001 của HTX Tân Tiến và Thông tư 02/2024.
                  </p>
                  <p className="mt-1.5 font-bold text-rose-800">
                    Hệ thống đã khóa nút Xác nhận. Vui lòng dời ngày thu hoạch sau khi hết thời hạn cách ly!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Cấp 1 - Gate Check Hợp Lệ:</strong> Thửa đất đã vượt qua thời hạn cách ly an toàn PHI (hoặc không dùng thuốc BVTV có cách ly).
              </span>
            </div>
          )}

          {/* Plot & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chọn Thửa Đất Canh Tác <span className="text-rose-500">*</span>
              </label>
              <select
                value={plotId}
                onChange={(e) => setPlotId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plot_code} - {p.unit_name || 'Nhà kính Sweet Palermo'} {p.safe_harvest_date ? `(Cách ly đến ${p.safe_harvest_date})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Thu Hoạch <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Tier 2: Quick Lab Test */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Cấp 2 - Quick Lab: Kiểm Nghiệm Dư Lượng Nhanh
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kết quả test kit
                </label>
                <select
                  value={quickLabResult}
                  onChange={(e) => {
                    const res = e.target.value as QuickLabResult;
                    setQuickLabResult(res);
                    if (res === 'LAB_REJECTED') {
                      setQualityGrade('REJECT');
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="LAB_PASSED">ÂM TÍNH (Pass - An toàn)</option>
                  <option value="LAB_REJECTED">DƯƠNG TÍNH (Reject - Có chất cấm)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mã Kit Test Nhanh
                </label>
                <input
                  type="text"
                  value={labKitCode}
                  onChange={(e) => setLabKitCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Chỉ số dư lượng (ppm)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={residuePpm}
                  onChange={(e) => setResiduePpm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Tier 3: Grading & Quality */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-emerald-600" />
              Cấp 3 - Grading: Phân Loại Phẩm Cấp Nông Sản
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tổng SL (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantityKg}
                  onChange={(e) => {
                    const total = parseFloat(e.target.value) || 0;
                    setQuantityKg(e.target.value);
                    setGradeAKg(String(Math.round(total * 0.85)));
                    setGradeBKg(String(Math.round(total * 0.15)));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Grade A (kg)
                </label>
                <input
                  type="number"
                  value={gradeAKg}
                  onChange={(e) => setGradeAKg(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Grade B (kg)
                </label>
                <input
                  type="number"
                  value={gradeBKg}
                  onChange={(e) => setGradeBKg(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-amber-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Độ Brix (≥ 7.0°)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={brixLevel}
                  onChange={(e) => setBrixLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Độ đồng đều quả (≥ 90%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={uniformityRate}
                  onChange={(e) => setUniformityRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Xếp Hạng Phẩm Cấp KCS
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-800"
                >
                  <option value="GRADE_A">GRADE A (Thượng hạng: Brix ≥ 7°, Đồng đều ≥ 90%)</option>
                  <option value="GRADE_B">GRADE B (Tiêu chuẩn an toàn)</option>
                  <option value="REJECT">REJECT (Không đạt an toàn/Dư lượng)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Harvest Label Print Modal */}
      <HarvestLabelPrintModal
        isOpen={!!selectedHarvestForPrint}
        onClose={() => setSelectedHarvestForPrint(null)}
        harvest={selectedHarvestForPrint}
      />
    </div>
  );
};
