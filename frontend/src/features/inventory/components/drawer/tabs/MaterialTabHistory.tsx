import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, History, Calendar, User, Sprout, AlertCircle } from 'lucide-react';
import { Material, StockReceipt } from '@/types/inventory';
import { inventoryApi } from '@/services/inventoryApi';
import { formatDate } from '@/utils/formatters';

interface MaterialTabHistoryProps {
  material: Material;
}

const formatNumber = (n: number) => (n || 0).toLocaleString('vi-VN');

export const MaterialTabHistory: React.FC<MaterialTabHistoryProps> = ({ material }) => {
  const { data: receipts = [], isLoading } = useQuery<StockReceipt[]>({
    queryKey: ['stockReceipts'],
    queryFn: () => inventoryApi.getStockReceipts(),
  });

  // Filter history items related to this material
  const history = receipts.filter(
    (r) =>
      r.itemId === material.id ||
      r.itemName?.toLowerCase() === material.name.toLowerCase()
  );

  const totalIn = history
    .filter((h) => h.type === 'IN')
    .reduce((sum, h) => sum + (h.qty || 0), 0);

  const totalOut = history
    .filter((h) => h.type === 'OUT')
    .reduce((sum, h) => sum + (h.qty || 0), 0);

  return (
    <div className="space-y-4">
      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            <span>Tổng lượng đã nhập</span>
          </div>
          <div className="text-base font-black font-mono text-emerald-900 mt-1">
            +{formatNumber(totalIn)} <span className="text-xs font-normal">{material.unit}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
            <span>Tổng lượng đã xuất cấp phát</span>
          </div>
          <div className="text-base font-black font-mono text-blue-900 mt-1">
            -{formatNumber(totalOut)} <span className="text-xs font-normal">{material.unit}</span>
          </div>
        </div>
      </div>

      {/* Movement List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-600" />
            Nhật ký biến động kho & Cấp phát
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {history.length} giao dịch
          </span>
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải dữ liệu lịch sử kho...
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
            <p className="font-bold text-slate-600">Chưa có lịch sử nhập / xuất</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              Các phiếu nhập mua hoặc xuất cấp phát mùa vụ sẽ tự động ghi nhận vào đây.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((item) => {
              const isIn = item.type === 'IN';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isIn ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.2 rounded text-[10.5px] font-bold ${
                              isIn
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isIn ? 'Nhập kho' : 'Xuất kho cấp phát'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-slate-700 mt-1 font-medium">{item.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-black font-mono ${
                          isIn ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        {isIn ? '+' : '-'}
                        {formatNumber(item.qty)} {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Context: Member, Season, Plot */}
                  {(item.memberName || item.seasonName || item.farmPlotName) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      {item.memberName && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Xã viên: <strong>{item.memberName}</strong></span>
                        </div>
                      )}
                      {item.seasonName && (
                        <div className="flex items-center gap-1">
                          <Sprout className="w-3 h-3 text-slate-400" />
                          <span>Vụ mùa: <strong>{item.seasonName}</strong></span>
                        </div>
                      )}
                      {item.farmPlotName && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Thửa đất: <strong>{item.farmPlotName}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
