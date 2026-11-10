import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Star, Eye, Edit, Inbox } from 'lucide-react';
import { OcopDossierItem } from '../../../services/ocopService';
import { Pagination } from '@/components/ui/Pagination';

interface DossiersTableProps {
  dossiers: OcopDossierItem[];
  selectedDossier: OcopDossierItem | null;
  onSelectDossier: (dossier: OcopDossierItem) => void;
  activeTabFilter: 'ALL' | 'PROCESSING' | 'COMPLETED' | 'CERTIFIED';
  setActiveTabFilter: (tab: 'ALL' | 'PROCESSING' | 'COMPLETED' | 'CERTIFIED') => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  onResetFilters: () => void;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const DossiersTable: React.FC<DossiersTableProps> = ({
  dossiers,
  selectedDossier,
  onSelectDossier,
  activeTabFilter,
  setActiveTabFilter,
  categoryFilter,
  setCategoryFilter,
  onResetFilters,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
}) => {
  const navigate = useNavigate();

  const paginatedDossiers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return dossiers.slice(start, start + pageSize);
  }, [dossiers, currentPage, pageSize]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Filter Tabs Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'ALL', label: 'Tất cả hồ sơ' },
            { id: 'PROCESSING', label: 'Đang xử lý' },
            { id: 'COMPLETED', label: 'Đã hoàn thành' },
            { id: 'CERTIFIED', label: 'Đã công nhận' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTabFilter === tab.id
                  ? 'bg-emerald-800 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="ALL">Tất cả ngành hàng</option>
            <option value="Thực phẩm">Thực phẩm</option>
            <option value="Đồ uống">Đồ uống</option>
            <option value="Thảo dược">Thảo dược</option>
          </select>

          <button
            onClick={onResetFilters}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
        </div>
      </div>

      {/* Table Content */}
      {paginatedDossiers.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-3">
          <Inbox className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="text-sm font-semibold">Không tìm thấy hồ sơ OCOP nào phù hợp bộ lọc.</p>
          <button
            onClick={onResetFilters}
            className="px-4 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Mã hồ sơ</th>
                <th className="py-2.5 px-3">Tên sản phẩm</th>
                <th className="py-2.5 px-3">Chủ thể</th>
                <th className="py-2.5 px-3">Nhóm ngành</th>
                <th className="py-2.5 px-3">Tiến độ</th>
                <th className="py-2.5 px-3">Hạng sao</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedDossiers.map((d, index) => (
                <tr
                  key={d.id}
                  onClick={() => onSelectDossier(d)}
                  className={`cursor-pointer transition-colors ${
                    selectedDossier?.id === d.id ? 'bg-emerald-50/70 font-bold' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 font-bold">{d.code}</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">{d.productName}</td>
                  <td className="py-2.5 px-3 text-slate-600 break-words">{d.subjectName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 text-emerald-800 font-bold text-[10.5px]">
                      {d.productCategory.split(' ')[0]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="w-24 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>{d.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.progressPercent >= 80 ? 'bg-emerald-600' : d.progressPercent >= 50 ? 'bg-sky-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${d.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                      <span>{d.targetStar} sao</span>
                      <div className="flex">
                        {Array.from({ length: d.targetStar }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`pill-badge text-[10px] ${
                      d.status === 'CERTIFIED' ? 'pill-green' : d.status === 'IN_EVALUATION' ? 'pill-blue' : 'pill-amber'
                    }`}>
                      {d.statusLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/ocop/dossiers/${d.id}`)}
                      className="p-1 text-slate-400 hover:text-emerald-700 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => navigate(`/ocop/dossiers/new`)}
                      className="p-1 text-slate-400 hover:text-sky-700 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dossiers.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <Pagination
            currentPage={currentPage}
            totalItems={dossiers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}
    </div>
  );
};
