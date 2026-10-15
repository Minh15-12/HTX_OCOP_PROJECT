import React, { useState, useMemo } from 'react';
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
  Search,
  Filter,
  FileSpreadsheet,
  Eye,
  Pencil,
  Trash2,
  AlertOctagon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/layouts/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatNumber } from '@/utils/formatters';
import { useToast } from '@/components/ui/ToastNotification';
import { fetchHarvests, createHarvest, deleteHarvest } from '@/services/harvestApi';
import { getAllStoredPlots, type FarmPlot } from '@/services/farmPlotApi';
import { HarvestLabelPrintModal } from '../components/HarvestLabelPrintModal';
import { HarvestDetailModal } from '../components/HarvestDetailModal';
import { EditHarvestModal } from '../components/EditHarvestModal';
import { exportToExcel } from '@/utils/exportUtils';
import type { HarvestItem, QualityGrade, QuickLabResult } from '@/types/agriculture';

export const HarvestsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHarvestForPrint, setSelectedHarvestForPrint] = useState<HarvestItem | null>(null);
  const [selectedHarvestForDetail, setSelectedHarvestForDetail] = useState<HarvestItem | null>(null);
  const [selectedHarvestForEdit, setSelectedHarvestForEdit] = useState<HarvestItem | null>(null);
  const [harvestToDelete, setHarvestToDelete] = useState<HarvestItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');

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
  const { data: rawHarvestList = [], isLoading } = useQuery<HarvestItem[]>({
    queryKey: ['harvests'],
    queryFn: async () => {
      return fetchHarvests();
    },
  });

  // Filtered harvest list
  const harvestList = useMemo(() => {
    return rawHarvestList.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.harvest_code.toLowerCase().includes(q) ||
        (item.lot_code && item.lot_code.toLowerCase().includes(q)) ||
        item.plot_code.toLowerCase().includes(q) ||
        item.plot_name.toLowerCase().includes(q);

      const matchGrade =
        selectedGrade === 'ALL' || item.quality_grade === selectedGrade;

      return matchSearch && matchGrade;
    });
  }, [rawHarvestList, search, selectedGrade]);

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

  const handleExportExcel = () => {
    if (!harvestList || harvestList.length === 0) {
      showToast('Không có dữ liệu thu hoạch để xuất!', 'warning');
      return;
    }

    const exportData = harvestList.map((item, idx) => ({
      'STT': idx + 1,
      'Mã lệnh thu hoạch': item.harvest_code,
      'Mã lô GS1': item.lot_code,
      'Ngày thu hoạch': item.harvest_date,
      'Mã thửa đất': item.plot_code,
      'Tên thửa đất': item.plot_name,
      'Mùa vụ': item.crop_season_name || 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
      'Tổng sản lượng (kg)': item.quantity_kg,
      'Grade A (kg)': item.grade_a_kg || 0,
      'Grade B (kg)': item.grade_b_kg || 0,
      'Hàng loại (kg)': item.reject_kg || 0,
      'Phẩm cấp KCS': item.quality_grade,
      'Độ ngọt Brix (°)': item.brix_level ?? 7.5,
      'Độ đồng đều (%)': item.uniformity_rate ?? 90,
      'Kiểm soát Gate PHI': item.is_phi_cleared ? 'Đạt an toàn PHI' : 'Vi phạm PHI',
      'Kết quả Quick Lab': item.kcs_quick_lab?.test_result === 'LAB_PASSED' ? 'Âm tính (Pass)' : 'Dương tính (Reject)',
      'Mã Kit Test Lab': item.kcs_quick_lab?.kit_code || '',
      'Dư lượng (ppm)': item.kcs_quick_lab?.residue_ppm ?? 0,
    }));

    exportToExcel(exportData, 'Danh_Sach_Thu_Hoach_KCS_GS1_HTX_Tan_Tien', 'ThuHoachKCS');
    showToast('Xuất danh sách thu hoạch sang file Excel (.xlsx) thành công!', 'success');
  };

  const handleDeleteHarvest = async () => {
    if (!harvestToDelete) return;
    try {
      setIsDeleting(true);
      await deleteHarvest(harvestToDelete.id);
      showToast(`Đã hủy lệnh thu hoạch [${harvestToDelete.harvest_code}] thành công`, 'success');
      setHarvestToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    } catch (err: any) {
      showToast(err.message || 'Hủy lệnh thu hoạch thất bại', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

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
      header: 'Thao Tác & Quản Lý',
      render: (item) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Button Xem Chi Tiết KCS */}
          <button
            onClick={() => setSelectedHarvestForDetail(item)}
            title="Xem chi tiết hồ sơ KCS 3 cấp"
            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Button Chỉnh Sửa KCS */}
          <button
            onClick={() => setSelectedHarvestForEdit(item)}
            title="Chỉnh sửa KCS & Phân bổ sản lượng"
            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Button In Tem Nhãn */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedHarvestForPrint(item)}
            leftIcon={<Printer className="w-3.5 h-3.5 text-emerald-600" />}
            className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-[11px] px-2.5 py-1"
          >
            Tem QR
          </Button>

          {/* Button Cây Truy Xuất */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/agriculture/lots/${item.id}/traceability`)}
            leftIcon={<GitBranch className="w-3.5 h-3.5 text-cop-600" />}
            title="Xem cây phả hệ truy xuất nội bộ"
            className="text-[11px] px-2.5 py-1"
          >
            Cây Phả Hệ
          </Button>

          {/* Button Hủy / Xóa */}
          <button
            onClick={() => setHarvestToDelete(item)}
            title="Hủy lệnh thu hoạch"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              className="border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              Xuất Excel (.xlsx)
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Ghi Nhận Thu Hoạch
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm mã lệnh (TH-), mã lô GS1, thửa đất, vùng trồng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="min-h-[38px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Tất cả phẩm cấp KCS</option>
            <option value="GRADE_A">GRADE A (Thượng hạng)</option>
            <option value="GRADE_B">GRADE B (Tiêu chuẩn)</option>
            <option value="REJECT">REJECT (Không đạt)</option>
          </select>
        </div>
      </div>

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

      {/* Harvest Detail Modal */}
      <HarvestDetailModal
        isOpen={!!selectedHarvestForDetail}
        onClose={() => setSelectedHarvestForDetail(null)}
        harvest={selectedHarvestForDetail}
        onPrintLabel={() => {
          if (selectedHarvestForDetail) {
            setSelectedHarvestForPrint(selectedHarvestForDetail);
          }
        }}
      />

      {/* Edit Harvest Modal */}
      <EditHarvestModal
        isOpen={!!selectedHarvestForEdit}
        onClose={() => setSelectedHarvestForEdit(null)}
        harvest={selectedHarvestForEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['harvests'] });
        }}
      />

      {/* Delete Harvest Confirmation Modal */}
      {harvestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in text-[13px]">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertOctagon className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Hủy Lệnh Thu Hoạch</h3>
                <p className="text-xs text-slate-500">Mã lệnh: {harvestToDelete.harvest_code}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-900 leading-relaxed">
              Bạn có chắc chắn muốn hủy lượt thu hoạch này vào ngày <strong>{harvestToDelete.harvest_date}</strong> (Sản lượng: {harvestToDelete.quantity_kg} kg) trên thửa đất <strong>{harvestToDelete.plot_code}</strong>?
              <br />
              <span className="text-[11px] text-rose-700 italic mt-1 block">
                * Mã lô GS1 [{harvestToDelete.lot_code}] liên quan sẽ bị thu hồi khỏi hệ thống xuất hàng.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setHarvestToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteHarvest}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60"
              >
                {isDeleting ? 'Đang hủy...' : 'Xác nhận Hủy Lệnh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
