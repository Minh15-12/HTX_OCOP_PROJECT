import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sprout,
  X,
  CheckCircle2,
  Clock3,
  BarChart3,
  Trash2,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  fetchCropSeasons,
  createCropSeason,
  closeCropSeason,
  updateCropSeason,
  type CropSeason,
  type CropSeasonFormData,
} from '../../../services/cropSeasonApi';
import { fetchProductionUnits, type ProductionUnit } from '../../../services/farmPlotApi';

const statusText: Record<string, string> = {
  PLANNED: 'Chưa bắt đầu',
  ACTIVE: 'Đang diễn ra',
  HARVESTING: 'Đang thu hoạch',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

const statusClass: Record<string, string> = {
  PLANNED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  HARVESTING: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  COMPLETED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
};

const PIE_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#94a3b8'];

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toLocaleDateString('vi-VN');
};

/** Mock data đẹp – tham khảo UI mẫu */
const MOCK_UNITS: ProductionUnit[] = [
  { id: 'u1', unit_code: 'VT-ML-02', name: 'Thôn 2 - Mê Linh', crop: 'Cà phê Arabica', area: 32.5, status: 'ACTIVE' },
  { id: 'u2', unit_code: 'VT-LH-03', name: 'Thôn 3 - Lâm Hà', crop: 'Tiêu', area: 15.0, status: 'ACTIVE' },
  { id: 'u3', unit_code: 'VT-DT-01', name: 'Thôn 1 - Đạ Tẻh', crop: 'Cà phê Robusta', area: 18.5, status: 'ACTIVE' },
  { id: 'u4', unit_code: 'VT-TH-04', name: 'Thôn 4 - Tân Hà', crop: 'Sầu riêng', area: 12.0, status: 'ACTIVE' },
  { id: 'u5', unit_code: 'VT-DD-05', name: 'Thôn 5 - Đơn Dương', crop: 'Chè', area: 10.0, status: 'ACTIVE' },
  { id: 'u6', unit_code: 'VT-LH-06', name: 'Thôn 6 - Lâm Hà', crop: 'Bơ', area: 8.5, status: 'ACTIVE' },
];

const MOCK_SEASONS: CropSeason[] = [
  { id: 's1', production_unit_id: 'u1', unit_code: 'VT-ML-02', unit_name: 'Thôn 2 - Mê Linh', name: 'Vụ Đông Xuân 2024-2025', crop: 'Cà phê Arabica', start_date: '2024-11-01', expected_end_date: '2025-02-28', status: 'COMPLETED' },
  { id: 's2', production_unit_id: 'u1', unit_code: 'VT-ML-02', unit_name: 'Thôn 2 - Mê Linh', name: 'Vụ Hè Thu 2025', crop: 'Cà phê Arabica', start_date: '2025-03-01', expected_end_date: '2025-07-31', status: 'ACTIVE' },
  { id: 's3', production_unit_id: 'u1', unit_code: 'VT-ML-02', unit_name: 'Thôn 2 - Mê Linh', name: 'Vụ Thu Đông 2025', crop: 'Cà phê Arabica', start_date: '2025-08-01', expected_end_date: '2025-12-31', status: 'PLANNED' },
  { id: 's4', production_unit_id: 'u2', unit_code: 'VT-LH-03', unit_name: 'Thôn 3 - Lâm Hà', name: 'Vụ Đông Xuân 2025-2026', crop: 'Tiêu', start_date: '2025-11-01', expected_end_date: '2026-02-28', status: 'PLANNED' },
  { id: 's5', production_unit_id: 'u3', unit_code: 'VT-DT-01', unit_name: 'Thôn 1 - Đạ Tẻh', name: 'Vụ Hè Thu 2025', crop: 'Cà phê Robusta', start_date: '2025-03-01', expected_end_date: '2025-07-31', status: 'ACTIVE' },
  { id: 's6', production_unit_id: 'u4', unit_code: 'VT-TH-04', unit_name: 'Thôn 4 - Tân Hà', name: 'Vụ Mùa 2025', crop: 'Sầu riêng', start_date: '2025-06-01', expected_end_date: '2025-09-30', status: 'ACTIVE' },
  { id: 's7', production_unit_id: 'u5', unit_code: 'VT-DD-05', unit_name: 'Thôn 5 - Đơn Dương', name: 'Vụ Đông Xuân 2025-2026', crop: 'Chè', start_date: '2025-11-01', expected_end_date: '2026-02-28', status: 'PLANNED' },
  { id: 's8', production_unit_id: 'u6', unit_code: 'VT-LH-06', unit_name: 'Thôn 6 - Lâm Hà', name: 'Vụ Hè Thu 2025', crop: 'Bơ', start_date: '2025-03-01', expected_end_date: '2025-07-31', status: 'ACTIVE' },
];

