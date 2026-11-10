import React, { useState } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, MapPin, User, FileSpreadsheet } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService, Warehouse } from '@/services/warehouseService';
import { exportToExcel } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/ToastNotification';

export const FinishedWarehousesTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Query Warehouses
  const { data: warehouses = [], isLoading } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getWarehouses(),
  });

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingWarehouse) {
        return warehouseService.updateWarehouse(editingWarehouse.id, {
          warehouse_code: formCode,
          name: formName,
          location: formLocation,
          status: formStatus,
        });
      }
      return warehouseService.createWarehouse({
        warehouse_code: formCode,
        name: formName,
        location: formLocation,
        status: formStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setModalOpen(false);
      setEditingWarehouse(null);
      showToast(editingWarehouse ? 'Đã cập nhật kho thành công!' : 'Đã thêm kho mới thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi lưu thông tin kho', 'error');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => warehouseService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      showToast('Đã xóa kho thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Không thể xóa kho lưu trữ', 'error');
    },
  });

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setFormCode(`KHO-${(warehouses.length + 1).toString().padStart(2, '0')}`);
    setFormName('');
    setFormLocation('');
    setFormStatus('ACTIVE');
    setModalOpen(true);
  };

  const handleOpenEdit = (w: Warehouse) => {
    setEditingWarehouse(w);
    setFormCode(w.warehouse_code);
    setFormName(w.name);
    setFormLocation(w.location || '');
    setFormStatus(w.status);
    setModalOpen(true);
  };

  const filteredWarehouses = warehouses.filter((w) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      w.warehouse_code.toLowerCase().includes(term) ||
      w.name.toLowerCase().includes(term) ||
      (w.location && w.location.toLowerCase().includes(term))
    );
  });

  const handleExportExcel = () => {
    const rows = filteredWarehouses.map((w, idx) => ({
      STT: idx + 1,
      'Mã Kho': w.warehouse_code,
      'Tên Kho Lưu Trữ': w.name,
      'Địa Điểm / Vị Trí': w.location || '---',
      'Thủ Kho Quản Lý': w.manager?.full_name || 'Chưa gán',
      'Trạng Thái': w.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm dừng',
      'Ngày Tạo': w.created_at ? w.created_at.slice(0, 10) : '---',
    }));
    exportToExcel(rows, `danh_sach_kho_htx_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4 animate-fade-in text-[13px]">
      {/* Top Controls & KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng số kho lưu trữ</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{warehouses.length} địa điểm</div>
            <div className="text-[10.5px] text-slate-400">Kho mát, kho lạnh, thành phẩm</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Đang vận hành</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              {warehouses.filter((w) => w.status === 'ACTIVE').length} kho
            </div>
            <div className="text-[10.5px] text-emerald-600">Đủ điều kiện kiểm soát KCS</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Quy chuẩn kho</div>
            <div className="text-sm font-black text-slate-800 mt-1">Chuẩn bảo quản OCOP</div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">Nhiệt độ &amp; độ ẩm kiểm soát</div>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" /> Khai báo kho mới
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã kho, tên kho, địa điểm..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel Danh Sách
        </button>
      </div>

      {/* Warehouses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mã &amp; Tên Kho</th>
                <th className="py-3 px-4">Vị Trí / Địa Điểm</th>
                <th className="py-3 px-4">Thủ Kho Phụ Trách</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Đang tải danh sách kho lưu trữ...</td>
                </tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Chưa có kho lưu trữ nào</p>
                    <p className="text-xs text-slate-400 mt-0.5">Bấm "Khai báo kho mới" để thiết lập kho thành phẩm OCOP.</p>
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        {w.warehouse_code}
                      </div>
                      <div className="text-xs text-slate-700 font-semibold mt-0.5">{w.name}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{w.location || 'Chưa cập nhật địa chỉ'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{w.manager?.full_name || 'Chưa chỉ định thủ kho'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {w.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                          <XCircle className="w-3 h-3 text-slate-400" /> Tạm dừng
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(w)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer transition"
                          title="Chỉnh sửa kho"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa kho [${w.name}]?`)) {
                              deleteMutation.mutate(w.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition"
                          title="Xóa kho"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit Warehouse */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900">
              {editingWarehouse ? 'Chỉnh Sửa Kho Lưu Trữ' : 'Khai Báo Kho Lưu Trữ Mới'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã Kho (Mã định danh)</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="KHO-01"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Kho</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Kho thành phẩm số 1 - Bảo quản lạnh"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vị Trí / Địa Chỉ</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Khu chế biến trung tâm HTX"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái Vận Hành</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm dừng vận hành</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !formName.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Thông Tin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
