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
  CircleCheck,
  SlidersHorizontal,
  Users,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { PhiCountdownBadge } from '../components/PhiCountdownBadge';
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
  FALLOW: 'Đang nghỉ vụ',
  INACTIVE: 'Ngưng canh tác',
  UNDER_PUC_REVIEW: 'Chờ đánh giá PUC ⚠️',
  IN_QUARANTINE: 'Cách ly PHI 🛑',
};

const statusClass: Record<string, string> = {
  ACTIVE: 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold',
  PREPARING: 'border-amber-200 bg-amber-50 text-amber-700',
  FALLOW: 'border-slate-300 bg-slate-100 text-slate-600 font-medium',
  INACTIVE: 'border-red-200 bg-red-50 text-red-600',
  UNDER_PUC_REVIEW: 'border-amber-300 bg-amber-100 text-amber-900 font-bold',
  IN_QUARANTINE: 'border-rose-400 bg-rose-100 text-rose-900 font-extrabold animate-pulse ring-2 ring-rose-200',
};

type UnitForm = {
  name: string;
  unit_code: string;
  crop: string;
  area: number | '';
  status: string;
  puc_code: string;
  puc_status: string;
};

const emptyForm: UnitForm = {
  name: '',
  unit_code: 'VT-',
  crop: '',
  area: '',
  status: 'ACTIVE',
  puc_code: 'PUC-49-',
  puc_status: 'ACTIVE',
};

const toList = (res: any): any[] => {
  const list = res?.data ?? res ?? [];
  return Array.isArray(list) ? list : [];
};

/** Mock data chuẩn hóa cho HTX Tân Tiến - Ớt Chuông Sweet Palermo Đỏ Đà Lạt */
const MOCK_UNITS: ProductionUnit[] = [
  { id: 'u1', unit_code: 'VT-DALAT-01', name: 'Vùng trồng Ớt Chuông Sweet Palermo Hòn Bồ (P12 - Đà Lạt)', crop: 'Ớt chuông Sweet Palermo Đỏ', area: 15.0, status: 'ACTIVE', puc_code: 'PUC-49-015-9923', puc_status: 'ACTIVE' },
  { id: 'u2', unit_code: 'VT-DASAR-02', name: 'Vùng trồng Liên Kết Đạ Sar - Lạc Dương (HTX Tân Tiến)', crop: 'Ớt chuông Sweet Palermo Đỏ & Vàng', area: 12.5, status: 'ACTIVE', puc_code: 'PUC-49-015-9924', puc_status: 'ACTIVE' },
  { id: 'u3', unit_code: 'VT-DANHIM-03', name: 'Vùng Trồng Công Nghệ Cao Đơn Dương', crop: 'Ớt chuông Sweet Palermo Đỏ Baby', area: 8.5, status: 'ACTIVE', puc_code: 'PUC-49-018-0045', puc_status: 'UNDER_PUC_REVIEW' },
  { id: 'u4', unit_code: 'VT-LACDUONG-04', name: 'Vùng trồng Liên Kết Xã Đạ Chais', crop: 'Ớt chuông Sweet Palermo Đỏ', area: 10.0, status: 'ACTIVE', puc_code: 'PUC-49-020-1122', puc_status: 'ACTIVE' },
  { id: 'u5', unit_code: 'VT-HONBO-05', name: 'Khu Nhà Kính Khảo Nghiệm Giống F1 Hòn Bồ', crop: 'Ớt chuông Sweet Palermo Sô-cô-la', area: 6.0, status: 'PREPARING', puc_code: 'PUC-49-022-3344', puc_status: 'ACTIVE' },
  { id: 'u6', unit_code: 'VT-DONDUONG-06', name: 'Vùng Nghỉ Dưỡng Đất & Cải Tạo Hữu Cơ', crop: 'Cải tạo đất hữu cơ', area: 7.0, status: 'FALLOW', puc_code: 'PUC-49-025-5566', puc_status: 'ACTIVE' },
];