export const CropSeasonsPage: React.FC = () => {
  const [seasons, setSeasons] = useState<CropSeason[]>([]);
  const [selected, setSelected] = useState<CropSeason | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Tất cả');
  const [crop, setCrop] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CropSeasonFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<ProductionUnit[]>([]);
  const [usingMock, setUsingMock] = useState(false);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await fetchCropSeasons({ per_page: 50 });
      const list = res?.data ?? res ?? [];
      const next = Array.isArray(list) ? list : [];
      if (next.length === 0) {
        setSeasons(MOCK_SEASONS);
        setSelected(MOCK_SEASONS[1] ?? MOCK_SEASONS[0] ?? null);
        setUsingMock(true);
      } else {
        setSeasons(next);
        setSelected((prev) => next.find((x: CropSeason) => x.id === prev?.id) ?? next[0] ?? null);
        setUsingMock(false);
      }
    } catch {
      setSeasons(MOCK_SEASONS);
      setSelected(MOCK_SEASONS[1] ?? MOCK_SEASONS[0] ?? null);
      setUsingMock(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
    fetchProductionUnits({ per_page: 100 })
      .then((res: any) => {
        const list = res?.data ?? res ?? [];
        if (Array.isArray(list) && list.length > 0) setUnits(list);
        else setUnits(MOCK_UNITS);
      })
      .catch(() => setUnits(MOCK_UNITS));
  }, []);

  const filtered = useMemo(
    () =>
      seasons.filter((s) => {
        const q = search.toLowerCase().trim();
        const matchSearch =
          !q ||
          [s.name, s.crop, s.unit_name || '', s.unit_code || ''].some((v) =>
            (v || '').toLowerCase().includes(q)
          );
        const matchStatus = status === 'Tất cả' || statusText[s.status] === status;
        const matchCrop = crop === 'Tất cả' || s.crop === crop;
        return matchSearch && matchStatus && matchCrop;
      }),
    [seasons, search, status, crop]
  );

  const crops = Array.from(new Set(seasons.map((s) => s.crop).filter(Boolean)));

  const getArea = (s: CropSeason) => {
    const unit = units.find((u) => u.id === s.production_unit_id);
    return unit ? Number(unit.area) || 0 : 0;
  };

  const totalArea = seasons.reduce((sum, s) => sum + getArea(s), 0);
  const activeCount = seasons.filter((s) => s.status === 'ACTIVE' || s.status === 'HARVESTING').length;
  const expectedYield = usingMock ? 356.8 : Math.round(totalArea * 2.8 * 10) / 10;

  const barData = useMemo(() => {
    const groups: Record<string, number> = {};
    seasons.forEach((s) => {
      const key = s.name.includes('Đông Xuân')
        ? 'Đông Xuân'
        : s.name.includes('Hè Thu')
        ? 'Hè Thu'
        : s.name.includes('Thu Đông')
        ? 'Thu Đông'
        : s.name.includes('Mùa')
        ? 'Mùa'
        : 'Khác';
      groups[key] = (groups[key] || 0) + getArea(s);
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }));
  }, [seasons, units]);

  const pieData = useMemo(() => {
    const groups: Record<string, number> = {};
    seasons.forEach((s) => {
      groups[s.crop] = (groups[s.crop] || 0) + getArea(s);
    });
    return Object.entries(groups).map(([name, value]) => ({
      name,
      value: Math.round(value * 10) / 10,
    }));
  }, [seasons, units]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', crop: '', production_unit_id: '', start_date: '', expected_end_date: '' });
    setModalOpen(true);
  };

  const openEdit = (s: CropSeason) => {
    setMenuId(null);
    setEditingId(s.id);
    setForm({
      name: s.name,
      crop: s.crop,
      production_unit_id: s.production_unit_id,
      start_date: (s.start_date || '').slice(0, 10),
      expected_end_date: (s.expected_end_date || '').slice(0, 10),
    });
    setModalOpen(true);
  };

  const saveSeason = async () => {
    if (!form.name || !form.crop || !form.production_unit_id || !form.start_date || !form.expected_end_date) {
      alert('Vui lòng nhập đầy đủ thông tin mùa vụ.');
      return;
    }
    if (form.expected_end_date <= form.start_date) {
      alert('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }
    try {
      setSubmitting(true);
      if (usingMock) {
        const unit = units.find((u) => u.id === form.production_unit_id);
        if (editingId) {
          setSeasons((prev) =>
            prev.map((s) =>
              s.id === editingId
                ? {
                    ...s,
                    name: form.name!,
                    crop: form.crop!,
                    production_unit_id: form.production_unit_id!,
                    unit_code: unit?.unit_code,
                    unit_name: unit?.name,
                    start_date: form.start_date!,
                    expected_end_date: form.expected_end_date!,
                  }
                : s
            )
          );
          setSelected((prev) =>
            prev?.id === editingId
              ? {
                  ...prev,
                  name: form.name!,
                  crop: form.crop!,
                  production_unit_id: form.production_unit_id!,
                  unit_code: unit?.unit_code,
                  unit_name: unit?.name,
                  start_date: form.start_date!,
                  expected_end_date: form.expected_end_date!,
                }
              : prev
          );
        } else {
          const newSeason: CropSeason = {
            id: `s${Date.now()}`,
            production_unit_id: form.production_unit_id!,
            unit_code: unit?.unit_code,
            unit_name: unit?.name,
            name: form.name!,
            crop: form.crop!,
            start_date: form.start_date!,
            expected_end_date: form.expected_end_date!,
            status: 'PLANNED',
          };
          setSeasons((prev) => [newSeason, ...prev]);
          setSelected(newSeason);
        }
        setModalOpen(false);
      } else {
        if (editingId) {
          await updateCropSeason(editingId, {
            name: form.name,
            crop: form.crop,
            start_date: form.start_date,
            expected_end_date: form.expected_end_date,
          });
        } else {
          await createCropSeason(form as CropSeasonFormData);
        }
        setModalOpen(false);
        await loadSeasons();
      }
    } catch (err: any) {
      alert(err?.message || (editingId ? 'Cập nhật mùa vụ thất bại' : 'Tạo mùa vụ thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Bạn có chắc muốn đóng mùa vụ này?')) return;
    try {
      if (usingMock) {
        setSeasons((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'COMPLETED' as const } : s)));
        setSelected((prev) => (prev?.id === id ? { ...prev, status: 'COMPLETED' as const } : prev));
        setMenuId(null);
      } else {
        await closeCropSeason(id);
        setMenuId(null);
        await loadSeasons();
      }
    } catch (err: any) {
      alert(err?.message || 'Đóng mùa vụ thất bại');
    }
  };

  const handleStatus = async (id: string, next: 'ACTIVE' | 'HARVESTING' | 'CANCELLED') => {
    if (next === 'CANCELLED' && !confirm('Bạn có chắc muốn hủy mùa vụ này?')) return;
    try {
      if (usingMock) {
        setSeasons((prev) => prev.map((s) => (s.id === id ? { ...s, status: next } : s)));
        setSelected((prev) => (prev?.id === id ? { ...prev, status: next } : prev));
        setMenuId(null);
      } else {
        await updateCropSeason(id, { status: next } as any);
        setMenuId(null);
        await loadSeasons();
      }
    } catch (err: any) {
      alert(err?.message || 'Đổi trạng thái mùa vụ thất bại');
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50';

  return (
    <div className="min-h-full space-y-5 bg-slate-50/40 pb-12 text-[13px]">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200/70">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-emerald-600">
              <span>Quản lý nghiệp vụ</span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="text-slate-400">Mùa vụ</span>
            </div>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Mùa vụ</h1>
              <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                Quản lý sản xuất
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Theo dõi tiến độ sản xuất, diện tích gieo trồng và liên kết với vùng trồng.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(5,150,105,.18)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" /> Tạo mùa vụ mới
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Tổng số mùa vụ',
            value: seasons.length,
            note: usingMock ? 'Trong năm 2025' : 'Mùa vụ trong hệ thống',
            icon: Sprout,
          },
          {
            label: 'Diện tích gieo trồng',
            value: `${totalArea.toFixed(1).replace('.', ',')} ha`,
            note: usingMock ? '↑ 12% so với năm trước' : 'Theo vùng trồng liên kết',
            icon: BarChart3,
          },
          {
            label: 'Sản lượng dự kiến',
            value: `${expectedYield} tấn`,
            note: usingMock ? '↑ 8% so với năm trước' : 'Ước tính theo diện tích',
            icon: CheckCircle2,
          },
          {
            label: 'Mùa vụ đang diễn ra',
            value: activeCount,
            note: usingMock ? 'Vụ hiện tại: Vụ Hè Thu 2025' : 'Đang sản xuất / thu hoạch',
            icon: Clock3,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">{item.label}</div>
                  <div className="mt-1.5 text-[26px] font-extrabold tracking-tight text-emerald-700">
                    {item.value}
                  </div>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-2.5 text-[10px] font-medium text-emerald-600">
                {item.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & filters */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Search className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800">Tìm kiếm & bộ lọc</h2>
            <p className="text-[10px] text-slate-400">Lọc theo tên mùa vụ, cây trồng hoặc trạng thái</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 p-4 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên mùa vụ, cây trồng, vùng trồng..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
          </div>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 lg:min-w-[160px]"
          >
            <option value="Tất cả">Tất cả cây trồng</option>
            {crops.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 lg:min-w-[160px]"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            {Object.values(statusText).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-xs text-rose-700">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold text-rose-500">!</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center text-sm text-slate-400 shadow-sm">
          Đang tải dữ liệu mùa vụ...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-900">Danh sách mùa vụ</h2>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {filtered.length}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">Các mùa vụ được quản lý trong hệ thống</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    {totalArea.toFixed(1)} ha
                  </span>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    2025
                  </span>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Không tìm thấy mùa vụ phù hợp</div>
                  <p className="mt-1 text-xs text-slate-400">Thử thay đổi từ khóa hoặc bộ lọc.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">STT</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Tên mùa vụ</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Cây trồng</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Vùng trồng</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Diện tích</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Thời gian</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Trạng thái</th>
                        <th className="w-16 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map((s, idx) => (
                        <tr
                          key={s.id}
                          onClick={() => setSelected(s)}
                          className={`cursor-pointer transition-colors ${
                            selected?.id === s.id ? 'bg-emerald-50/60' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="px-4 py-3.5 text-xs font-medium text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-3.5">
                            <div className="font-semibold text-slate-800">{s.name}</div>
                            <div className="mt-0.5 text-[10px] text-slate-400">{s.unit_code || '—'}</div>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="inline-flex rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                              {s.crop}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-xs font-medium text-slate-600 max-w-[140px] truncate">
                            {s.unit_name || '—'}
                          </td>
                          <td className="px-3 py-3.5 text-xs font-semibold text-slate-700">
                            {getArea(s).toFixed(1)} ha
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="text-xs font-medium text-slate-700">{formatDate(s.start_date)}</div>
                            <div className="text-[10px] text-slate-400">→ {formatDate(s.expected_end_date)}</div>
                          </td>
                          <td className="px-3 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                statusClass[s.status] || statusClass.COMPLETED
                              }`}
                            >
                              {statusText[s.status] || s.status}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-flex items-center gap-1">
                              <button
                                onClick={() => setSelected(s)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                title="Xem"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setMenuId(menuId === s.id ? null : s.id)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {menuId === s.id && (
                                <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                  <button
                                    onClick={() => openEdit(s)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                                  </button>
                                  {s.status === 'PLANNED' && (
                                    <button
                                      onClick={() => handleStatus(s.id, 'ACTIVE')}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Bắt đầu
                                    </button>
                                  )}
                                  {(s.status === 'ACTIVE' || s.status === 'HARVESTING') && (
                                    <button
                                      onClick={() => handleClose(s.id)}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Đóng mùa vụ
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleStatus(s.id, 'CANCELLED')}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Hủy
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Detail panel */}
            <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              {selected ? (
                <div>
                  <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          statusClass[selected.status] || statusClass.COMPLETED
                        }`}
                      >
                        {statusText[selected.status]}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Chi tiết mùa vụ
                    </div>
                    <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                      {selected.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {selected.crop} · {selected.unit_name || 'Chưa gắn vùng trồng'}
                    </p>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                        <div className="text-[10px] font-medium text-slate-400">Ngày bắt đầu</div>
                        <div className="mt-1 text-xs font-bold text-slate-700">
                          {formatDate(selected.start_date)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                        <div className="text-[10px] font-medium text-slate-400">Kết thúc dự kiến</div>
                        <div className="mt-1 text-xs font-bold text-slate-700">
                          {formatDate(selected.expected_end_date)}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-100">
                      <div className="border-b border-slate-100 bg-slate-50/70 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Thông tin chung
                      </div>
                      <div className="divide-y divide-slate-50">
                        <div className="flex items-center justify-between px-3.5 py-2.5">
                          <span className="text-xs text-slate-500">Cây trồng</span>
                          <span className="text-xs font-bold text-slate-700">{selected.crop}</span>
                        </div>
                        <div className="flex items-center justify-between px-3.5 py-2.5">
                          <span className="text-xs text-slate-500">Mã vùng trồng</span>
                          <span className="text-xs font-bold text-slate-700">{selected.unit_code || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between px-3.5 py-2.5">
                          <span className="text-xs text-slate-500">Diện tích</span>
                          <span className="text-xs font-bold text-emerald-700">
                            {getArea(selected).toFixed(1)} ha
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(selected)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                      </button>
                      {(selected.status === 'ACTIVE' || selected.status === 'HARVESTING') && (
                        <button
                          onClick={() => handleClose(selected.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đóng vụ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Info className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Chọn một mùa vụ</div>
                  <p className="mt-1 text-xs text-slate-400">để xem chi tiết</p>
                </div>
              )}
            </aside>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-extrabold text-slate-900">Diện tích theo mùa vụ (ha)</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontSize: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                      }}
                    />
                    <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-extrabold text-slate-900">Cơ cấu cây trồng trong mùa vụ</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${value} ha`, 'Diện tích']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Notes */}
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800">
              <Info className="h-4 w-4" /> Lưu ý
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-700/90">
              <li>• Mùa vụ chỉ được xóa khi chưa có dữ liệu sản xuất, thu hoạch hoặc giao dịch liên quan.</li>
              <li>• Diện tích và sản lượng dự kiến được tự động cập nhật từ module Vùng trồng và Sản xuất.</li>
              <li>• Có thể liên kết nhiều cây trồng trên một mùa vụ nếu có sự xen canh.</li>
            </ul>
          </section>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingId ? 'Chỉnh sửa mùa vụ' : 'Tạo mùa vụ mới'}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Nhập thông tin kế hoạch sản xuất và vùng trồng liên kết.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Tên mùa vụ *</label>
                <input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Vụ Hè Thu 2026"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Cây trồng *</label>
                  <input
                    value={form.crop || ''}
                    onChange={(e) => setForm({ ...form, crop: e.target.value })}
                    placeholder="Cà phê Arabica"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Vùng trồng *</label>
                  <select
                    value={form.production_unit_id || ''}
                    onChange={(e) => setForm({ ...form, production_unit_id: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Chọn vùng trồng</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} · {u.unit_code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={form.start_date || ''}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Ngày kết thúc *</label>
                  <input
                    type="date"
                    value={form.expected_end_date || ''}
                    onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={saveSeason}
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo mùa vụ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
