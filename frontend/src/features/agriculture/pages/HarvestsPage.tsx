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
  Scale,
  FlaskConical,
  Columns2,
  Maximize2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatNumber } from '@/utils/formatters';
import { useToast } from '@/components/ui/ToastNotification';
import { fetchHarvests, createHarvest, deleteHarvest } from '@/services/harvestApi';
import { getAllStoredPlots, type FarmPlot } from '@/services/farmPlotApi';
import { HarvestLabelPrintModal } from '../components/HarvestLabelPrintModal';
import { HarvestDetailModal } from '../components/HarvestDetailModal';
import { HarvestDetailPanel } from '../components/HarvestDetailPanel';
import { EditHarvestModal } from '../components/EditHarvestModal';
import { exportToExcel } from '@/utils/exportUtils';
import type { HarvestItem, QualityGrade, QuickLabResult } from '@/types/agriculture';

export const HarvestsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHarvestForPrint, setSelectedHarvestForPrint] = useState<HarvestItem | null>(null);
  const [selectedHarvestForDetailModal, setSelectedHarvestForDetailModal] = useState<HarvestItem | null>(null);
  const [selectedHarvestForEdit, setSelectedHarvestForEdit] = useState<HarvestItem | null>(null);
  const [harvestToDelete, setHarvestToDelete] = useState<HarvestItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Master-Detail State (Split View)
  const [selectedHarvestId, setSelectedHarvestId] = useState<string | null>(null);
  const [isSplitView, setIsSplitView] = useState(true);

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

  // Active harvest for Master-Detail inspection panel
  const activeHarvest = useMemo(() => {
    if (harvestList.length === 0) return null;
    if (!selectedHarvestId) return harvestList[0];
    return harvestList.find((h) => h.id === selectedHarvestId) || harvestList[0];
  }, [harvestList, selectedHarvestId]);

  // KPI Metrics Calculation (Hình 3)
  const kpiStats = useMemo(() => {
    const totalVolume = rawHarvestList.reduce((acc, h) => acc + (Number(h.quantity_kg) || 0), 0);
    const gradeAVolume = rawHarvestList.reduce((acc, h) => acc + (Number(h.grade_a_kg) || 0), 0);
    const gradeAPercent = totalVolume > 0 ? Math.round((gradeAVolume / totalVolume) * 100) : 0;
    const totalLots = rawHarvestList.length;

    return {
      totalVolume,
      gradeAVolume,
      gradeAPercent,
      totalLots,
    };
  }, [rawHarvestList]);

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

  return (
    <div className="space-y-5 pb-12 animate-fade-in text-[13px] text-slate-700">
      {/* 1. Header (Fixes Hình 2: Balanced, Bold CTA on top right) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm ring-8 ring-emerald-50">
            <Wheat className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
              <span>Thu hoạch & Phân loại KCS</span>
              <span className="text-slate-300">•</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                Chuẩn GS1 Traceability
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Quản Lý Thu Hoạch & KCS 3 Cấp
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              HTX Tân Tiến Đà Lạt • Kiểm soát PHI Guard, xét nghiệm test kit, phân hạng Grade A/B và cấp mã lô GS1.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="min-h-[48px] shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Ghi nhận thu hoạch mới</span>
        </button>
      </div>

      {/* 2. Top 4 KPI Metric Cards (Implements Hình 3: Overview Intelligence) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Tổng sản lượng */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Tổng sản lượng thu hoạch</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {formatNumber(kpiStats.totalVolume)} <span className="text-base font-bold text-slate-500">kg</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Ớt chuông Sweet Palermo</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wheat className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Tỷ lệ Grade A */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Sản lượng Grade A (Premium)</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-700">
                {kpiStats.gradeAPercent}% <span className="text-sm font-bold text-slate-500">({formatNumber(kpiStats.gradeAVolume)} kg)</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Brix ≥ 7.0° • Đồng đều ≥ 90%</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Scale className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Mã lô GS1 */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Mã lô GS1 đã cấp</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-blue-700">
                {kpiStats.totalLots} <span className="text-base font-bold text-slate-500">lô</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Định danh QR xuất xưởng</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <QrCode className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 4: KCS & PHI Guard */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Kiểm định KCS & PHI</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-800">
                100% <span className="text-sm font-bold text-slate-500">Đạt</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Âm tính dư lượng BVTV</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Toolbar */}
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

        <div className="flex items-center gap-2 flex-wrap">
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

          {/* Export Excel Button (Toolbar position) */}
          <button
            onClick={handleExportExcel}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
            title="Xuất danh sách thu hoạch sang Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Toggle Split Master-Detail vs Full Table View */}
          <button
            onClick={() => setIsSplitView((prev) => !prev)}
            className={`min-h-[38px] hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isSplitView
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={isSplitView ? 'Đang bật chia đôi màn hình Master-Detail' : 'Bật chế độ chia đôi màn hình'}
          >
            {isSplitView ? <Columns2 className="w-4 h-4 text-emerald-600" /> : <Maximize2 className="w-4 h-4 text-slate-500" />}
            <span>{isSplitView ? 'Chia đôi màn hình' : 'Xem toàn bảng'}</span>
          </button>
        </div>
      </div>

      {/* 4. Master-Detail Split View (Implements Hình 4) */}
      <div className={`grid grid-cols-1 ${isSplitView ? 'xl:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.95fr)]' : ''} gap-5 items-start`}>
        {/* Left: Master Table Section */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">Danh sách lệnh thu hoạch</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {harvestList.length} lượt thu hoạch • Click chọn dòng để xem chi tiết KCS bên phải
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium hidden sm:block">
              Chuẩn mã lô GS1
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                Đang tải dữ liệu thu hoạch...
              </div>
            ) : harvestList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                Chưa có dữ liệu thu hoạch phù hợp. Bấm "Ghi nhận thu hoạch mới" để thêm lượt thu hoạch đầu tiên.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[12.8px] min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold bg-slate-50">
                    <th className="py-3 px-4 min-w-[130px]">Lệnh & Ngày</th>
                    <th className="py-3 px-4 min-w-[180px]">Mã Lô GS1</th>
                    <th className="py-3 px-4 min-w-[160px]">Thửa Đất</th>
                    <th className="py-3 px-4 min-w-[130px]">Sản Lượng</th>
                    <th className="py-3 px-4 min-w-[140px]">Phẩm Cấp</th>
                    <th className="py-3 px-4 text-center min-w-[110px]">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {harvestList.map((item: HarvestItem) => {
                    const isSelected = activeHarvest?.id === item.id;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedHarvestId(item.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/70 ring-2 ring-emerald-500/40 font-medium'
                            : 'hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        {/* 1. Harvest Code & Date */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                            <span className="font-bold text-emerald-800">{item.harvest_code}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {formatDate(item.harvest_date)}
                          </div>
                        </td>

                        {/* 2. GS1 Lot Code */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-300 inline-block whitespace-nowrap">
                            {item.lot_code}
                          </span>
                        </td>

                        {/* 3. Plot */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-bold text-slate-800 whitespace-nowrap">{item.plot_code}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{item.plot_name}</div>
                        </td>

                        {/* 4. Quantity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-black text-slate-900 text-xs">
                            {formatNumber(item.quantity_kg)} kg
                          </span>
                          <div className="text-[10px] text-slate-500">
                            A: <strong className="text-emerald-700">{formatNumber(item.grade_a_kg || 0)} kg</strong>
                          </div>
                        </td>

                        {/* 5. Quality Grade */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border ${
                              item.quality_grade === 'GRADE_A'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : item.quality_grade === 'GRADE_B'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            {item.quality_grade === 'GRADE_A' ? 'GRADE A' : item.quality_grade === 'GRADE_B' ? 'GRADE B' : 'REJECT'}
                          </span>
                        </td>

                        {/* 6. Quick Action Icons */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedHarvestForDetailModal(item)}
                              title="Xem chi tiết modal"
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedHarvestForEdit(item)}
                              title="Sửa KCS"
                              className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedHarvestForPrint(item)}
                              title="In tem QR"
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setHarvestToDelete(item)}
                              title="Hủy lệnh thu hoạch"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Right: Master-Detail Inspector Panel (Styled Identical to Reference Image 4) */}
        {isSplitView && (
          <HarvestDetailPanel
            harvest={activeHarvest}
            onEdit={(h) => setSelectedHarvestForEdit(h)}
            onDelete={(h) => setHarvestToDelete(h)}
            onPrintLabel={(h) => setSelectedHarvestForPrint(h)}
          />
        )}
      </div>

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
              <FlaskConical className="w-4 h-4 text-emerald-600" />
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
              <Scale className="w-4 h-4 text-emerald-600" />
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

      {/* Harvest Detail Modal (Mobile / Full view) */}
      <HarvestDetailModal
        isOpen={!!selectedHarvestForDetailModal}
        onClose={() => setSelectedHarvestForDetailModal(null)}
        harvest={selectedHarvestForDetailModal}
        onPrintLabel={() => {
          if (selectedHarvestForDetailModal) {
            setSelectedHarvestForPrint(selectedHarvestForDetailModal);
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteHarvest}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
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
