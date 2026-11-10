import React, { useState, useMemo } from 'react';
import { Sprout, Plus } from 'lucide-react';
import { StockReceipt } from '../../../types/inventory';
import { Pagination } from '@/components/ui/Pagination';

const num = (n: number) => n.toLocaleString('vi-VN');
const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

interface MaterialAllocationsTabProps {
  history: StockReceipt[];
  onNewAllocation: () => void;
}

export const MaterialAllocationsTab: React.FC<MaterialAllocationsTabProps> = ({
  history,
  onNewAllocation,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Group allocations from OUT receipts
  const seasonAllocations = useMemo(() => {
    const outs = history.filter((r) => r.type === 'OUT' && (r.seasonName || r.memberName));
    const groups: Record<
      string,
      {
        seasonName: string;
        memberName: string;
        materialName: string;
        unit: string;
        totalQty: number;
        totalCost: number;
        latestDate: string;
      }
    > = {};

    outs.forEach((r) => {
      const key = `${r.seasonName || 'Vụ chính'}|||${r.memberName || 'Xã viên'}|||${r.itemName}`;
      if (!groups[key]) {
        groups[key] = {
          seasonName: r.seasonName || 'Vụ chính',
          memberName: r.memberName || 'Xã viên HTX',
          materialName: r.itemName,
          unit: r.unit,
          totalQty: 0,
          totalCost: 0,
          latestDate: r.date,
        };
      }
      groups[key].totalQty += r.qty;
      groups[key].totalCost += r.qty * (r.unitPrice || 0);
      if (r.date > groups[key].latestDate) {
        groups[key].latestDate = r.date;
      }
    });

    return Object.values(groups);
  }, [history]);

  const totalCost = seasonAllocations.reduce((s, a) => s + a.totalCost, 0);
  const totalPages = Math.ceil(seasonAllocations.length / pageSize) || 1;
  const pagedAllocations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return seasonAllocations.slice(start, start + pageSize);
  }, [seasonAllocations, currentPage, pageSize]);

  return (
    <div className="bg-white border border-slate-200 rounded-b-2xl shadow-xs p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-[15px] text-slate-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-700" />
            Báo cáo Cấp phát Vật tư theo Mùa vụ & Xã viên
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi định mức vật tư đầu vào (Phân bón, Thuốc BVTV sinh học) phân bổ cho từng vùng trồng & hộ xã viên.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewAllocation}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Xuất cấp phát mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Mùa vụ áp dụng chính
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">Vụ Đông Xuân 2025–2026</div>
          <div className="text-[11.5px] text-emerald-700 mt-0.5">Vùng trồng VietGAP & OCOP</div>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Tổng giá trị cấp phát
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">{money(totalCost)}</div>
          <div className="text-[11.5px] text-amber-700 mt-0.5">Tạm ứng vật tư đầu mùa vụ</div>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
            Số lượt nhận vật tư
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {seasonAllocations.length} nhóm cấp phát
          </div>
          <div className="text-[11.5px] text-blue-700 mt-0.5">Ghi nhận theo từng đợt xuất kho</div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
              <th className="py-3 px-4">Tên Mùa Vụ</th>
              <th className="py-3 px-4">Xã viên / Tổ sản xuất</th>
              <th className="py-3 px-4">Vật tư cấp phát</th>
              <th className="py-3 px-4 text-right">Tổng số lượng</th>
              <th className="py-3 px-4 text-right">Thành tiền</th>
              <th className="py-3 px-4">Ngày cấp gần nhất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {pagedAllocations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Chưa có phiếu xuất kho cấp phát nào được gắn với mùa vụ.
                </td>
              </tr>
            ) : (
              pagedAllocations.map((alloc, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className="pill-badge pill-green text-[11px]">{alloc.seasonName}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">👤 {alloc.memberName}</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">{alloc.materialName}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {num(alloc.totalQty)} {alloc.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-800">
                    {money(alloc.totalCost)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11.5px]">
                    {fmtDate(alloc.latestDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {seasonAllocations.length > pageSize && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong>–
            <strong>{Math.min(currentPage * pageSize, seasonAllocations.length)}</strong> trên tổng số{' '}
            <strong>{seasonAllocations.length}</strong> khoản cấp phát
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={seasonAllocations.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
