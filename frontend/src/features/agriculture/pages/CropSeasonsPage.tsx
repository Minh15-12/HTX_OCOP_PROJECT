import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays, Eye, MoreVertical, Plus, Search,
  Sprout, Pencil, CheckCircle2, PlayCircle, Truck, X, XCircle
} from 'lucide-react';
import {
  fetchCropSeasons,
  createCropSeason,
  closeCropSeason,
  updateCropSeason,
  type CropSeason,
  type CropSeasonFormData,
} from '../../../services/cropSeasonApi';
import {
  fetchProductionUnits,
  type ProductionUnit,
} from '../../../services/farmPlotApi';

// Map status backend → hiển thị tiếng Việt
const statusText: Record<string, string> = {
  PLANNED: 'Chưa bắt đầu',
  ACTIVE: 'Đang diễn ra',
  HARVESTING: 'Đang thu hoạch',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

const statusClass: Record<string, string> = {
  PLANNED: 'bg-amber-50 text-amber-700 border-amber-100',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  HARVESTING: 'bg-blue-50 text-blue-700 border-blue-100',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100',
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

  // Load danh sách mùa vụ
  const loadSeasons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await fetchCropSeasons({ per_page: 50 });
      // apiClient đã trả về response.data
      const list = res?.data ?? res ?? [];
      setSeasons(Array.isArray(list) ? list : []);
      setSelected((prev) => list.find((x: CropSeason) => x.id === prev?.id) ?? list[0] ?? null);
    } catch (err: any) {
      console.error(err);
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

  const filtered = useMemo(() => {
    return seasons.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        [s.name, s.crop, s.unit_name || ''].some((v) =>
          (v || '').toLowerCase().includes(q)
        );
      const matchStatus =
        status === 'Tất cả' || statusText[s.status] === status;
      const matchCrop = crop === 'Tất cả' || s.crop === crop;
      return matchSearch && matchStatus && matchCrop;
    });
  }, [seasons, search, status, crop]);

  const crops = Array.from(new Set(seasons.map((s) => s.crop)));
  const activeCount = seasons.filter((s) => s.status === 'ACTIVE').length;

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      crop: '',
      production_unit_id: '', // tạm thời nhập tay hoặc chọn sau
      start_date: '',
      expected_end_date: '',
    });
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
      alert('Vui lòng nhập đầy đủ: Tên, Cây trồng, Vùng sản xuất, Ngày bắt đầu, Ngày kết thúc');
      return;
    }
    if (form.expected_end_date <= form.start_date) {
      alert('Ngày kết thúc phải sau ngày bắt đầu');
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

  const handleClose = async (id: string) => {
    if (!confirm('Bạn có chắc muốn đóng mùa vụ này?')) return;
    try {
      await closeCropSeason(id);
      await loadSeasons();
      setMenuId(null);
    } catch (err: any) {
      alert(err?.message || 'Đóng mùa vụ thất bại');
    }
  };

  return (
    <div className="space-y-4 pb-8 text-[13px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Mùa vụ</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Quản lý mùa vụ sản xuất theo vùng trồng (Production Unit).
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Tạo mùa vụ mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Tổng mùa vụ</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">{seasons.length}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Đang diễn ra</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Đã kết thúc</div>
          <div className="mt-1 text-2xl font-bold text-slate-600">
            {seasons.filter((s) => s.status === 'COMPLETED').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên mùa vụ, cây trồng..."
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

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Danh sách */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl border bg-white py-16 text-center text-slate-500">
                Chưa có mùa vụ nào
              </div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`cursor-pointer rounded-xl border bg-white p-4 transition hover:border-emerald-300 ${
                    selected?.id === s.id ? 'border-emerald-500 ring-1 ring-emerald-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-800">{s.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {s.crop} · {s.unit_name || s.unit_code || 'Chưa gắn vùng'}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {s.start_date} → {s.expected_end_date}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                          statusClass[s.status] || ''
                        }`}
                      >
                        {statusText[s.status] || s.status}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuId(menuId === s.id ? null : s.id);
                          }}
                          className="rounded p-1 hover:bg-slate-100"
                        >
                          <MoreVertical className="h-4 w-4 text-slate-500" />
                        </button>
                        {menuId === s.id && (
                          <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border bg-white py-1 shadow-lg">
                            {s.status !== 'COMPLETED' && s.status !== 'CANCELLED' && (
                              <button
                                onClick={() => openEdit(s)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Sửa
                              </button>
                            )}
                            {s.status === 'PLANNED' && (
                              <button
                                onClick={() => handleStatus(s.id, 'ACTIVE')}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
                              >
                                <PlayCircle className="h-3.5 w-3.5" /> Bắt đầu vụ
                              </button>
                            )}
                            {s.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleStatus(s.id, 'HARVESTING')}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
                              >
                                <Truck className="h-3.5 w-3.5" /> Bắt đầu thu hoạch
                              </button>
                            )}
                            {s.status !== 'COMPLETED' && s.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleStatus(s.id, 'CANCELLED')}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-slate-50"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Hủy vụ
                              </button>
                            )}
                            {s.status !== 'COMPLETED' && s.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleClose(s.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Đóng vụ
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chi tiết */}
          <div className="rounded-xl border bg-white p-4">
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Chi tiết mùa vụ</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{selected.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cây trồng</span>
                    <span className="font-medium">{selected.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vùng trồng</span>
                    <span className="font-medium">{selected.unit_name || selected.unit_code || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bắt đầu</span>
                    <span className="font-medium">{selected.start_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kết thúc dự kiến</span>
                    <span className="font-medium">{selected.expected_end_date}</span>
                  </div>
                  {selected.actual_end_date && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kết thúc thực tế</span>
                      <span className="font-medium">{selected.actual_end_date}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass[selected.status]}`}>
                      {statusText[selected.status] || selected.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400">Chọn một mùa vụ để xem chi tiết</div>
            )}
          </div>
        </div>
      )}

      {/* Modal tạo mới */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingId ? 'Sửa mùa vụ' : 'Tạo mùa vụ mới'}</h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tên mùa vụ *</label>
                <input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="Ví dụ: Vụ Hè Thu 2026"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Cây trồng *</label>
                <input
                  value={form.crop || ''}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="Cà phê Arabica"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Vùng trồng *
                </label>
                <select
                  disabled={!!editingId}
                  value={form.production_unit_id || ''}
                  onChange={(e) => setForm({ ...form, production_unit_id: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">-- Chọn vùng trồng --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.unit_code})
                    </option>
              ))}
            </select>
            {units.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-600">
                Chưa có vùng trồng. Hãy tạo vùng trồng trước.
              </p>
            )}
          </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={form.start_date || ''}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Ngày kết thúc *</label>
                  <input
                    type="date"
                    value={form.expected_end_date || ''}
                    onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={saveSeason}
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
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