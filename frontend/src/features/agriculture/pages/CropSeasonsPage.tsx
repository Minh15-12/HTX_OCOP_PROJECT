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
} from 'lucide-react';
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
  PLANNED: 'bg-amber-50 text-amber-700 ring-amber-100',
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  HARVESTING: 'bg-blue-50 text-blue-700 ring-blue-100',
  COMPLETED: 'bg-slate-100 text-slate-600 ring-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-600 ring-rose-100',
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toLocaleDateString('vi-VN');
};

const daysBetween = (start: string, end: string) => {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.max(1, Math.round((b - a) / 86400000));
};

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

  const loadSeasons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await fetchCropSeasons({ per_page: 50 });
      const list = res?.data ?? res ?? [];
      const next = Array.isArray(list) ? list : [];
      setSeasons(next);
      setSelected((prev) => next.find((x: CropSeason) => x.id === prev?.id) ?? next[0] ?? null);
    } catch (err: any) {
      setError(err?.message || 'Không tải được danh sách mùa vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
    fetchProductionUnits({ per_page: 100 })
      .then((res: any) => {
        const list = res?.data ?? res ?? [];
        setUnits(Array.isArray(list) ? list : []);
      })
      .catch(() => setUnits([]));
  }, []);

  const filtered = useMemo(() => seasons.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q || [s.name, s.crop, s.unit_name || '', s.unit_code || ''].some((v) => (v || '').toLowerCase().includes(q));
    const matchStatus = status === 'Tất cả' || statusText[s.status] === status;
    const matchCrop = crop === 'Tất cả' || s.crop === crop;
    return matchSearch && matchStatus && matchCrop;
  }), [seasons, search, status, crop]);

  const crops = Array.from(new Set(seasons.map((s) => s.crop).filter(Boolean)));
  const totalArea = seasons.reduce((sum, s) => {
    const unit = units.find((u) => u.id === s.production_unit_id);
    return sum + (unit ? Number(unit.area) || 0 : 0);
  }, 0);
  const activeCount = seasons.filter((s) => s.status === 'ACTIVE' || s.status === 'HARVESTING').length;
  const completedCount = seasons.filter((s) => s.status === 'COMPLETED').length;

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
    } catch (err: any) {
      alert(err?.message || (editingId ? 'Cập nhật mùa vụ thất bại' : 'Tạo mùa vụ thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Bạn có chắc muốn đóng mùa vụ này?')) return;
    try {
      await closeCropSeason(id);
      setMenuId(null);
      await loadSeasons();
    } catch (err: any) {
      alert(err?.message || 'Đóng mùa vụ thất bại');
    }
  };

  const handleStatus = async (id: string, next: 'ACTIVE' | 'HARVESTING' | 'CANCELLED') => {
    if (next === 'CANCELLED' && !confirm('Bạn có chắc muốn hủy mùa vụ này?')) return;
    try {
      await updateCropSeason(id, { status: next } as any);
      setMenuId(null);
      await loadSeasons();
    } catch (err: any) {
      alert(err?.message || 'Đổi trạng thái mùa vụ thất bại');
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50';

  const statusCounts = {
    planned: seasons.filter((s) => s.status === 'PLANNED').length,
    active: seasons.filter((s) => s.status === 'ACTIVE').length,
    harvesting: seasons.filter((s) => s.status === 'HARVESTING').length,
    completed: seasons.filter((s) => s.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-full space-y-5 bg-slate-50/30 pb-10 text-[13px]">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200/70">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-emerald-600">
              <span>Quản lý nghiệp vụ</span><ChevronRight className="h-3 w-3 text-slate-300" /><span className="text-slate-400">Mùa vụ</span>
            </div>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Mùa vụ</h1>
              <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-100">Quản lý sản xuất</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Theo dõi tiến độ sản xuất, diện tích gieo trồng và liên kết với vùng trồng.</p>
          </div>
        </div>
        <button onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(5,150,105,.18)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg">
          <Plus className="h-4 w-4" /> Tạo mùa vụ mới
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng số mùa vụ', value: seasons.length, note: 'Mùa vụ trong hệ thống', icon: Sprout, box: 'bg-emerald-50 text-emerald-600', accent: 'text-slate-900' },
          { label: 'Diện tích gieo trồng', value: `${totalArea.toFixed(1)} ha`, note: 'Theo vùng trồng liên kết', icon: BarChart3, box: 'bg-blue-50 text-blue-600', accent: 'text-blue-700' },
          { label: 'Mùa vụ đang diễn ra', value: activeCount, note: `${statusCounts.active} sản xuất · ${statusCounts.harvesting} thu hoạch`, icon: Clock3, box: 'bg-amber-50 text-amber-600', accent: 'text-amber-700' },
          { label: 'Đã kết thúc', value: completedCount, note: 'Mùa vụ đã hoàn thành', icon: CheckCircle2, box: 'bg-slate-100 text-slate-500', accent: 'text-slate-800' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">{item.label}</div>
                  <div className={`mt-1.5 text-[28px] font-extrabold tracking-tight ${item.accent}`}>{item.value}</div>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.box} ring-1 ring-inset ring-black/[.03]`}><Icon className="h-5 w-5" /></div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-2.5 text-[10px] text-slate-400">{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Search and filters */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Search className="h-3.5 w-3.5" /></div>
          <div><h2 className="text-xs font-bold text-slate-800">Tìm kiếm & bộ lọc</h2><p className="text-[10px] text-slate-400">Lọc theo tên mùa vụ, cây trồng hoặc trạng thái</p></div>
        </div>
        <div className="flex flex-col gap-2.5 p-4 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên mùa vụ, cây trồng, vùng trồng..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50" />
          </div>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 lg:min-w-[170px]">
            <option value="Tất cả">Tất cả cây trồng</option>{crops.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 lg:min-w-[170px]">
            <option value="Tất cả">Tất cả trạng thái</option>{Object.values(statusText).map((t) => <option key={t}>{t}</option>)}
          </select>
          {(search || crop !== 'Tất cả' || status !== 'Tất cả') && <button onClick={() => { setSearch(''); setCrop('Tất cả'); setStatus('Tất cả'); }} className="h-11 rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">Xóa lọc</button>}
        </div>
      </section>

      {error && <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-xs text-rose-700"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold text-rose-500">!</span>{error}</div>}

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center text-sm text-slate-400 shadow-sm">Đang tải dữ liệu mùa vụ...</div> : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
          {/* Main list */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="flex items-center gap-2"><h2 className="text-sm font-extrabold text-slate-900">Danh sách mùa vụ</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{filtered.length}</span></div><p className="mt-1 text-[10px] text-slate-400">Các mùa vụ được quản lý trong hệ thống</p></div>
              <div className="flex items-center gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">{totalArea.toFixed(1)} ha</span><span className="rounded-full bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">2025</span></div>
            </div>
            {filtered.length === 0 ? <div className="py-24 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><CalendarDays className="h-6 w-6" /></div><div className="text-sm font-semibold text-slate-600">Không tìm thấy mùa vụ phù hợp</div><p className="mt-1 text-xs text-slate-400">Thử thay đổi từ khóa hoặc bộ lọc.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="border-b border-slate-100 bg-slate-50/70"><tr><th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Mùa vụ</th><th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Cây trồng</th><th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Vùng trồng</th><th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Thời gian</th><th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Trạng thái</th><th className="w-20 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">
              {filtered.map((s) => <tr key={s.id} onClick={() => setSelected(s)} className={`cursor-pointer transition-all duration-150 ${selected?.id === s.id ? 'bg-emerald-50/70' : 'hover:bg-emerald-50/30'}`}>
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : s.status === 'HARVESTING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}><CalendarDays className="h-4.5 w-4.5" /></div><div><div className="font-bold text-slate-800">{s.name}</div><div className="mt-1 text-[10px] font-medium text-slate-400">{s.unit_code || 'Chưa có mã vùng'}</div></div></div></td>
                <td className="px-3 py-4"><span className="inline-flex rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">{s.crop}</span></td>
                <td className="px-3 py-4"><div className="max-w-[160px] truncate text-xs font-medium text-slate-600">{s.unit_name || '—'}</div></td>
                <td className="px-3 py-4"><div className="text-xs font-semibold text-slate-700">{formatDate(s.start_date)}</div><div className="mt-1 text-[10px] text-slate-400">→ {formatDate(s.expected_end_date)}</div></td>
                <td className="px-3 py-4"><span className={`inline-flex rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset ${statusClass[s.status] || statusClass.COMPLETED}`}>{statusText[s.status] || s.status}</span></td>
                <td className="px-3 py-4"><div className="flex items-center justify-center gap-1"><button onClick={(e) => { e.stopPropagation(); setSelected(s); }} title="Xem chi tiết" className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"><Eye className="h-4 w-4" /></button><div className="relative"><button onClick={(e) => { e.stopPropagation(); setMenuId(menuId === s.id ? null : s.id); }} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreVertical className="h-4 w-4" /></button>{menuId === s.id && <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"><button onClick={() => openEdit(s)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" /> Chỉnh sửa</button>{s.status === 'PLANNED' && <button onClick={() => handleStatus(s.id, 'ACTIVE')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-emerald-50"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Bắt đầu mùa vụ</button>}{s.status === 'ACTIVE' && <button onClick={() => handleStatus(s.id, 'HARVESTING')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-blue-50">Đánh dấu thu hoạch</button>}{(s.status === 'ACTIVE' || s.status === 'HARVESTING') && <button onClick={() => handleClose(s.id)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50">Đóng mùa vụ</button>}{s.status !== 'COMPLETED' && <button onClick={() => handleStatus(s.id, 'CANCELLED')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50">Hủy mùa vụ</button>}</div>}</div></div></td>
              </tr>)}
            </tbody></table></div>}
          </section>

          {/* Detail panel */}
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selected ? <div>
              <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50/90 via-white to-white p-5">
                <div className="mb-4 flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100"><CalendarDays className="h-5 w-5" /></div><span className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset ${statusClass[selected.status]}`}>{statusText[selected.status]}</span></div>
                <div className="text-[10px] font-bold uppercase tracking-[.12em] text-emerald-600">Chi tiết mùa vụ</div><h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{selected.name}</h3><p className="mt-1.5 text-xs text-slate-500">{selected.crop} · {selected.unit_name || 'Chưa gắn vùng trồng'}</p>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"><div className="text-[10px] font-medium text-slate-400">Ngày bắt đầu</div><div className="mt-1.5 text-xs font-bold text-slate-700">{formatDate(selected.start_date)}</div></div><div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"><div className="text-[10px] font-medium text-slate-400">Kết thúc dự kiến</div><div className="mt-1.5 text-xs font-bold text-slate-700">{formatDate(selected.expected_end_date)}</div></div></div>
                <div className="overflow-hidden rounded-xl border border-slate-100"><div className="border-b border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Thông tin chung</div><div className="divide-y divide-slate-100"><div className="flex items-center justify-between gap-3 px-3.5 py-3"><span className="text-xs text-slate-500">Cây trồng</span><span className="text-xs font-bold text-slate-700">{selected.crop}</span></div><div className="flex items-center justify-between gap-3 px-3.5 py-3"><span className="text-xs text-slate-500">Mã vùng trồng</span><span className="text-xs font-bold text-slate-700">{selected.unit_code || '—'}</span></div><div className="flex items-center justify-between gap-3 px-3.5 py-3"><span className="text-xs text-slate-500">Thời lượng kế hoạch</span><span className="text-xs font-bold text-slate-700">{daysBetween(selected.start_date, selected.expected_end_date)} ngày</span></div><div className="flex items-center justify-between gap-3 px-3.5 py-3"><span className="text-xs text-slate-500">Kết thúc thực tế</span><span className="text-xs font-bold text-slate-700">{formatDate(selected.actual_end_date)}</span></div></div></div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-bold text-emerald-800"><Clock3 className="h-4 w-4" /> Tiến độ mùa vụ</div><span className="text-[10px] font-bold text-emerald-700">{selected.status === 'COMPLETED' ? '100%' : selected.status === 'HARVESTING' ? '80%' : selected.status === 'ACTIVE' ? '45%' : '8%'}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: selected.status === 'COMPLETED' ? '100%' : selected.status === 'HARVESTING' ? '80%' : selected.status === 'ACTIVE' ? '45%' : '8%' }} /></div><div className="mt-2 text-[10px] leading-4 text-emerald-700">{selected.status === 'COMPLETED' ? 'Mùa vụ đã hoàn thành.' : selected.status === 'HARVESTING' ? 'Đang trong giai đoạn thu hoạch.' : selected.status === 'ACTIVE' ? 'Đang triển khai sản xuất.' : 'Mùa vụ đang ở trạng thái kế hoạch.'}</div></div>
                <div className="flex gap-2 pt-1"><button onClick={() => openEdit(selected)} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"><Pencil className="mr-1.5 inline h-3.5 w-3.5" /> Chỉnh sửa</button><button onClick={() => setSelected(null)} className="rounded-xl border border-slate-200 px-3 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"><X className="h-4 w-4" /></button></div>
              </div>
            </div> : <div className="flex min-h-[520px] items-center justify-center p-8 text-center"><div><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500"><CalendarDays className="h-7 w-7" /></div><p className="text-sm font-bold text-slate-700">Chọn một mùa vụ</p><p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-400">Chọn một dòng trong danh sách để xem thông tin chi tiết và tiến độ.</p></div></div>}
          </aside>
        </div>
      )}

      {/* Create / edit modal */}
      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"><div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white px-6 py-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Sprout className="h-5 w-5" /></div><div><h3 className="font-extrabold text-slate-900">{editingId ? 'Chỉnh sửa mùa vụ' : 'Tạo mùa vụ mới'}</h3><p className="mt-1 text-[10px] text-slate-400">Nhập thông tin kế hoạch sản xuất và vùng trồng liên kết.</p></div></div><button onClick={() => setModalOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"><X className="h-5 w-5" /></button></div>
        <div className="space-y-4 p-6"><div><label className="mb-1.5 block text-xs font-bold text-slate-600">Tên mùa vụ *</label><input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Vụ Hè Thu 2026" className={inputCls} /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-bold text-slate-600">Cây trồng *</label><input value={form.crop || ''} onChange={(e) => setForm({ ...form, crop: e.target.value })} placeholder="Cà phê Arabica" className={inputCls} /></div><div><label className="mb-1.5 block text-xs font-bold text-slate-600">Vùng trồng *</label><select value={form.production_unit_id || ''} onChange={(e) => setForm({ ...form, production_unit_id: e.target.value })} className={inputCls}><option value="">Chọn vùng trồng</option>{units.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.unit_code}</option>)}</select></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-bold text-slate-600">Ngày bắt đầu *</label><input type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputCls} /></div><div><label className="mb-1.5 block text-xs font-bold text-slate-600">Ngày kết thúc *</label><input type="date" value={form.expected_end_date || ''} onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })} className={inputCls} /></div></div></div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4"><button onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Hủy</button><button onClick={saveSeason} disabled={submitting} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo mùa vụ'}</button></div>
      </div></div>}
    </div>
  );
};
