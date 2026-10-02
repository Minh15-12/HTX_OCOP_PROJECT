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
} from 'lucide-react';
import {
  fetchProductionUnits,
  createProductionUnit,
  updateProductionUnit,
  fetchPlotsByUnit,
  createPlot,
  type ProductionUnit,
  type FarmPlot,
} from '../../../services/farmPlotApi';

const statusText: Record<string, string> = {
  ACTIVE: 'Đang canh tác',
  PREPARING: 'Chuẩn bị đất',
  FALLOW: 'Đang nghỉ',
  INACTIVE: 'Ngưng',
};

const statusClass: Record<string, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PREPARING: 'border-amber-200 bg-amber-50 text-amber-700',
  FALLOW: 'border-slate-200 bg-slate-100 text-slate-600',
  INACTIVE: 'border-red-200 bg-red-50 text-red-600',
};

type UnitForm = { name: string; unit_code: string; crop: string; area: number | ''; status: string };
const emptyForm: UnitForm = { name: '', unit_code: 'VT-', crop: '', area: '', status: 'ACTIVE' };

const toList = (res: any): any[] => {
  const list = res?.data ?? res ?? [];
  return Array.isArray(list) ? list : [];
};

export const FarmPlotsPage: React.FC = () => {
  const [units, setUnits] = useState<ProductionUnit[]>([]);
  const [selected, setSelected] = useState<ProductionUnit | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Tất cả');
  const [crop, setCrop] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UnitForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [plotForm, setPlotForm] = useState({ plot_code: '', area: '' });
  const [plotSaving, setPlotSaving] = useState(false);
  const [showPlotForm, setShowPlotForm] = useState(false);

  const loadUnits = async (keepId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const list = toList(await fetchProductionUnits({ per_page: 50 }));
      setUnits(list);
      const current = list.find((u: ProductionUnit) => u.id === (keepId ?? selected?.id));
      setSelected(current ?? list[0] ?? null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Không tải được danh sách vùng trồng');
    } finally {
      setLoading(false);
    }
  };

  const loadPlots = async (unitId: string) => {
    try {
      setPlotsLoading(true);
      setPlots(toList(await fetchPlotsByUnit(unitId)));
    } catch (err) {
      console.error(err);
      setPlots([]);
    } finally {
      setPlotsLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    setShowPlotForm(false);
    setPlotForm({ plot_code: '', area: '' });
    if (selected?.id) loadPlots(selected.id);
    else setPlots([]);
  }, [selected?.id]);

  const filtered = useMemo(() => {
    return units.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || [u.name, u.unit_code, u.crop].some((v) => (v || '').toLowerCase().includes(q));
      const matchStatus = status === 'Tất cả' || statusText[u.status] === status;
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
      if (editingId) {
        await updateProductionUnit(editingId, {
          name: form.name.trim(),
          crop: form.crop.trim(),
          area: Number(form.area),
          status: form.status,
        });
      } else {
        await createProductionUnit({
          unit_code: form.unit_code.trim(),
          name: form.name.trim(),
          crop: form.crop.trim(),
          area: Number(form.area),
        });
      }
      setModal(false);
      await loadUnits(editingId ?? undefined);
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
      await createPlot(selected.id, {
        plot_code: plotForm.plot_code.trim(),
        area: Number(plotForm.area),
      });
      setPlotForm({ plot_code: '', area: '' });
      setShowPlotForm(false);
      await loadPlots(selected.id);
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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Vùng trồng</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý vùng sản xuất, diện tích và các thửa đất trực thuộc.
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
              <p className="mt-1 text-xs text-slate-400">Diện tích canh tác</p>
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
              placeholder="Tìm tên vùng, mã vùng, cây trồng..."
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
                filtered.map((u) => (
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
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass[u.status] || 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                            {statusText[u.status] || u.status}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span>Mã: <b className="font-semibold text-slate-600">{u.unit_code}</b></span>
                          <span>Cây trồng: <b className="font-semibold text-slate-600">{u.crop}</b></span>
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
                ))
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
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass[selected.status] || ''}`}>
                      {statusText[selected.status] || selected.status}
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
                            placeholder="Mã thửa, ví dụ: T-001"
                            className={inputCls}
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={plotForm.area}
                            onChange={(e) => setPlotForm({ ...plotForm, area: e.target.value })}
                            placeholder="Diện tích (m²)"
                            className={inputCls}
                          />
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
                      <ul className="space-y-2">
                        {plots.map((p) => (
                          <li key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3 transition hover:border-emerald-100 hover:bg-emerald-50/40">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-700">{p.plot_code}</p>
                                <p className="mt-0.5 text-[10px] text-slate-400">{statusText[p.status] || p.status}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-600">{p.area} m²</span>
                          </li>
                        ))}
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Quản lý vùng trồng</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900">{editingId ? 'Sửa vùng trồng' : 'Khai báo vùng trồng mới'}</h3>
                <p className="mt-1 text-xs text-slate-400">Nhập thông tin để quản lý vùng sản xuất.</p>
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
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Cây trồng chủ lực *</label>
                <div className="relative">
                  <Sprout className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className={`${inputCls} pl-10`} placeholder="Cà phê Arabica" />
                </div>
              </div>
              {editingId && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Trạng thái</label>
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
