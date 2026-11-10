import React, { useEffect } from 'react';
import { Search, RefreshCw, Eye, X, Printer } from 'lucide-react';
import { SurplusDistributionItem } from '@/types/memberTypes';
import { Pagination } from '@/components/ui/Pagination';

interface ProfitAllocationTableProps {
  surplusItems: SurplusDistributionItem[];
  filteredSurplusItems: SurplusDistributionItem[];
  selectedSurplusItem: SurplusDistributionItem | null;
  setSelectedSurplusItem: (item: SurplusDistributionItem | null) => void;
  search: string;
  setSearch: (s: string) => void;
  profitStatusFilter: string;
  setProfitStatusFilter: (status: string) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onToggleReinvest: (itemId: string) => void;
  onOpenPrintModal: () => void;
}

export const ProfitAllocationTable: React.FC<ProfitAllocationTableProps> = ({
  surplusItems,
  filteredSurplusItems,
  selectedSurplusItem,
  setSelectedSurplusItem,
  search,
  setSearch,
  profitStatusFilter,
  setProfitStatusFilter,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  onToggleReinvest,
  onOpenPrintModal,
}) => {
  const paidMemberCount = surplusItems.filter((i) => i.payout_status === 'DA_NHAN').length;
  const unpaidMemberCount = surplusItems.filter((i) => i.payout_status === 'CHUA_NHAN').length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSurplusItem) {
        setSelectedSurplusItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSurplusItem, setSelectedSurplusItem]);

  return (
    <div className="w-full">
      <div className="w-full bg-white border border-[#e7e9ec] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="text-emerald-800 border-b-2 border-emerald-600 pb-1">
              Tất cả ({surplusItems.length})
            </span>
            <span
              onClick={() => setProfitStatusFilter('DA_NHAN')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Đã nhận ({paidMemberCount})
            </span>
            <span
              onClick={() => setProfitStatusFilter('CHUA_NHAN')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Chưa nhận ({unpaidMemberCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên xã viên..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>

            <select
              value={profitStatusFilter}
              onChange={(e) => {
                setProfitStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="DA_NHAN">Đã nhận</option>
              <option value="CHUA_NHAN">Chưa nhận</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10.5px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/80">
                <th className="py-3 px-3.5">STT</th>
                <th className="py-3 px-3.5">Mã & Họ tên</th>
                <th className="py-3 px-3.5 text-right">Chia theo Dịch vụ (≥51%)</th>
                <th className="py-3 px-3.5 text-right">Chia theo Vốn góp</th>
                <th className="py-3 px-3.5 text-right">Cấn trừ công nợ (đ)</th>
                <th className="py-3 px-3.5 text-right">Thực lĩnh chuyển khoản (đ)</th>
                <th className="py-3 px-3.5 text-center">Tái đầu tư vốn</th>
                <th className="py-3 px-3.5">Trạng thái</th>
                <th className="py-3 px-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurplusItems
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((item, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const serviceShare =
                    item.service_share_amount || Math.round(item.total_payout_amount * 0.7);
                  const capitalShare =
                    item.capital_share_amount || item.total_payout_amount - serviceShare;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedSurplusItem(item)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedSurplusItem?.id === item.id ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 text-slate-400 font-medium">{itemIndex}</td>
                      <td className="py-3 px-3.5">
                        <strong className="text-slate-900 block">{item.member_name}</strong>
                        <span className="text-[10.5px] font-mono text-slate-400">
                          {item.member_code}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-blue-700">
                        +{serviceShare.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-700">
                        +{capitalShare.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-amber-800">
                        {(item.debt_deduction || 0) > 0
                          ? `-${(item.debt_deduction || 0).toLocaleString('vi-VN')} ₫`
                          : '0 ₫'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-black text-emerald-800">
                        {(item.net_payout_amount || item.total_payout_amount || 0).toLocaleString(
                          'vi-VN'
                        )}{' '}
                        ₫
                      </td>
                      <td
                        className="py-3 px-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onToggleReinvest(item.id)}
                          className={`p-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 mx-auto cursor-pointer transition ${
                            item.reinvest_as_capital
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Tự động chuyển thặng dư thành vốn góp bổ sung"
                        >
                          <RefreshCw className="w-3 h-3" />{' '}
                          {item.reinvest_as_capital ? 'Tái đầu tư' : 'Rút tiền'}
                        </button>
                      </td>
                      <td className="py-3 px-3.5">
                        {item.payout_status === 'DA_NHAN' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800">
                            Đã nhận
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800">
                            Chưa nhận
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSurplusItem(item);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {filteredSurplusItems.length > 0 && (
          <div className="p-3 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSurplusItems.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Surplus Allocation Detail */}
      {selectedSurplusItem && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setSelectedSurplusItem(null)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Chi Tiết Thặng Dư Xã Viên</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {selectedSurplusItem.payout_status === 'DA_NHAN' ? 'Đã chi trả' : 'Chưa nhận'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSurplusItem(null)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Đóng chi tiết"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1 flex flex-col">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                  {selectedSurplusItem.member_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {selectedSurplusItem.member_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedSurplusItem.member_code} &bull; Xã viên chính thức
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  Chi tiết Phân bổ Thặng dư
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sản lượng cung ứng nội bộ:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {(selectedSurplusItem.service_usage_output_kg || 0).toLocaleString('vi-VN')} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thưởng theo Dịch vụ (≥51%):</span>{' '}
                  <span className="font-bold text-blue-700">
                    +{(
                      selectedSurplusItem.service_share_amount ||
                      Math.round(selectedSurplusItem.total_payout_amount * 0.7)
                    ).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thưởng theo Tỷ lệ vốn:</span>{' '}
                  <span className="font-bold text-slate-900">
                    +{(
                      selectedSurplusItem.capital_share_amount ||
                      (selectedSurplusItem.total_payout_amount -
                        (selectedSurplusItem.service_share_amount ||
                          Math.round(selectedSurplusItem.total_payout_amount * 0.7)))
                    ).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>Khấu trừ nợ vật tư tồn đọng:</span>{' '}
                  <span className="font-bold">
                    {(selectedSurplusItem.debt_deduction || 0) > 0
                      ? `-${(selectedSurplusItem.debt_deduction || 0).toLocaleString('vi-VN')} ₫`
                      : '0 ₫'}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-900 font-extrabold text-sm border-t pt-2 mt-1">
                  <span>Thực lĩnh chuyển khoản:</span>{' '}
                  <span>
                    {(
                      selectedSurplusItem.net_payout_amount ||
                      selectedSurplusItem.total_payout_amount ||
                      0
                    ).toLocaleString('vi-VN')}{' '}
                    ₫
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  Thông tin ngân hàng thụ hưởng
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-800 text-xs">
                    {selectedSurplusItem.bank_name || 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)'}
                  </div>
                  <div className="text-xs text-slate-700 font-mono font-bold">
                    STK: {selectedSurplusItem.bank_account || '1234567890'}
                  </div>
                  <div className="text-[11.5px] text-slate-500">
                    Chủ tài khoản:{' '}
                    <strong>
                      {selectedSurplusItem.account_holder || selectedSurplusItem.member_name}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100">
                <button
                  onClick={onOpenPrintModal}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
                >
                  <Printer className="w-4 h-4" /> In biên lai chi trả thặng dư
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
