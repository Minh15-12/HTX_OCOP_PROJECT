import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ocopServiceFull, OcopDossierItem } from '../../../services/ocopService';
import { Qd148DocumentModal } from '../components/Qd148DocumentModal';
import { exportToExcel } from '@/utils/exportUtils';
import { DossiersKpiCards } from '../components/DossiersKpiCards';
import { DossiersTable } from '../components/DossiersTable';
import { DossiersStatsCharts } from '../components/DossiersStatsCharts';
import { DossierQuickPreviewDrawer } from '../components/DossierQuickPreviewDrawer';

export const DossiersPage: React.FC = () => {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<OcopDossierItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'PROCESSING' | 'COMPLETED' | 'CERTIFIED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedDossier, setSelectedDossier] = useState<OcopDossierItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await ocopServiceFull.getDossiersList();
        setDossiers(data);
      } catch (err) {
        console.error('Failed to load OCOP dossiers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDossiers = React.useMemo(() => {
    return dossiers.filter((d) => {
      const matchesSearch =
        d.productName.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.subjectName.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === 'ALL' || d.productCategory.includes(categoryFilter);
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

      let matchesTab = true;
      if (activeTabFilter === 'PROCESSING') {
        matchesTab = d.status === 'SELF_EVALUATING' || d.status === 'IN_EVALUATION' || d.status === 'DRAFT';
      } else if (activeTabFilter === 'COMPLETED') {
        matchesTab = d.status === 'APPROVED';
      } else if (activeTabFilter === 'CERTIFIED') {
        matchesTab = d.status === 'CERTIFIED';
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesTab;
    });
  }, [dossiers, search, categoryFilter, statusFilter, activeTabFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTabFilter, categoryFilter, statusFilter]);

  const handleExportExcel = () => {
    const exportData = filteredDossiers.map((d) => ({
      'Mã hồ sơ': d.code,
      'Sản phẩm': d.productName,
      'Chủ thể': d.subjectName,
      'Nhóm sản phẩm': d.productCategory,
      'Điểm tự đánh giá': d.totalScore,
      'Trạng thái': d.statusLabel,
      'Ngày nộp': d.submissionDate,
    }));
    exportToExcel(exportData, 'Danh_Sach_Ho_So_OCOP', 'HoSoOCOP');
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setActiveTabFilter('ALL');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold">Đang tải danh sách hồ sơ OCOP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 animate-fade-in text-slate-800">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Hồ sơ & Chấm điểm OCOP
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Quản lý hồ sơ đăng ký, tự đánh giá và chấm điểm sản phẩm OCOP theo Bộ tiêu chí QĐ 148/2023.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm hồ sơ, sản phẩm, mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>

          <button
            onClick={() => navigate('/ocop/dossiers/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition-all shrink-0 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Thêm hồ sơ OCOP
          </button>
        </div>
      </div>

      {/* 4 KPI Top Stat Cards */}
      <DossiersKpiCards dossiers={dossiers} />

      {/* Full-width Table & Charts */}
      <div className="space-y-6">
        <DossiersTable
          dossiers={filteredDossiers}
          selectedDossier={selectedDossier}
          onSelectDossier={setSelectedDossier}
          activeTabFilter={activeTabFilter}
          setActiveTabFilter={setActiveTabFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          onResetFilters={handleResetFilters}
          currentPage={currentPage}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
        />

        {/* Bottom 3 Summary Charts Row */}
        <DossiersStatsCharts dossiers={dossiers} />
      </div>

      {/* Slide-over Preview Drawer */}
      <DossierQuickPreviewDrawer
        isOpen={Boolean(selectedDossier)}
        onClose={() => setSelectedDossier(null)}
        dossier={selectedDossier}
        onOpenQd148Modal={() => setIsFormModalOpen(true)}
      />

      {/* QĐ 148 Export Modal */}
      {selectedDossier && (
        <Qd148DocumentModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          dossier={selectedDossier}
        />
      )}
    </div>
  );
};

export default DossiersPage;
