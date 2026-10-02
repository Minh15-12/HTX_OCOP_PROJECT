import React, { useEffect, useMemo, useState } from 'react';
import { Eye, MapPin, Plus, Search, X, Pencil } from 'lucide-react';
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
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  PREPARING: 'bg-amber-50 text-amber-700 border-amber-100',
  FALLOW: 'bg-slate-100 text-slate-600 border-slate-200',
  INACTIVE: 'bg-red-50 text-red-600 border-red-100',
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

  // Modal vùng trồng (tạo / sửa)
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UnitForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Thửa đất của vùng đang chọn
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
    'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400';

  return (
    <div className="space-y-4 pb-8 text-[13px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Vùng trồng</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Quản lý vùng sản xuất và thửa đất: mã, diện tích, cây trồng chủ lực.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Khai báo vùng trồng mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Tổng vùng trồng</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">{units.length}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Tổng diện tích (ha)</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{totalArea.toFixed(1)}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Đang canh tác</div>
          <div className="mt-1 text-2xl font-bold text-slate-700">
            {units.filter((u) => u.status === 'ACTIVE').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, mã, cây trồng..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option>Tất cả</option>
          {Object.values(statusText).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option>Tất cả</option>
          {crops.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-20 text-center text-slate-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl border bg-white py-16 text-center text-slate-500">
                Chưa có vùng trồng nào
              </div>
            ) : (
              filtered.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={`cursor-pointer rounded-xl border bg-white p-4 transition hover:border-emerald-300 ${
                    selected?.id === u.id ? 'border-emerald-500 ring-1 ring-emerald-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {u.unit_code} · {u.crop} · {u.area} ha
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                          statusClass[u.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusText[u.status] || u.status}
                      </span>
                      <button
                        title="Sửa vùng trồng"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(u);
                        }}
                        className="rounded p-1 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chi tiết + thửa đất */}
          <div className="rounded-xl border bg-white p-4">
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Chi tiết vùng trồng</span>
                  </div>
                  <button
                    onClick={() => openEdit(selected)}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Sửa
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{selected.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã</span>
                    <span className="font-medium">{selected.unit_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cây trồng</span>
                    <span className="font-medium">{selected.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Diện tích</span>
                    <span className="font-medium">{selected.area} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass[selected.status] || ''}`}>
                      {statusText[selected.status] || selected.status}
                    </span>
                  </div>
                </div>

                {/* Thửa đất */}
                <div className="border-t pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Thửa đất ({plots.length})
                    </span>
                    <button
                      onClick={() => setShowPlotForm((v) => !v)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <Plus className="h-3.5 w-3.5" /> Thêm thửa
                    </button>
                  </div>

                  {showPlotForm && (
                    <div className="mb-3 space-y-2 rounded-lg bg-slate-50 p-3">
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
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowPlotForm(false)}
                          className="rounded-lg border px-3 py-1.5 text-xs hover:bg-white"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={savePlot}
                          disabled={plotSaving}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {plotSaving ? 'Đang lưu...' : 'Lưu thửa'}
                        </button>
                      </div>
                    </div>
                  )}

                  {plotsLoading ? (
                    <div className="py-4 text-center text-xs text-slate-400">Đang tải thửa đất...</div>
                  ) : plots.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">Chưa có thửa đất nào</div>
                  ) : (
                    <ul className="space-y-1.5">
                      {plots.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                        >
                          <span className="font-medium text-slate-700">{p.plot_code}</span>
                          <span className="text-slate-500">
                            {p.area} m² · {statusText[p.status] || p.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400">Chọn một vùng trồng để xem chi tiết</div>
            )}
          </div>
        </div>
      )}

      {/* Modal tạo / sửa */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingId ? 'Sửa vùng trồng' : 'Khai báo vùng trồng mới'}</h3>
              <button onClick={() => setModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tên vùng trồng *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="Vùng trồng Cà phê Cầu Đất"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Mã vùng * {editingId && <span className="text-slate-400">(không đổi được)</span>}
                </label>
                <input
                  value={form.unit_code}
                  disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, unit_code: e.target.value })}
                  className={inputCls}
                  placeholder="VT-LAMHA-01"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Cây trồng chủ lực *</label>
                <input
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  className={inputCls}
                  placeholder="Cà phê Arabica"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Diện tích (ha) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value === '' ? '' : Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
              {editingId && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className={inputCls}
                  >
                    {Object.entries(statusText).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setModal(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={save}
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo vùng trồng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
