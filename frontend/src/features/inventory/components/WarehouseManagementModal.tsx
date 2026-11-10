import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Building2, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { warehouseService, Warehouse } from '@/services/warehouseService';

interface WarehouseManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WarehouseManagementModal: React.FC<WarehouseManagementModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState<'idle' | 'create' | 'edit'>('idle');
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({
    warehouse_code: '',
    name: '',
    location: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getWarehouses(),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof formData) => warehouseService.createWarehouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Không thể tạo kho mới');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: typeof formData }) =>
      warehouseService.updateWarehouse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Không thể cập nhật kho');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehouseService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Không thể xóa kho. Kho có thể đang có giao dịch phát sinh.');
    },
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setFormMode('idle');
    setEditingWarehouse(null);
    setFormData({ warehouse_code: '', name: '', location: '', status: 'ACTIVE' });
    setErrorMsg(null);
  };

  const startEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setFormData({
      warehouse_code: wh.warehouse_code,
      name: wh.name,
      location: wh.location || '',
      status: wh.status,
    });
    setFormMode('edit');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.warehouse_code.trim() || !formData.name.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ mã kho và tên kho');
      return;
    }

    if (formMode === 'create') {
      createMutation.mutate(formData);
    } else if (formMode === 'edit' && editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, payload: formData });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Quản lý Hệ thống Kho</h2>
              <p className="text-xs text-slate-500">Mạng lưới kho vật tư &amp; nông sản HTX</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Action */}
          {formMode === 'idle' ? (
            <button
              onClick={() => {
                resetForm();
                setFormMode('create');
              }}
              className="w-full py-2.5 border-2 border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm điểm kho mới
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {formMode === 'create' ? 'Thêm mới kho vật tư' : `Chỉnh sửa: ${editingWarehouse?.name}`}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Hủy
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mã kho *</label>
                  <input
                    type="text"
                    value={formData.warehouse_code}
                    onChange={(e) => setFormData({ ...formData, warehouse_code: e.target.value })}
                    placeholder="VD: KHO-TONG-01"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Tên kho *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Kho Vật Tư Nông Nghiệp Trung Tâm"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Địa điểm / Vị trí</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="VD: Khu A - Xã Tân Tiến"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Ngừng hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Lưu thông tin kho
                </button>
              </div>
            </form>
          )}

          {/* List Warehouses */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Danh sách điểm kho hiện tại ({warehouses.length})
            </h3>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                Đang tải dữ liệu kho...
              </div>
            ) : warehouses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                Chưa có điểm kho nào được thiết lập. Hãy tạo kho đầu tiên!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {warehouses.map((wh) => (
                  <div key={wh.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{wh.warehouse_code}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-xs font-bold text-slate-800">{wh.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            wh.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {wh.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{wh.location || 'Chưa cập nhật địa chỉ'}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(wh)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Chỉnh sửa kho"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${wh.name}"?`)) {
                            deleteMutation.mutate(wh.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa kho"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
