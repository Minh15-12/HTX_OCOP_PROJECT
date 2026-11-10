import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  FileSpreadsheet,
  Eye,
  Pencil,
  Printer,
  Trash2,
  Wheat,
  ShieldCheck,
  ShieldAlert,
  Banknote,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/utils/formatters';
import { Pagination } from '@/components/ui/Pagination';
import type { HarvestItem } from '@/types/agriculture';

interface HarvestsTableProps {
  harvests: HarvestItem[];
  activeHarvestId: string | null;
  onSelectHarvest: (id: string) => void;
  isLoading: boolean;
  onExportExcel: () => void;
  onViewDetail: (harvest: HarvestItem) => void;
  onEdit: (harvest: HarvestItem) => void;
  onPrintLabel: (harvest: HarvestItem) => void;
  onDelete: (harvest: HarvestItem) => void;
  onOpenAddModal: () => void;
}

export const HarvestsTable: React.FC<HarvestsTableProps> = ({
  harvests,
  activeHarvestId,
  onSelectHarvest,
  isLoading,
  onExportExcel,
  onViewDetail,
  onEdit,
  onPrintLabel,
  onDelete,
  onOpenAddModal,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return harvests.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.harvest_code.toLowerCase().includes(q) ||
        (item.lot_code && item.lot_code.toLowerCase().includes(q)) ||
        item.plot_code.toLowerCase().includes(q) ||
        item.plot_name.toLowerCase().includes(q);

      const matchGrade =
        selectedGrade === 'ALL' || item.quality_grade === selectedGrade;

      return matchSearch && matchGrade;
    });
  }, [harvests, search, selectedGrade]);

  const pagedHarvests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div className="space-y-3.5">
      {/* Search & Filter Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm mã lệnh (TH-), mã lô GS1, thửa đất, vùng trồng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả phẩm cấp KCS</option>
              <option value="GRADE_A">GRADE A (Thượng hạng)</option>
              <option value="GRADE_B">GRADE B (Tiêu chuẩn)</option>
              <option value="REJECT">REJECT (Không đạt)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
            title="Xuất danh sách thu hoạch sang Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 bg-slate-50/70">
          <div>
            <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Danh sách lệnh thu hoạch</h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {filtered.length} lượt thu hoạch • Nhấn vào dòng để xem chi tiết KCS & truy xuất GS1
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Chuẩn mã lô GS1 Traceability
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Đang tải dữ liệu thu hoạch...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium flex flex-col items-center justify-center gap-2">
              <Wheat className="w-8 h-8 text-slate-300" />
              {search || selectedGrade !== 'ALL' ? (
                <>
                  <p className="font-bold text-slate-700">Không tìm thấy lệnh thu hoạch nào phù hợp</p>
                  <p className="text-[11.5px] text-slate-400 max-w-sm">
                    Không có lượt thu hoạch nào khớp với từ khóa "{search}" hoặc phẩm cấp đã chọn.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setSelectedGrade('ALL');
                      setCurrentPage(1);
                    }}
                    className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Đặt lại bộ lọc tìm kiếm
                  </button>
                </>
              ) : (
                <>
                  <p className="font-bold text-slate-600">Chưa có dữ liệu thu hoạch nào</p>
                  <p className="text-[11.5px] text-slate-400">
                    Bấm "Ghi nhận thu hoạch mới" để thêm lượt thu hoạch đầu tiên.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="mt-2 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    + Ghi nhận thu hoạch mới
                  </button>
                </>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold bg-slate-50">
                  <th className="py-3 px-4 min-w-[130px]">Lệnh & Ngày</th>
                  <th className="py-3 px-4 min-w-[160px]">Mã Lô GS1</th>
                  <th className="py-3 px-4 min-w-[160px]">Thửa Đất</th>
                  <th className="py-3 px-4 min-w-[120px]">Sản Lượng</th>
                  <th className="py-3 px-4 min-w-[160px]">Kiểm Định KCS & PHI</th>
                  <th className="py-3 px-4 min-w-[120px]">Phẩm Cấp</th>
                  <th className="py-3 px-4 text-center min-w-[110px]">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedHarvests.map((item: HarvestItem) => {
                  const isSelected = activeHarvestId === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectHarvest(item.id)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 ring-1 ring-emerald-500/40 font-medium'
                          : 'hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      {/* Harvest Code & Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                          <span className="font-bold text-emerald-800">{item.harvest_code}</span>
                          {item.stage_number && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-200">
                              Đợt {item.stage_number}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {formatDate(item.harvest_date)}
                        </div>
                        {item.weighing_slip_code && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Cân: {item.weighing_slip_code}
                          </div>
                        )}
                      </td>

                      {/* GS1 Lot Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-300 inline-block whitespace-nowrap">
                          {item.lot_code}
                        </span>
                      </td>

                      {/* Plot */}
                      <td className="py-3 px-4">
                        <div className="text-xs font-bold text-slate-800 whitespace-nowrap">{item.plot_code}</div>
                        <div className="text-[11px] text-slate-500 break-words">{item.plot_name}</div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-black text-slate-900 text-xs">
                          {formatNumber(item.quantity_kg ?? (item as any).quantity ?? 0)} kg
                        </span>
                        <div className="text-[10.5px] text-slate-500">
                          A: <strong className="text-emerald-700">{formatNumber(item.grade_a_kg || 0)} kg</strong>
                        </div>
                        {item.rejection_weight_kg ? (
                          <div className="text-[10px] text-rose-600 font-bold">
                            Loại: {formatNumber(item.rejection_weight_kg)} kg
                          </div>
                        ) : null}

                        {/* Cảnh báo vàng Vượt trần sản lượng theo Phương án B */}
                        {item.is_over_quota && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              ⚠️ VƯỢT TRẦN (+{formatNumber(item.quota_excess_kg || 0)} kg)
                            </span>
                            <div className="text-[9.5px] text-amber-800 font-bold mt-0.5">
                              {item.quota_audit_status === 'NEEDS_RECONCILIATION'
                                ? 'Tạm giữ • Chờ BKS đối soát'
                                : item.quota_audit_status === 'APPROVED'
                                ? 'Đã duyệt đối soát'
                                : 'Bị từ chối'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Kiểm định KCS & PHI */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {item.is_phi_cleared ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-fit">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Pass Gate PHI</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 w-fit">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              <span>Chưa đạt PHI</span>
                            </span>
                          )}
                          <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-medium">
                            <span>
                              Lab:{' '}
                              <strong
                                className={
                                  item.kcs_quick_lab?.test_result === 'LAB_PASSED'
                                    ? 'text-emerald-700'
                                    : 'text-slate-600'
                                }
                              >
                                {item.kcs_quick_lab?.test_result === 'LAB_PASSED' ? 'Âm tính' : 'N/A'}
                              </strong>
                            </span>
                            {item.brix_level != null && (
                              <span>
                                &bull; Brix: <strong className="text-slate-700">{item.brix_level}°</strong>
                              </span>
                            )}
                          </div>
                          {(item.days_since_last_spray != null || item.last_active_ingredient) && (
                            <div className="text-[10px] text-emerald-900 font-medium bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-200/60 w-fit">
                              Cách ly: <strong>{item.days_since_last_spray ?? '—'} ngày</strong> &bull; {item.last_active_ingredient || 'Không dùng thuốc'}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quality Grade */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border ${
                            item.quality_grade === 'GRADE_A'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.quality_grade === 'GRADE_B'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {item.quality_grade === 'GRADE_A'
                            ? 'GRADE A'
                            : item.quality_grade === 'GRADE_B'
                            ? 'GRADE B'
                            : 'REJECT'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onViewDetail(item)}
                            title="Xem chi tiết (Slide-over)"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            title="Sửa KCS"
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPrintLabel(item)}
                            title="In tem QR"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/finance?tab=harvest-settlements')}
                            title="Quyết toán tiền nông sản & Cấn trừ nợ (Điều 74 Luật HTX)"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            title="Hủy lệnh thu hoạch"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > pageSize && (
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 flex items-center justify-between">
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
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
      </section>
    </div>
  );
};
