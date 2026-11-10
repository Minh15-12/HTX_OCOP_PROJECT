import React, { useState, useMemo } from 'react';
import { Search, Download, Plus, Sprout, Edit, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { CropItem } from '@/types/agriculture';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/ToastNotification';

interface CropsTabProps {
  crops: CropItem[];
  isLoading: boolean;
  onEditCrop: (crop: CropItem) => void;
  onDeleteCrop: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const CropsTab: React.FC<CropsTabProps> = ({
  crops,
  isLoading,
  onEditCrop,
  onDeleteCrop,
  onOpenCreateModal,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return crops.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.crop_code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.scientific_name && c.scientific_name.toLowerCase().includes(q));

      const matchCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [crops, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedCrops = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const exportCSV = () => {
    if (filtered.length === 0) {
      showToast('Không có dữ liệu giống cây trồng để xuất!', 'warning');
      return;
    }
    const headers = [
      'Mã giống',
      'Tên giống cây trồng',
      'Tên khoa học',
      'Nhóm ngành hàng',
      'Thời gian sinh trưởng (ngày)',
      'Năng suất chuẩn (tấn/ha)',
      'Thời gian cách ly PHI (ngày)',
      'Xuất xứ hạt giống',
      'Trạng thái',
    ];
    const rows = filtered.map((c) => [
      c.crop_code,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.scientific_name || '').replace(/"/g, '""')}"`,
      `"${c.category.replace(/"/g, '""')}"`,
      c.growth_duration_days || 120,
      c.standard_yield_ton_ha || 75,
      c.default_phi_days || 7,
      `"${(c.origin || '').replace(/"/g, '""')}"`,
      c.status === 'ACTIVE' ? 'Đang canh tác' : 'Ngưng',
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_sach_giong_cay_trong_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Xuất danh mục giống cây trồng CSV thành công!');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-0 text-xs">
      {/* Controls Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo mã giống, tên giống, tên khoa học..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả nhóm ngành hàng</option>
            <option value="Rau củ quả OCOP">Rau củ quả OCOP</option>
            <option value="Cây ăn trái đặc sản">Cây ăn trái đặc sản</option>
            <option value="Dược liệu & Nấm">Dược liệu & Nấm</option>
            <option value="Hoa & Cây cảnh">Hoa & Cây cảnh</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất CSV
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm giống cây
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Mã giống</th>
              <th className="py-3 px-4">Tên giống cây trồng</th>
              <th className="py-3 px-4">Ngành hàng & Xuất xứ</th>
              <th className="py-3 px-4 text-center">Sinh trưởng</th>
              <th className="py-3 px-4 text-right">Năng suất chuẩn</th>
              <th className="py-3 px-4 text-center">Cách ly PHI</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Đang tải danh mục giống cây trồng...
                </td>
              </tr>
            ) : pagedCrops.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Sprout className="w-8 h-8 text-slate-300" />
                    <p className="font-bold text-slate-600">Chưa có danh mục giống cây trồng</p>
                    <p className="text-[11.5px] text-slate-400">
                      Bấm "Thêm giống cây" để khởi tạo danh mục cây trồng phục vụ lập kế hoạch mùa vụ.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedCrops.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">{c.crop_code}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    {c.scientific_name && (
                      <div className="text-[11px] font-serif italic text-slate-500">
                        {c.scientific_name}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="pill-badge pill-blue text-[11px]">{c.category}</span>
                    {c.origin && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{c.origin}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    {c.growth_duration_days || 120} ngày
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    {c.standard_yield_ton_ha || 75} tấn/ha
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {c.default_phi_days || 7} ngày
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {c.status === 'ACTIVE' ? 'Đang canh tác' : 'Ngưng'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditCrop(c)}
                        title="Chỉnh sửa"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa giống cây [${c.name}]?`)) {
                            onDeleteCrop(c.id);
                          }
                        }}
                        title="Xóa"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filtered.length > pageSize && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong>–
            <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> trên tổng số{' '}
            <strong>{filtered.length}</strong> giống cây
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
