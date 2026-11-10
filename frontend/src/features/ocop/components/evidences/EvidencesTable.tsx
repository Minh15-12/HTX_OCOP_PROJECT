import React from 'react';
import { Search, FileText, Eye, Download, Inbox } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { EvidenceRecord } from './evidenceTypes';

interface EvidencesTableProps {
  evidences: EvidenceRecord[];
  allEvidences: EvidenceRecord[];
  activeRecord: EvidenceRecord | null;
  onSelectRecord: (item: EvidenceRecord) => void;
  search: string;
  setSearch: (s: string) => void;
  activeTabCategory: string;
  setActiveTabCategory: (cat: string) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onDownload: (item: EvidenceRecord) => void;
  onPreview: (item: EvidenceRecord) => void;
}

export const EvidencesTable: React.FC<EvidencesTableProps> = ({
  evidences,
  allEvidences,
  activeRecord,
  onSelectRecord,
  search,
  setSearch,
  activeTabCategory,
  setActiveTabCategory,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  onDownload,
  onPreview,
}) => {
  const paginatedEvidences = evidences.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const categoryPills = [
    { id: 'ALL', label: `Tất cả (${allEvidences.length})` },
    {
      id: 'Pháp lý',
      label: `Pháp lý (${allEvidences.filter((e) => e.category.includes('Pháp lý')).length})`,
    },
    {
      id: 'Chất lượng',
      label: `Chất lượng & ATTP (${
        allEvidences.filter((e) => e.category.includes('Chất lượng')).length
      })`,
    },
    {
      id: 'Chứng nhận',
      label: `Chứng nhận (${
        allEvidences.filter((e) => e.category.includes('Chứng nhận')).length
      })`,
    },
    {
      id: 'Bao bì',
      label: `Bao bì & QR (${
        allEvidences.filter((e) => e.category.includes('Bao bì')).length
      })`,
    },
    {
      id: 'Thị trường',
      label: `Tiêu thụ (${
        allEvidences.filter((e) => e.category.includes('Thị trường')).length
      })`,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm tên tệp, mã hồ sơ, tiêu chí..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              setSearch('');
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Đặt lại
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
          {categoryPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setActiveTabCategory(pill.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTabCategory === pill.id
                  ? 'bg-emerald-800 text-white font-extrabold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {evidences.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl text-slate-400 gap-2">
          <Inbox className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold">Chưa có tệp minh chứng nào phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Tên minh chứng</th>
                <th className="py-2.5 px-3">Nhóm tiêu chí</th>
                <th className="py-2.5 px-3">Liên kết hồ sơ</th>
                <th className="py-2.5 px-3">Kích thước</th>
                <th className="py-2.5 px-3">Mã băm (SHA-256)</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedEvidences.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectRecord(item)}
                  className={`cursor-pointer transition-colors ${
                    activeRecord?.id === item.id
                      ? 'bg-emerald-50/70 font-bold'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400">{item.stt}</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="break-words">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">
                    {item.dossierCode}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{item.size}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 truncate max-w-[100px]">
                    {item.checksum.substring(0, 12)}...
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`pill-badge text-[10px] ${
                        item.status === 'VALID'
                          ? 'pill-green'
                          : item.status === 'PENDING'
                          ? 'pill-amber'
                          : 'pill-red'
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                  </td>
                  <td
                    className="py-2.5 px-3 text-right space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onPreview(item)}
                      className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                      title="Xem file"
                    >
                      <Eye className="w-3.5 h-3.5 inline" />
                    </button>
                    <button
                      onClick={() => onDownload(item)}
                      className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                      title="Tải xuống"
                    >
                      <Download className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Component */}
      {evidences.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={evidences.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
          className="border-t border-slate-100 px-0 pt-3"
        />
      )}
    </div>
  );
};
