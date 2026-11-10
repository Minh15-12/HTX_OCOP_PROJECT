import React, { useState } from 'react';
import { Plus, Link as LinkIcon, Download } from 'lucide-react';
import { EvidenceItem } from '@/services/ocopService';

interface DossierEvidencesTabProps {
  evidences: EvidenceItem[];
  onOpenAddModal: () => void;
  onScrollToCriterion: (code: string) => void;
}

export const DossierEvidencesTab: React.FC<DossierEvidencesTabProps> = ({
  evidences,
  onOpenAddModal,
  onScrollToCriterion,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filtered = evidences.filter((ev) => {
    if (categoryFilter === 'ALL') return true;
    return ev.category === categoryFilter;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b pb-3 border-slate-200">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">Kho Minh chứng Số hóa & Toàn vẹn SHA-256</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi tệp tài liệu được lưu trữ kèm mã băm SHA-256 để chống giả mạo hồ sơ theo Luật Giao dịch điện tử.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Thêm minh chứng
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            categoryFilter === 'ALL'
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tất cả
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter('LEGAL')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            categoryFilter === 'LEGAL'
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Hồ sơ pháp lý
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter('QUALITY')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            categoryFilter === 'QUALITY'
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Chất lượng & ATTP
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter('PROCESS')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            categoryFilter === 'PROCESS'
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Quy trình canh tác
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-3 w-10 text-center">STT</th>
              <th className="py-3 px-3">Tên minh chứng</th>
              <th className="py-3 px-3">Loại</th>
              <th className="py-3 px-3 text-center">Chỉ tiêu OCOP</th>
              <th className="py-3 px-3 font-mono text-[10px]">Mã băm SHA-256</th>
              <th className="py-3 px-3 text-center">Ngày tải lên</th>
              <th className="py-3 px-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Chưa có tài liệu minh chứng nào trong nhóm này.
                </td>
              </tr>
            ) : (
              filtered.map((ev, idx) => (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{ev.title}</div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {ev.fileName} ({ev.fileSize})
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="pill-badge pill-blue">{ev.categoryLabel}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onScrollToCriterion(ev.criterionCode)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-mono font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Bấm để cuộn mượt xem vị trí tiêu chí này"
                    >
                      <LinkIcon className="w-3 h-3 text-amber-600" /> {ev.criterionCode}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-slate-500" title={ev.fileHashSha256}>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {ev.fileHashSha256 ? `${ev.fileHashSha256.slice(0, 16)}...` : 'e3b0c44298fc1c14...'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500">{ev.uploadedAt}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => alert(`Đang tải xuống file ${ev.fileName}`)}
                      className="p-1.5 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors cursor-pointer"
                      title="Tải xuống tệp"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