const MOCK_PLOTS: Record<string, FarmPlot[]> = {
  u1: [
    { id: 'p1', production_unit_id: 'u1', plot_code: 'PLOT-TT-XV001-01', area: 4.5, status: 'ACTIVE', gps_coordinates: '11.9501° N, 108.4712° E', unit_name: 'Nhà kính Hòn Bồ 01' },
    { id: 'p2', production_unit_id: 'u1', plot_code: 'PLOT-TT-XV001-02', area: 4.0, status: 'IN_QUARANTINE', safe_harvest_date: '2026-10-20', gps_coordinates: '11.9510° N, 108.4720° E', unit_name: 'Nhà kính Hòn Bồ 02' },
    { id: 'p3', production_unit_id: 'u1', plot_code: 'PLOT-TT-XV002-01', area: 6.5, status: 'ACTIVE', gps_coordinates: '11.9525° N, 108.4735° E', unit_name: 'Nhà kính Hòn Bồ 03' },
  ],
  u2: [
    { id: 'p4', production_unit_id: 'u2', plot_code: 'PLOT-TT-XV003-01', area: 5.0, status: 'IN_QUARANTINE', safe_harvest_date: '2026-10-18', gps_coordinates: '11.9404° N, 108.4583° E', unit_name: 'Thửa Đất Đạ Sar 01' },
    { id: 'p5', production_unit_id: 'u2', plot_code: 'PLOT-TT-XV003-02', area: 7.5, status: 'ACTIVE', gps_coordinates: '11.9412° N, 108.4590° E', unit_name: 'Thửa Đất Đạ Sar 02' },
  ],
  u3: [
    { id: 'p6', production_unit_id: 'u3', plot_code: 'PLOT-TT-XV004-01', area: 4.0, status: 'ACTIVE', gps_coordinates: '11.9600° N, 108.4800° E', unit_name: 'Thửa Công Nghệ Cao 01' },
    { id: 'p7', production_unit_id: 'u3', plot_code: 'PLOT-TT-XV004-02', area: 4.5, status: 'ACTIVE', gps_coordinates: '11.9610° N, 108.4810° E', unit_name: 'Thửa Công Nghệ Cao 02' },
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

  // Member Assignment Modal State
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
      setError(null);
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

  const openAssignmentsModal = async (plot: FarmPlot) => {
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
      const matchStatus =
        status === 'Tất cả' ||
        statusText[u.status] === status ||
        (status === 'Chờ đánh giá PUC' && u.puc_status === 'UNDER_PUC_REVIEW');
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
      puc_code: u.puc_code || '',
      puc_status: u.puc_status || 'ACTIVE',
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.unit_code.trim() || !form.crop.trim() || !Number(form.area)) {
      alert('Vui lòng nhập đủ: Tên, Mã, Cây trồng, Diện tích (> 0)');
      return;
    }
    try {
      setSubmitting(true);
      if (usingMock) {
        if (editingId) {
          setUnits((prev) =>
            prev.map((u) =>
              u.id === editingId
                ? {
                    ...u,
                    name: form.name.trim(),
                    crop: form.crop.trim(),
                    area: Number(form.area),
                    status: form.status,
                    puc_code: form.puc_code,
                    puc_status: form.puc_status as any,
                  }
                : u
            )
          );
          setSelected((prev) =>
            prev?.id === editingId
              ? {
                  ...prev,
                  name: form.name.trim(),
                  crop: form.crop.trim(),
                  area: Number(form.area),
                  status: form.status,
                  puc_code: form.puc_code,
                  puc_status: form.puc_status as any,
                }
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
            puc_code: form.puc_code.trim() || undefined,
            puc_status: (form.puc_status as any) || 'ACTIVE',
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
            puc_status: form.puc_status as any,
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
    <div className="min-h-full space-y-5 pb-10 text-[13px] text-slate-700">
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
              <span className="text-slate-400">Vùng trồng</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Vùng trồng & Mã PUC Cục BVTV</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý vùng sản xuất, diện tích VietGAP, mã số vùng trồng PUC và các thửa đất trực thuộc.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          Khai báo vùng trồng mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Tổng vùng trồng</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{units.length}</p>
              <p className="mt-1 text-xs text-slate-400">Vùng đang quản lý</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Tổng diện tích</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {totalArea.toFixed(1)} <span className="text-base font-bold text-slate-500">ha</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Diện tích canh tác VietGAP</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Ruler className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Đang canh tác</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{activeCount}</p>
              <p className="mt-1 text-xs text-slate-400">Vùng đang hoạt động</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Sprout className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Thửa đất</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{selected ? plots.length : '—'}</p>
              <p className="mt-1 text-xs text-slate-400">Theo vùng đang chọn</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-600">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
          Tìm kiếm & bộ lọc
        </div>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên vùng, mã vùng, mã PUC Cục BVTV, cây trồng..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
          </div>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 lg:min-w-[190px]"
          >
            <option value="Tất cả">Tất cả cây trồng</option>
            {crops.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 lg:min-w-[180px]"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            {Object.values(statusText).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-600">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold">!</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center text-sm text-slate-400 shadow-sm">
          Đang tải dữ liệu vùng trồng...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.8fr)]">
          {/* List */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-800">Danh sách vùng trồng</h2>
                <p className="mt-0.5 text-xs text-slate-400">{filtered.length} vùng được hiển thị</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {totalArea.toFixed(1)} ha
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <p className="font-semibold text-slate-600">Chưa có vùng trồng nào</p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                    Chưa có dữ liệu phù hợp với bộ lọc hiện tại. Bạn có thể khai báo vùng trồng mới để bắt đầu quản lý.
                  </p>
                  <button
                    onClick={openCreate}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <Plus className="h-4 w-4" /> Thêm vùng trồng
                  </button>
                </div>
              ) : (
                filtered.map((u) => {
                  const displayStatusKey = u.puc_status === 'UNDER_PUC_REVIEW' ? 'UNDER_PUC_REVIEW' : u.status;
                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelected(u)}
                      className={`group cursor-pointer px-5 py-4 transition-all hover:bg-emerald-50/30 ${
                        selected?.id === u.id ? 'bg-emerald-50/60' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${selected?.id === u.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                          <Sprout className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-bold text-slate-800">{u.name}</h3>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass[displayStatusKey] || 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                              {statusText[displayStatusKey] || displayStatusKey}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                            <span>Mã: <b className="font-semibold text-slate-600">{u.unit_code}</b></span>
                            {u.puc_code && (
                              <span>• Mã PUC: <b className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{u.puc_code}</b></span>
                            )}
                            <span>• Cây trồng: <b className="font-semibold text-slate-600">{u.crop}</b></span>
                          </div>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="text-lg font-extrabold text-slate-800">{u.area}</p>
                          <p className="text-[11px] text-slate-400">ha</p>
                        </div>
                        <button
                          title="Sửa vùng trồng"
                          onClick={(e) => { e.stopPropagation(); openEdit(u); }}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-70 transition hover:bg-white hover:text-emerald-600 hover:shadow-sm group-hover:opacity-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Detail */}
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selected ? (
              <div>
                <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Chi tiết vùng trồng</p>
                        <h3 className="mt-1 text-lg font-extrabold text-slate-900">{selected.name}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => openEdit(selected)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Sửa
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-white bg-white/80 px-3.5 py-3 shadow-sm">
                    <span className="text-xs text-slate-500">Trạng thái</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass[selected.puc_status === 'UNDER_PUC_REVIEW' ? 'UNDER_PUC_REVIEW' : selected.status] || ''}`}>
                      {selected.puc_status === 'UNDER_PUC_REVIEW' ? 'Chờ đánh giá PUC ⚠️' : statusText[selected.status] || selected.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3.5">
                      <p className="text-[11px] font-medium text-slate-400">Mã vùng</p>
                      <p className="mt-1.5 truncate text-sm font-bold text-slate-700">{selected.unit_code}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3.5">
                      <p className="text-[11px] font-medium text-emerald-600">Diện tích</p>
                      <p className="mt-1.5 text-sm font-extrabold text-emerald-700">{selected.area} ha</p>
                    </div>
                    <div className="col-span-2 rounded-xl bg-blue-50/70 border border-blue-100 p-3.5">
                      <p className="text-[11px] font-medium text-blue-600">Mã PUC Cục BVTV</p>
                      <p className="mt-1 text-sm font-mono font-bold text-blue-800">{selected.puc_code || 'Chưa đăng ký'}</p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-slate-100 p-3.5">
                      <p className="text-[11px] font-medium text-slate-400">Cây trồng chủ lực</p>
                      <div className="mt-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Sprout className="h-4 w-4 text-emerald-600" /> {selected.crop}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Thửa đất</h4>
                        <p className="mt-0.5 text-[11px] text-slate-400">{plots.length} thửa thuộc vùng này</p>
                      </div>
                      <button
                        onClick={() => setShowPlotForm((v) => !v)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Plus className="h-3.5 w-3.5" /> Thêm thửa
                      </button>
                    </div>

                    {showPlotForm && (
                      <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                        <p className="mb-3 text-xs font-bold text-emerald-800">Khai báo thửa đất</p>
                        <div className="space-y-2.5">
                          <input
                            value={plotForm.plot_code}
                            onChange={(e) => setPlotForm({ ...plotForm, plot_code: e.target.value })}
                            placeholder="Mã thửa, ví dụ: TD-01"
                            className={inputCls}
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={plotForm.area}
                            onChange={(e) => setPlotForm({ ...plotForm, area: e.target.value })}
                            placeholder="Diện tích (ha hoặc m²)"
                            className={inputCls}
                          />
                          <select
                            value={plotForm.status}
                            onChange={(e) => setPlotForm({ ...plotForm, status: e.target.value })}
                            className={inputCls}
                          >
                            <option value="ACTIVE">Đang canh tác (ACTIVE)</option>
                            <option value="IN_QUARANTINE">Cách ly PHI (IN_QUARANTINE)</option>
                            <option value="FALLOW">Bỏ vụ (FALLOW)</option>
                          </select>
                          {plotForm.status === 'IN_QUARANTINE' && (
                            <input
                              type="date"
                              value={plotForm.safe_harvest_date}
                              onChange={(e) => setPlotForm({ ...plotForm, safe_harvest_date: e.target.value })}
                              className={inputCls}
                            />
                          )}
                          <div className="flex justify-end gap-2 pt-1">
                            <button onClick={() => setShowPlotForm(false)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
                            <button onClick={savePlot} disabled={plotSaving} className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60">
                              {plotSaving ? 'Đang lưu...' : 'Lưu thửa'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {plotsLoading ? (
                      <div className="rounded-xl bg-slate-50 py-8 text-center text-xs text-slate-400">Đang tải thửa đất...</div>
                    ) : plots.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500">Chưa có thửa đất</p>
                        <p className="mt-1 text-[11px] text-slate-400">Thêm thửa để theo dõi chi tiết vùng trồng.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {plots.map((p) => {
                          const isQuarantine = p.status === 'IN_QUARANTINE';
                          const isFallow = p.status === 'FALLOW';
                          const borderBgClass = isQuarantine
                            ? 'border-rose-300 bg-rose-50/80 shadow-xs ring-1 ring-rose-200'
                            : isFallow
                            ? 'border-slate-200 bg-slate-50/80'
                            : 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 hover:bg-emerald-50/60';

                          return (
                            <li key={p.id} className={`rounded-xl border p-3.5 transition ${borderBgClass}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ${
                                      isQuarantine
                                        ? 'bg-rose-100 text-rose-600 animate-pulse'
                                        : isFallow
                                        ? 'bg-slate-200 text-slate-600'
                                        : 'bg-white text-emerald-600'
                                    }`}
                                  >
                                    {isQuarantine ? <ShieldAlert className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-slate-800">{p.plot_code}</p>
                                      <span
                                        className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${
                                          statusClass[p.status] || 'border-slate-200 bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {statusText[p.status] || p.status}
                                      </span>
                                    </div>
                                    {p.gps_coordinates && (
                                      <div className="mt-0.5 text-[10.5px] font-mono text-slate-500">
                                        📍 {p.gps_coordinates}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-700">{p.area} ha</span>
                                  <button
                                    onClick={() => openAssignmentsModal(p)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 shadow-xs hover:border-emerald-200 hover:text-emerald-700"
                                    title="Phân công xã viên"
                                  >
                                    <Users className="h-3 w-3 text-emerald-600" />
                                    Xã viên
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                <PhiCountdownBadge safeHarvestDate={p.safe_harvest_date} status={p.status} />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[560px] flex-col items-center justify-center px-8 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                  <MapPin className="h-9 w-9" />
                </div>
                <h3 className="font-bold text-slate-600">Chọn một vùng trồng</h3>
                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Thông tin chi tiết, diện tích và danh sách thửa đất sẽ hiển thị tại đây.</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Member Plot Assignment Modal */}
      {selectedPlotForAssignments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Phân công Xã viên phụ trách
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Thửa đất: {selectedPlotForAssignments.plot_code}</p>
              </div>
              <button
                onClick={() => setSelectedPlotForAssignments(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-400 shadow-xs hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Danh sách Xã viên đang phụ trách:</h4>
                {assignmentsLoading ? (
                  <div className="text-xs text-slate-400 py-4 text-center">Đang tải...</div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {assignments.map((ma) => (
                      <div key={ma.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{ma.member_name} ({ma.member_code})</div>
                          <div className="text-slate-400 text-[11px]">{ma.role} • Từ ngày {ma.assigned_date}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                          Đang phụ trách
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Phân công Xã viên mới:</h4>
                <div className="space-y-2">
                  <select
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="mem-001">TV001 - Nguyễn Văn A</option>
                    <option value="mem-002">TV002 - Trần Thị B</option>
                    <option value="mem-003">TV003 - Lê Văn C</option>
                  </select>
                  <input
                    type="text"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className={inputCls}
                    placeholder="Vai trò (Xã viên canh tác VietGAP / Trưởng nhóm)"
                  />
                </div>
                <button
                  onClick={handleAssignMember}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  Xác nhận Phân công Xã viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Unit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Quản lý vùng trồng</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900">{editingId ? 'Sửa vùng trồng' : 'Khai báo vùng trồng mới'}</h3>
                <p className="mt-1 text-xs text-slate-400">Nhập thông tin để quản lý vùng sản xuất & mã PUC Cục BVTV.</p>
              </div>
              <button onClick={() => setModal(false)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Tên vùng trồng *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Vùng trồng Cà phê Cầu Đất" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Mã vùng *</label>
                  <input value={form.unit_code} disabled={!!editingId} onChange={(e) => setForm({ ...form, unit_code: e.target.value })} className={inputCls} placeholder="VT-LAMHA-01" />
                  {editingId && <p className="mt-1 text-[10px] text-slate-400">Mã vùng không thể thay đổi.</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Diện tích (ha) *</label>
                  <input type="number" step="0.1" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value === '' ? '' : Number(e.target.value) })} className={inputCls} placeholder="0.0" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Mã PUC Cục BVTV</label>
                <input value={form.puc_code} onChange={(e) => setForm({ ...form, puc_code: e.target.value })} className={inputCls} placeholder="PUC-49-012-XXXX" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Cây trồng chủ lực *</label>
                <div className="relative">
                  <Sprout className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className={`${inputCls} pl-10`} placeholder="Cà phê Arabica" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Trạng thái Mã PUC</label>
                <select value={form.puc_status} onChange={(e) => setForm({ ...form, puc_status: e.target.value })} className={inputCls}>
                  <option value="ACTIVE">Hoạt động bình thường (ACTIVE)</option>
                  <option value="UNDER_PUC_REVIEW">Đang chờ đánh giá lại PUC (BR-FARM-005)</option>
                  <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                </select>
              </div>
              {editingId && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Trạng thái Vùng trồng</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                    {Object.entries(statusText).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-xs text-emerald-700">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Thông tin vùng trồng sẽ được cập nhật vào hệ thống quản lý sản xuất.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button onClick={() => setModal(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={save} disabled={submitting} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60">
                {submitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo vùng trồng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
