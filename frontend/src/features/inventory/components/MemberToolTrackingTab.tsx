import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wrench, Search, Plus, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Download,
  UserCheck, Hash, Calendar, FileSpreadsheet, X
} from 'lucide-react';
import { MemberToolTracking, Material } from '../../../types/inventory';
import { inventoryApi } from '../../../services/inventoryApi';
import { getMembersFromApi } from '@/services/memberService';

interface MemberToolTrackingTabProps {
  materials: Material[];
}

export const MemberToolTrackingTab: React.FC<MemberToolTrackingTabProps> = ({ materials }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<MemberToolTracking | null>(null);
  const [replaceNote, setReplaceNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Form State cấp phát
  const [assignForm, setAssignForm] = useState({
    member_id: '',
    material_id: '',
    farm_plot_id: '',
    serial_number: '',
    quantity: 1,
    assigned_date: new Date().toISOString().slice(0, 10),
    note: '',
  });

  // Query Tool Trackings
  const { data: toolTrackings = [], isLoading } = useQuery({
    queryKey: ['toolTrackings'],
    queryFn: () => inventoryApi.getToolTrackings(),
  });

  // Query Danh sách Xã viên để chọn khi cấp phát
  const { data: members = [] } = useQuery({
    queryKey: ['membersList'],
    queryFn: () => getMembersFromApi().catch(() => []),
  });

  // Lọc chỉ lấy vật tư là Nông cụ lâu bền
  const durableMaterials = useMemo(() => {
    return materials.filter((m) => m.isDurableTool || m.category === 'Nông cụ');
  }, [materials]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Mutation Cấp phát nông cụ
  const assignMutation = useMutation({
    mutationFn: (payload: any) => inventoryApi.assignTool(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolTrackings'] });
      setIsAssignModalOpen(false);
      setAssignForm({
        member_id: '',
        material_id: '',
        farm_plot_id: '',
        serial_number: '',
        quantity: 1,
        assigned_date: new Date().toISOString().slice(0, 10),
        note: '',
      });
      showToast('Cấp phát nông cụ định danh cho xã viên thành công (TK 005)!');
    },
    onError: () => {
      showToast('Không thể cấp phát nông cụ lúc này. Vui lòng thử lại!');
    },
  });

  // Mutation Đổi trả 1:1 hoặc Cập nhật trạng thái
  const statusMutation = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: string; note?: string }) =>
      inventoryApi.updateToolStatus(id, { action, note }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['toolTrackings'] });
      setReplaceTarget(null);
      setReplaceNote('');
      const msg = variables.action === 'REPLACE_1_1'
        ? 'Đã đổi mới 1:1 nông cụ hỏng cho xã viên!'
        : 'Đã cập nhật trạng thái nông cụ thành công!';
      showToast(msg);
    },
    onError: () => {
      showToast('Cập nhật trạng thái nông cụ thất bại!');
    },
  });

  // Filtered Items
  const filtered = useMemo(() => {
    return toolTrackings.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        (t.material_name && t.material_name.toLowerCase().includes(q)) ||
        (t.member_name && t.member_name.toLowerCase().includes(q)) ||
        (t.serial_number && t.serial_number.toLowerCase().includes(q)) ||
        (t.farm_plot_name && t.farm_plot_name.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [toolTrackings, search, statusFilter]);

  // Xuất file CSV danh sách nông cụ TK 005 cho Laptop
  const exportCSV = () => {
    const headers = [
      'Tên Nông Cụ',
      'Số Serial / Mã Quản Lý',
      'Xã Viên Phụ Trách',
      'Nhà Màng / Vùng Trồng',
      'Số Lượng',
      'Ngày Cấp Phát',
      'Trạng Thái',
      'Ghi Chú',
    ];
    const rows = filtered.map((t) => [
      `"${(t.material_name || '').replace(/"/g, '""')}"`,
      `"${(t.serial_number || '').replace(/"/g, '""')}"`,
      `"${(t.member_name || '').replace(/"/g, '""')}"`,
      `"${(t.farm_plot_name || '').replace(/"/g, '""')}"`,
      t.quantity,
      t.assigned_date,
      t.status,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Theo_doi_Nong_cu_TK005_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_USE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Đang sử dụng
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Wrench className="w-3 h-3" /> Đang bảo dưỡng
          </span>
        );
      case 'REPLACED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <RefreshCw className="w-3 h-3" /> Đã đổi mới 1:1
          </span>
        );
      case 'DAMAGED_RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> Hỏng đã thu hồi
          </span>
        );
      case 'LOST':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Báo mất
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner giới thiệu Chuẩn hóa Tài khoản 005 */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide uppercase">
                Tài Khoản Ngoài Bảng 005 — Công Cụ Dụng Cụ Lâu Bền Giao Xã Viên
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950">
                Thông tư 71/2024/TT-BTC
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Theo dõi định danh từng kéo tỉa cành, bình phun điện, bút đo pH/EC cấp cho từng hộ xã viên. Hỗ trợ cơ chế Đổi mới 1:1 xác hỏng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/20"
            title="Xuất bảng kê nông cụ theo dõi TK 005 ra file Excel cho laptop"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Cấp Nông Cụ Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên nông cụ, số serial, xã viên, nhà màng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="IN_USE">Đang sử dụng</option>
            <option value="MAINTENANCE">Đang bảo dưỡng</option>
            <option value="REPLACED">Đã đổi mới 1:1</option>
            <option value="DAMAGED_RETURNED">Hỏng đã thu hồi</option>
            <option value="LOST">Báo mất</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Hiển thị: <span className="font-bold text-slate-900">{filtered.length}</span> nông cụ
        </div>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Tên Nông Cụ (CCDC)</th>
                <th className="py-3 px-4">Mã Serial / Định Danh</th>
                <th className="py-3 px-4">Xã Viên Phụ Trách</th>
                <th className="py-3 px-4">Nhà Màng / Vùng Trồng</th>
                <th className="py-3 px-4 text-center">Số Lượng</th>
                <th className="py-3 px-4">Ngày Cấp</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Đang tải danh sách nông cụ ngoài bảng TK 005...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Chưa có nông cụ lâu bền nào được cấp phát
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{item.material_name}</span>
                      </div>
                      {item.material_code && (
                        <div className="text-[10.5px] font-mono text-slate-400 mt-0.5">
                          {item.material_code}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                      {item.serial_number || 'Chưa gán serial'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.member_name || 'Hộ xã viên'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.farm_plot_name || 'Vùng trồng chính'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.assigned_date}</td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.status === 'IN_USE' && (
                          <>
                            <button
                              onClick={() => setReplaceTarget(item)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                              title="Đổi mới 1:1 khi nông cụ bị hỏng kỹ thuật"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Đổi 1:1</span>
                            </button>
                            <button
                              onClick={() => statusMutation.mutate({ id: item.id, action: 'MAINTENANCE' })}
                              className="p-1 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors cursor-pointer"
                              title="Chuyển sang bảo dưỡng định kỳ"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {item.status === 'MAINTENANCE' && (
                          <button
                            onClick={() => statusMutation.mutate({ id: item.id, action: 'IN_USE' })}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                            title="Hoàn tất bảo dưỡng, đưa lại sử dụng"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Bảo dưỡng xong</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cấp Nông Cụ Mới */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase">
                  Cấp Phát Nông Cụ Định Danh Cho Xã Viên (TK 005)
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                assignMutation.mutate(assignForm);
              }}
              className="p-6 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn Xã Viên Nhận Nông Cụ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignForm.member_id}
                  onChange={(e) => setAssignForm({ ...assignForm, member_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  required
                >
                  <option value="">-- Chọn xã viên trong HTX --</option>
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.member_code || m.phone || 'Xã viên'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn Nông Cụ Lâu Bền <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignForm.material_id}
                  onChange={(e) => setAssignForm({ ...assignForm, material_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  required
                >
                  <option value="">-- Chọn công cụ dụng cụ lâu bền --</option>
                  {durableMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số Serial / Định Danh Nông Cụ
                  </label>
                  <input
                    type="text"
                    value={assignForm.serial_number}
                    onChange={(e) => setAssignForm({ ...assignForm, serial_number: e.target.value })}
                    placeholder="VD: FELCO-2026-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày Cấp Phát <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={assignForm.assigned_date}
                    onChange={(e) => setAssignForm({ ...assignForm, assigned_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú điều kiện sử dụng
                </label>
                <textarea
                  rows={2}
                  value={assignForm.note}
                  onChange={(e) => setAssignForm({ ...assignForm, note: e.target.value })}
                  placeholder="Giao kèm phụ kiện đá mài, dầu tra lưỡi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={assignMutation.isPending}
                  className="px-4.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs"
                >
                  {assignMutation.isPending ? 'Đang cấp phát...' : 'Lưu cấp phát'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi Trả 1:1 Nông Cụ Hỏng */}
      {replaceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-300" />
                <h3 className="font-extrabold text-sm uppercase">Cơ Chế Đổi Mới 1:1 (Thu Hồi Xác Hỏng)</h3>
              </div>
              <button onClick={() => setReplaceTarget(null)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Bạn đang thực hiện đổi mới 1:1 cho nông cụ{' '}
                <strong className="text-slate-950">{replaceTarget.material_name}</strong> (Mã:{' '}
                <span className="font-mono">{replaceTarget.serial_number}</span>) đang giao cho xã viên{' '}
                <strong>{replaceTarget.member_name}</strong>.
              </p>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" /> Quy định Đổi trả 1:1 của HTX:
                </div>
                <p>
                  Xã viên phải nộp lại xác nông cụ cũ hỏng (gãy lò xo, mẻ lưỡi sau thời gian hao mòn) về kho để thủ kho đối chứng trước khi xuất nông cụ mới từ kho.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do hỏng / Ghi chú thu hồi xác cũ:
                </label>
                <textarea
                  rows={2}
                  value={replaceNote}
                  onChange={(e) => setReplaceNote(e.target.value)}
                  placeholder="Gãy lò xo trợ lực do hao mòn tự nhiên, đã thu hồi xác cũ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplaceTarget(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate({
                      id: replaceTarget.id,
                      action: 'REPLACE_1_1',
                      note: replaceNote,
                    })
                  }
                  className="px-4.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  {statusMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Đổi 1:1'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
};
