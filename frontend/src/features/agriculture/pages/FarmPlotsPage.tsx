import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  X,
  Pencil,
  Sprout,
  Ruler,
  Layers3,
  ChevronRight,
  ShieldAlert,
  Users,
  AlertTriangle,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import {
  fetchProductionUnits,
  createProductionUnit,
  updateProductionUnit,
  fetchPlotsByUnit,
  createPlot,
  fetchPlotMemberAssignments,
  assignMemberToPlot,
  type ProductionUnit,
  type FarmPlot,
  type MemberAssignment,
} from '../../../services/farmPlotApi';

const statusText: Record<string, string> = {
  ACTIVE: 'Đang canh tác',
  PREPARING: 'Chuẩn bị đất',
  FALLOW: 'Bỏ vụ / Cải tạo',
  IN_QUARANTINE: 'Cách ly PHI 🛑',
  INACTIVE: 'Ngưng sử dụng',
  UNDER_PUC_REVIEW: 'Chờ đánh giá PUC ⚠️',
};

const statusClass: Record<string, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold',
  PREPARING: 'border-amber-200 bg-amber-50 text-amber-700 font-bold',
  FALLOW: 'border-slate-200 bg-slate-100 text-slate-600 font-bold',
  IN_QUARANTINE: 'border-rose-300 bg-rose-100 text-rose-800 font-extrabold animate-pulse',
  INACTIVE: 'border-red-200 bg-red-50 text-red-600 font-bold',
  UNDER_PUC_REVIEW: 'border-amber-300 bg-amber-100 text-amber-900 font-extrabold',
};

type UnitForm = {
  name: string;
  unit_code: string;
  crop: string;
  area: number | '';
  status: string;
  puc_code: string;
  puc_status: 'ACTIVE' | 'INACTIVE' | 'UNDER_PUC_REVIEW';
};

const emptyForm: UnitForm = {
  name: '',
  unit_code: 'VT-',
  crop: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
  area: '',
  status: 'ACTIVE',
  puc_code: 'PUC-49-',
  puc_status: 'ACTIVE',
};

const toList = (res: any): any[] => {
  const list = res?.data ?? res ?? [];
  return Array.isArray(list) ? list : [];
};

const MOCK_UNITS: ProductionUnit[] = [
  { id: 'u1', unit_code: 'VT-ML-02', name: 'Vùng Ớt Chuông Sweet Palermo - Thôn 2 Mê Linh', crop: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt', area: 32.5, status: 'ACTIVE', puc_code: 'PUC-49-012-8821', puc_status: 'ACTIVE' },
  { id: 'u2', unit_code: 'VT-LH-03', name: 'Vùng Nông Nghiệp Lâm Hà - Thôn 3', crop: 'Cà phê Arabica Cầu Đất', area: 15.0, status: 'ACTIVE', puc_code: 'PUC-49-015-9923', puc_status: 'ACTIVE' },
  { id: 'u3', unit_code: 'VT-DT-01', name: 'Vùng Rau Thủy Canh - Đạ Tẻh', crop: 'Rau xà lách thủy canh', area: 18.5, status: 'UNDER_PUC_REVIEW', puc_code: 'PUC-49-018-0045', puc_status: 'UNDER_PUC_REVIEW' },
];

const MOCK_PLOTS: Record<string, FarmPlot[]> = {
  u1: [
    { id: 'p1', production_unit_id: 'u1', plot_code: 'PLOT-TT-XV001-01', area: 8.5, status: 'ACTIVE', gps_coordinates: '11.9404° N, 108.4583° E', unit_name: 'Thôn 2 - Mê Linh' },
    { id: 'p2', production_unit_id: 'u1', plot_code: 'PLOT-TT-XV001-02', area: 12.0, status: 'IN_QUARANTINE', safe_harvest_date: '2026-10-15', gps_coordinates: '11.9412° N, 108.4590° E', unit_name: 'Thôn 2 - Mê Linh' },
    { id: 'p3', production_unit_id: 'u1', plot_code: 'PLOT-TT-XV002-01', area: 12.0, status: 'ACTIVE', gps_coordinates: '11.9420° N, 108.4601° E', unit_name: 'Thôn 2 - Mê Linh' },
  ],
  u2: [
    { id: 'p4', production_unit_id: 'u2', plot_code: 'PLOT-TT-XV003-01', area: 7.5, status: 'IN_QUARANTINE', safe_harvest_date: '2026-10-20', gps_coordinates: '11.9501° N, 108.4712° E', unit_name: 'Thôn 3 - Lâm Hà' },
    { id: 'p5', production_unit_id: 'u2', plot_code: 'PLOT-TT-XV003-02', area: 7.5, status: 'ACTIVE', gps_coordinates: '11.9510° N, 108.4720° E', unit_name: 'Thôn 3 - Lâm Hà' },
  ],
  u3: [
    { id: 'p6', production_unit_id: 'u3', plot_code: 'PLOT-TT-XV004-01', area: 9.0, status: 'FALLOW', gps_coordinates: '11.9600° N, 108.4800° E', unit_name: 'Đạ Tẻh' },
  ],
};

export const FarmPlotsPage: React.FC = () => {
  const [units, setUnits] = useState<ProductionUnit[]>([]);
  const [selected, setSelected] = useState<ProductionUnit | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Tất cả');
  const [crop, setCrop] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UnitForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [plotForm, setPlotForm] = useState({ plot_code: '', area: '', safe_harvest_date: '', status: 'ACTIVE' });
  const [plotSaving, setPlotSaving] = useState(false);
  const [showPlotForm, setShowPlotForm] = useState(false);

  // Assignment Drawer State
  const [selectedPlotForAssignments, setSelectedPlotForAssignments] = useState<FarmPlot | null>(null);
  const [assignments, setAssignments] = useState<MemberAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [newMemberId, setNewMemberId] = useState('mem-001');
  const [newMemberRole, setNewMemberRole] = useState('Xã viên canh tác VietGAP');

  const loadUnits = async (keepId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const list = toList(await fetchProductionUnits({ per_page: 50 }));
      if (list.length === 0) {
        setUnits(MOCK_UNITS);
        const current = MOCK_UNITS.find((u) => u.id === (keepId ?? selected?.id));
        setSelected(current ?? MOCK_UNITS[0] ?? null);
        setUsingMock(true);
      } else {
        setUnits(list);
        const current = list.find((u: ProductionUnit) => u.id === (keepId ?? selected?.id));
        setSelected(current ?? list[0] ?? null);
        setUsingMock(false);
      }
    } catch {
      setUnits(MOCK_UNITS);
      const current = MOCK_UNITS.find((u) => u.id === (keepId ?? selected?.id));
      setSelected(current ?? MOCK_UNITS[0] ?? null);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  const loadPlots = async (unitId: string) => {
    try {
      setPlotsLoading(true);
      const list = toList(await fetchPlotsByUnit(unitId));
      setPlots(list.length > 0 ? list : (MOCK_PLOTS[unitId] || []));
    } catch {
      setPlots(MOCK_PLOTS[unitId] || []);
    } finally {
      setPlotsLoading(false);
    }
  };

  const openAssignmentsDrawer = async (plot: FarmPlot) => {
    setSelectedPlotForAssignments(plot);
    setAssignmentsLoading(true);
    const res = await fetchPlotMemberAssignments(plot.id);
    setAssignments(res);
    setAssignmentsLoading(false);
  };

  const handleAssignMember = async () => {
    if (!selectedPlotForAssignments) return;
    await assignMemberToPlot(selectedPlotForAssignments.id, { member_id: newMemberId, role: newMemberRole });
    const updated = await fetchPlotMemberAssignments(selectedPlotForAssignments.id);
    setAssignments(updated);
  };

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    setShowPlotForm(false);
    setPlotForm({ plot_code: '', area: '', safe_harvest_date: '', status: 'ACTIVE' });
    if (selected?.id) loadPlots(selected.id);
    else setPlots([]);
  }, [selected?.id]);

  const filtered = useMemo(() => {
    return units.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || [u.name, u.unit_code, u.crop, u.puc_code || ''].some((v) => (v || '').toLowerCase().includes(q));
      const matchStatus = status === 'Tất cả' || statusText[u.status] === status || (status === 'Chờ đánh giá PUC' && u.puc_status === 'UNDER_PUC_REVIEW');
      const matchCrop = crop === 'Tất cả' || u.crop === crop;
      return matchSearch && matchStatus && matchCrop;
    });
  }, [units, search, status, crop]);

  const crops = Array.from(new Set(units.map((u) => u.crop).filter(Boolean)));
  const totalArea = units.reduce((a, u) => a + (Number(u.area) || 0), 0);
  const activeCount = units.filter((u) => u.status === 'ACTIVE').length;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (u: ProductionUnit) => {
    setEditingId(u.id);
    setForm({
      name: u.name,
      unit_code: u.unit_code,
      crop: u.crop,
      area: Number(u.area),
      status: u.status || 'ACTIVE',
      puc_code: u.puc_code || 'PUC-49-012-0000',
      puc_status: u.puc_status || 'ACTIVE',
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.unit_code.trim() || !form.crop.trim() || !Number(form.area)) {
      alert('Vui lòng nhập đủ: Tên vùng, Mã vùng, Cây trồng, Diện tích (> 0)');
      return;
    }
    try {
      setSubmitting(true);
      if (usingMock) {
        if (editingId) {
          setUnits((prev) =>
            prev.map((u) =>
              u.id === editingId
                ? { ...u, name: form.name.trim(), crop: form.crop.trim(), area: Number(form.area), status: form.status, puc_code: form.puc_code, puc_status: form.puc_status }
                : u
            )
          );
          setSelected((prev) =>
            prev?.id === editingId
              ? { ...prev, name: form.name.trim(), crop: form.crop.trim(), area: Number(form.area), status: form.status, puc_code: form.puc_code, puc_status: form.puc_status }
              : prev
          );
        } else {
          const newUnit: ProductionUnit = {
            id: `u${Date.now()}`,
            unit_code: form.unit_code.trim(),
            name: form.name.trim(),
            crop: form.crop.trim(),
            area: Number(form.area),
            status: form.status || 'ACTIVE',
            puc_code: form.puc_code || 'PUC-49-012-1000',
            puc_status: form.puc_status || 'ACTIVE',
          };
          setUnits((prev) => [newUnit, ...prev]);
          setSelected(newUnit);
        }
        setModal(false);
      } else {
        if (editingId) {
          await updateProductionUnit(editingId, {
            name: form.name.trim(),
            crop: form.crop.trim(),
            area: Number(form.area),
            status: form.status,
            puc_code: form.puc_code,
            puc_status: form.puc_status,
          });
        } else {
          await createProductionUnit({
            unit_code: form.unit_code.trim(),
            name: form.name.trim(),
            crop: form.crop.trim(),
            area: Number(form.area),
            puc_code: form.puc_code,
          });
        }
        setModal(false);
        await loadUnits(editingId ?? undefined);
      }
    } catch (err: any) {
      alert(err?.message || (editingId ? 'Cập nhật vùng trồng thất bại' : 'Tạo vùng trồng thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  const savePlot = async () => {
    if (!selected) return;
    if (!plotForm.plot_code.trim() || !(Number(plotForm.area) > 0)) {
      alert('Vui lòng nhập Mã thửa và Diện tích (> 0)');
      return;
    }
    try {
      setPlotSaving(true);
      if (usingMock) {
        const newPlot: FarmPlot = {
          id: `p${Date.now()}`,
          production_unit_id: selected.id,
          plot_code: plotForm.plot_code.trim(),
          area: Number(plotForm.area),
          status: plotForm.status || 'ACTIVE',
          safe_harvest_date: plotForm.status === 'IN_QUARANTINE' ? plotForm.safe_harvest_date || '2026-10-25' : null,
          gps_coordinates: '11.9450° N, 108.4650° E',
          unit_name: selected.name,
        };
        setPlots((prev) => [...prev, newPlot]);
        setPlotForm({ plot_code: '', area: '', safe_harvest_date: '', status: 'ACTIVE' });
        setShowPlotForm(false);
      } else {
        await createPlot(selected.id, {
          plot_code: plotForm.plot_code.trim(),
          area: Number(plotForm.area),
        });
        setPlotForm({ plot_code: '', area: '', safe_harvest_date: '', status: 'ACTIVE' });
        setShowPlotForm(false);
        await loadPlots(selected.id);
      }
    } catch (err: any) {
      alert(err?.message || 'Thêm thửa đất thất bại');
    } finally {
      setPlotSaving(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 disabled:bg-slate-100 disabled:text-slate-400';

  return (
    <div className="min-h-full space-y-5 pb-10 text-[13px] text-slate-700 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm ring-8 ring-emerald-50">
            <MapPin className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
              <span>Quản lý nghiệp vụ</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-slate-400">Vùng trồng & Mã PUC Cục BVTV</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Quản lý Vùng Trồng & Thửa Đất</h1>
            <p className="mt-1 text-sm text-slate-500">
              Số hóa mã PUC Cục BVTV, kiểm soát diện tích VietGAP và cảnh báo thời gian cách ly PHI theo thửa đất.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Khai báo Vùng trồng & Mã PUC mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Tổng Vùng trồng</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{units.length}</p>
              <p className="mt-1 text-xs text-slate-400">Đã khai báo CSDL</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Tổng diện tích VietGAP</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {totalArea.toFixed(1)} <span className="text-base font-bold text-slate-500">ha</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">40ha chính thức + 240ha liên kết</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Ruler className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Thửa đất Đang cách ly PHI</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-rose-700">
                {plots.filter((p) => p.status === 'IN_QUARANTINE').length}
              </p>
              <p className="mt-1 text-xs text-rose-500 font-medium">Chặn thu hoạch tự động 🛑</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Thửa đất Vùng chọn</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{selected ? plots.length : '—'}</p>
              <p className="mt-1 text-xs text-slate-400">Chi tiết theo vùng</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-600">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
          Bộ lọc & Tìm kiếm Vùng trồng
        </div>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên vùng, mã PUC Cục BVTV, cây trồng..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
          </div>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 lg:min-w-[200px]"
          >
            <option value="Tất cả">Tất cả sản phẩm</option>
            {crops.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 lg:min-w-[190px]"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Đang canh tác">Đang canh tác (ACTIVE)</option>
            <option value="Chờ đánh giá PUC">Chờ đánh giá PUC (BR-FARM-005)</option>
            <option value="Bỏ vụ / Cải tạo">Bỏ vụ / Cải tạo (FALLOW)</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.8fr)]">
        {/* List Section */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Danh sách Vùng Trồng & Mã PUC Cục BVTV</h2>
              <p className="mt-0.5 text-xs text-slate-400">Hiển thị {filtered.length} vùng sản xuất</p>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
              {totalArea.toFixed(1)} ha VietGAP
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((u) => {
              const isSelected = selected?.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={`group cursor-pointer px-5 py-4 transition-all hover:bg-emerald-50/30 ${
                    isSelected ? 'bg-emerald-50/60' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {u.unit_code}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {u.name}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-800">
                          🌱 {u.crop}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">{u.area} ha</span>
                        {u.puc_code && (
                          <>
                            <span>•</span>
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              🏷️ {u.puc_code}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] border ${statusClass[u.puc_status === 'UNDER_PUC_REVIEW' ? 'UNDER_PUC_REVIEW' : u.status]}`}>
                        {u.puc_status === 'UNDER_PUC_REVIEW' ? 'Chờ đánh giá PUC ⚠️' : statusText[u.status] || u.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(u);
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                        title="Sửa thông tin vùng trồng"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Selected Plot Detail Section */}
        <section className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Thửa đất thuộc: {selected?.name || 'Chưa chọn'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">Mã PUC: {selected?.puc_code || 'Chưa đăng ký'}</p>
              </div>
              <button
                onClick={() => setShowPlotForm(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11.5px] rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm thửa đất
              </button>
            </div>

            {showPlotForm && (
              <div className="p-4 bg-emerald-50/50 border-b border-emerald-200 space-y-3">
                <h4 className="font-bold text-xs text-emerald-900">Khai báo Thửa đất mới</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Mã thửa (PLOT-TT-XV...)"
                    value={plotForm.plot_code}
                    onChange={(e) => setPlotForm({ ...plotForm, plot_code: e.target.value })}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Diện tích (ha)"
                    value={plotForm.area}
                    onChange={(e) => setPlotForm({ ...plotForm, area: e.target.value })}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={plotForm.status}
                    onChange={(e) => setPlotForm({ ...plotForm, status: e.target.value })}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white flex-1"
                  >
                    <option value="ACTIVE">Đang canh tác (ACTIVE)</option>
                    <option value="IN_QUARANTINE">Đang cách ly PHI (IN_QUARANTINE)</option>
                    <option value="FALLOW">Bỏ vụ (FALLOW)</option>
                  </select>
                  {plotForm.status === 'IN_QUARANTINE' && (
                    <input
                      type="date"
                      value={plotForm.safe_harvest_date}
                      onChange={(e) => setPlotForm({ ...plotForm, safe_harvest_date: e.target.value })}
                      className="px-3 py-1.5 border border-rose-300 rounded-lg text-xs bg-white font-bold text-rose-700"
                    />
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowPlotForm(false)}
                    className="px-3 py-1 border border-slate-300 rounded text-xs font-bold text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={savePlot}
                    disabled={plotSaving}
                    className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800"
                  >
                    {plotSaving ? 'Đang lưu...' : 'Lưu Thửa đất'}
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 space-y-3">
              {plots.map((p) => {
                const isQuarantine = p.status === 'IN_QUARANTINE';
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isQuarantine ? 'bg-rose-50/80 border-rose-300 shadow-sm' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-800 text-xs">{p.plot_code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] ${statusClass[p.status] || 'bg-slate-100 text-slate-700'}`}>
                            {statusText[p.status] || p.status}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-slate-500 mt-1 flex items-center gap-3">
                          <span>📐 {p.area} ha</span>
                          {p.gps_coordinates && <span>📍 {p.gps_coordinates}</span>}
                        </div>
                        {isQuarantine && (
                          <div className="mt-2 p-2 bg-rose-100 border border-rose-300 rounded-lg text-[11.5px] text-rose-950 font-bold flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>🛑 Cách ly PHI đến ngày: <strong>{p.safe_harvest_date || '15/10/2026'}</strong> (ERR_HARVEST_PHI_VIOLATION nếu thu hoạch trước)</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => openAssignmentsDrawer(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shrink-0 cursor-pointer"
                        title="Xem danh sách xã viên được phân công"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-700" />
                        Xã viên
                      </button>
                    </div>
                  </div>
                );
              })}

              {plots.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có thửa đất nào được khai báo cho vùng trồng này.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Member Plot Assignment Modal / Drawer */}
      {selectedPlotForAssignments && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  Phân công Xã viên phụ trách Thửa đất
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">Thửa đất: {selectedPlotForAssignments.plot_code}</p>
              </div>
              <button
                onClick={() => setSelectedPlotForAssignments(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Danh sách Xã viên đang phụ trách:</h4>
              {assignmentsLoading ? (
                <div className="text-xs text-slate-400 py-4 text-center">Đang tải...</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {assignments.map((ma) => (
                    <div key={ma.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{ma.member_name} ({ma.member_code})</div>
                        <div className="text-slate-500 text-[11px]">{ma.role} • Từ ngày {ma.assigned_date}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10.5px] font-bold rounded">
                        Đang phụ trách
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Phân công Xã viên mới:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="mem-001">TV001 - Nguyễn Văn A</option>
                    <option value="mem-002">TV002 - Trần Thị B</option>
                    <option value="mem-003">TV003 - Lê Văn C</option>
                  </select>
                  <input
                    type="text"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Vai trò (Trưởng nhóm / Nông dân)"
                  />
                </div>
                <button
                  onClick={handleAssignMember}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Xác nhận Phân công Xã viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Production Unit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingId ? 'Chỉnh sửa Vùng Trồng & Mã PUC' : 'Khai báo Vùng Trồng mới & Mã PUC'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã Vùng Trồng</label>
                <input
                  type="text"
                  value={form.unit_code}
                  onChange={(e) => setForm({ ...form, unit_code: e.target.value })}
                  className={inputCls}
                  disabled={Boolean(editingId)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã Số Vùng Trồng Cục BVTV (PUC Code)</label>
                <input
                  type="text"
                  value={form.puc_code}
                  onChange={(e) => setForm({ ...form, puc_code: e.target.value })}
                  placeholder="PUC-49-012-XXXX"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Vùng Trồng</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="Vùng trồng ớt chuông Đà Lạt"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sản phẩm / Cây trồng chủ lực</label>
                <input
                  type="text"
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diện tích VietGAP (ha)</label>
                <input
                  type="number"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value === '' ? '' : Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái Mã PUC</label>
                <select
                  value={form.puc_status}
                  onChange={(e) => setForm({ ...form, puc_status: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="ACTIVE">Hoạt động bình thường (ACTIVE)</option>
                  <option value="UNDER_PUC_REVIEW">Đang chờ đánh giá lại PUC (BR-FARM-005)</option>
                  <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={save}
                disabled={submitting}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
              >
                {submitting ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
