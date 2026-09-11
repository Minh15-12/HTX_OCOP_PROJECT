import React, { useState } from 'react';
import {
  Wallet,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  ChevronRight,
  X,
  Users,
  FileText,
  Download,
  Trash2,
  Printer,
} from 'lucide-react';
import { mockSurplusPlan, mockSurplusItems } from '@/services/memberService';
import { SurplusDistributionPlan, SurplusDistributionItem } from '@/types/memberTypes';

export const ProfitPage: React.FC = () => {
  const [surplusPlan, setSurplusPlan] = useState<SurplusDistributionPlan>(mockSurplusPlan);
  const [surplusItems, setSurplusItems] = useState<SurplusDistributionItem[]>(mockSurplusItems);

  const [search, setSearch] = useState('');
  const [profitStatusFilter, setProfitStatusFilter] = useState<string>('ALL');
  const [selectedSurplusItem, setSelectedSurplusItem] = useState<SurplusDistributionItem | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [profitPlanForm, setProfitPlanForm] = useState({
    fiscal_year: surplusPlan.fiscal_year,
    total_net_profit: surplusPlan.total_net_profit,
    reserve_fund_rate: surplusPlan.reserve_fund_rate,
    member_share_rate: surplusPlan.member_share_rate,
    welfare_fund_rate: surplusPlan.welfare_fund_rate,
    planned_payout_date: surplusPlan.planned_payout_date,
    notes: surplusPlan.notes,
  });

  const distributedProfitAmount = surplusItems
    .filter((i) => i.payout_status === 'DA_NHAN')
    .reduce((sum, i) => sum + i.total_payout_amount, 0);
  const remainingProfitAmount = surplusPlan.total_net_profit - distributedProfitAmount;
  const distributedProfitPct = Math.round((distributedProfitAmount / surplusPlan.total_net_profit) * 100);
  const paidMemberCount = surplusItems.filter((i) => i.payout_status === 'DA_NHAN').length;
  const unpaidMemberCount = surplusItems.filter((i) => i.payout_status === 'CHUA_NHAN').length;

  const handleUpdateProfitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setSurplusPlan({
      ...surplusPlan,
      fiscal_year: profitPlanForm.fiscal_year,
      total_net_profit: profitPlanForm.total_net_profit,
      reserve_fund_rate: profitPlanForm.reserve_fund_rate,
      member_share_rate: profitPlanForm.member_share_rate,
      welfare_fund_rate: profitPlanForm.welfare_fund_rate,
      planned_payout_date: profitPlanForm.planned_payout_date,
      notes: profitPlanForm.notes,
    });

    triggerToast(`Đã cập nhật phương án phân chia lợi nhuận năm ${profitPlanForm.fiscal_year}!`);
  };

  const filteredSurplusItems = surplusItems.filter((i) => {
    const matchSearch =
      i.member_name.toLowerCase().includes(search.toLowerCase()) ||
      i.member_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = profitStatusFilter === 'ALL' || i.payout_status === profitStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 bg-emerald-600 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Trang chủ</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Quản lý HTX</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Phân chia lợi nhuận</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Phân chia lợi nhuận xã viên</h1>
          <p className="text-[12.8px] text-slate-500">
            Công khai minh bạch phân chia lợi nhuận năm theo tỷ lệ vốn góp và mức độ sử dụng dịch vụ (Luật HTX 2023)
          </p>
        </div>

        <button
          onClick={() => triggerToast('Đã tạo đợt phân chia lợi nhuận mới!')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Tạo đợt phân chia
        </button>
      </div>

      {/* TOP 5 KPI STATS CARDS MATCHING IMAGE 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng lợi nhuận năm</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">{surplusPlan.total_net_profit.toLocaleString('vi-VN')} ₫</div>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12,5% so với năm trước
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Đã phân chia</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">{distributedProfitAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${distributedProfitPct}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Còn lại</span>
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-orange-700">{remainingProfitAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '16%' }}></div>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Số xã viên nhận</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">125 người</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Đã nhận: <strong className="text-emerald-700">{paidMemberCount}</strong> &bull; Chưa nhận: <strong className="text-orange-700">{unpaidMemberCount}</strong>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Kỳ phân chia</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <select className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800">
            <option value="2024">Năm 2024</option>
            <option value="2023">Năm 2023</option>
          </select>
        </div>
      </div>

      {/* CARD: THÔNG TIN KỲ PHÂN CHIA MATCHING IMAGE 1 */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm border-b border-[#e7e9ec] pb-2">
          Thông tin kỳ phân chia
        </h3>

        <form onSubmit={handleUpdateProfitPlan} className="space-y-4 text-[12.8px]">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Năm tài chính *</label>
              <select
                value={profitPlanForm.fiscal_year}
                onChange={(e) => setProfitPlanForm({ ...profitPlanForm, fiscal_year: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tổng lợi nhuận sau thuế (đ)</label>
              <input
                type="number"
                value={profitPlanForm.total_net_profit}
                onChange={(e) => setProfitPlanForm({ ...profitPlanForm, total_net_profit: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tỷ lệ trích lập quỹ (%)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={profitPlanForm.reserve_fund_rate}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, reserve_fund_rate: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                />
                <span className="text-[11.5px] text-slate-400 font-semibold">(125.000.000 đ)</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tỷ lệ chia cho xã viên (%)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={profitPlanForm.member_share_rate}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, member_share_rate: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-emerald-800"
                />
                <span className="text-[11.5px] text-slate-400 font-semibold">(1.062.500.000 đ)</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tỷ lệ quỹ khen thưởng, phúc lợi (%)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={profitPlanForm.welfare_fund_rate}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, welfare_fund_rate: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                />
                <span className="text-[11.5px] text-slate-400 font-semibold">(62.500.000 đ)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày dự kiến phân chia *</label>
              <input
                type="text"
                value={profitPlanForm.planned_payout_date}
                onChange={(e) => setProfitPlanForm({ ...profitPlanForm, planned_payout_date: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <div className="flex-1">
                <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={profitPlanForm.notes}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="mt-6 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-[12.8px] whitespace-nowrap transition-all"
              >
                Cập nhật thông tin
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* MAIN PROFIT TABLE & SIDE DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className={`${selectedSurplusItem ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden`}>
          <div className="p-3 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-[12.5px] font-bold text-slate-600">
              <span className="text-emerald-800 border-b-2 border-emerald-600 pb-1">Tất cả (125)</span>
              <span className="hover:text-slate-900 cursor-pointer">Đã nhận (102)</span>
              <span className="hover:text-slate-900 cursor-pointer">Chưa nhận (23)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên xã viên, mã xã viên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-[12px]"
                />
              </div>

              <select
                value={profitStatusFilter}
                onChange={(e) => setProfitStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-medium"
              >
                <option value="ALL">Trạng thái: Tất cả</option>
                <option value="DA_NHAN">Đã nhận</option>
                <option value="CHUA_NHAN">Chưa nhận</option>
              </select>

              <button
                onClick={() => triggerToast('Đã tạo đợt phân chia mới!')}
                className="px-3 py-1 bg-emerald-600 text-white font-bold text-[12px] rounded-lg inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo đợt phân chia
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.8px]">
              <thead>
                <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã xã viên</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3 text-right">Vốn góp (đ)</th>
                  <th className="py-2.5 px-3 text-right">Tỷ lệ chia (%)</th>
                  <th className="py-2.5 px-3 text-right">Số tiền được nhận (đ)</th>
                  <th className="py-2.5 px-3">Hình thức nhận</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSurplusItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedSurplusItem(item)}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedSurplusItem?.id === item.id ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-600">{item.member_code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{item.member_name}</td>
                    <td className="py-3 px-3 text-right text-slate-800">
                      {item.capital_contributed?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">{item.share_percentage}%</td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                      {item.total_payout_amount.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {item.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                    </td>
                    <td className="py-3 px-3">
                      {item.payout_status === 'DA_NHAN' ? (
                        <span className="pill-badge pill-green">Đã nhận</span>
                      ) : (
                        <span className="pill-badge pill-amber">Chưa nhận</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSurplusItem(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedSurplusItem && (
          <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between border-b border-[#e7e9ec] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                  {selectedSurplusItem.member_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[15px] text-slate-900">{selectedSurplusItem.member_name}</h3>
                    <span className="pill-badge pill-green text-[10.5px]">Đã nhận</span>
                  </div>
                  <p className="text-[11.8px] text-slate-500">
                    {selectedSurplusItem.member_code} &bull; Thành viên chính thức &bull; Tham gia: 10/01/2024
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedSurplusItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[12.5px] border-b border-slate-200 pb-3">
              <div className="font-bold text-slate-800 text-[12px] uppercase">Thông tin lợi nhuận</div>
              <div className="flex justify-between"><span className="text-slate-500">Vốn góp:</span> <span className="font-bold text-slate-900">{selectedSurplusItem.capital_contributed?.toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tỷ lệ chia:</span> <span className="font-bold text-slate-900">{selectedSurplusItem.share_percentage}%</span></div>
              <div className="flex justify-between text-emerald-800 font-extrabold text-sm"><span>Số tiền được nhận:</span> <span>{selectedSurplusItem.total_payout_amount.toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Hình thức nhận:</span> <span className="font-medium text-slate-800">{selectedSurplusItem.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Ngày nhận:</span> <span className="font-medium text-slate-800">15/03/2025</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Mã giao dịch:</span> <span className="font-mono font-bold text-emerald-700">LN2025-001</span></div>
            </div>

            <div className="space-y-2 text-[12.5px] border-b border-slate-200 pb-3">
              <div className="font-bold text-slate-800 text-[12px] uppercase">Thông tin tài khoản nhận</div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-emerald-800 text-[12px]">Ngân hàng TMCP Ngoại thương Việt Nam (VCB)</div>
                <div className="text-[12px] text-slate-700 font-mono font-bold">STK: 1234567890</div>
                <div className="text-[11.5px] text-slate-500">Chủ tài khoản: <strong>Nguyễn Văn A</strong></div>
              </div>
            </div>

            <div className="space-y-2 text-[12.5px] border-b border-slate-200 pb-3">
              <div className="font-bold text-slate-800 text-[12px] uppercase">Chứng từ liên quan</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-bold text-[12px] text-slate-800">Quyết định phân chia lợi nhuận.pdf</div>
                      <div className="text-[10.5px] text-slate-400">1.2 MB</div>
                    </div>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-emerald-700"><Download className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2 border-t border-slate-200">
              <button className="px-3 py-1.5 border border-rose-300 text-rose-700 font-bold hover:bg-rose-50 text-[12px] rounded-lg inline-flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Hủy giao dịch
              </button>
              <button className="px-3 py-1.5 border border-blue-300 text-blue-700 font-bold hover:bg-blue-50 text-[12px] rounded-lg inline-flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" /> In biên lai
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CHARTS GRID MATCHING IMAGE 1 BOTTOM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Cơ cấu phân chia lợi nhuận</h3>
          <div className="flex items-center justify-between">
            <div className="w-36 h-36 rounded-full border-[16px] border-emerald-600 border-l-blue-500 border-b-orange-400 flex flex-col items-center justify-center text-center">
              <span className="text-[12px] font-extrabold text-slate-900">1.250.000.000 ₫</span>
              <span className="text-[9.5px] text-slate-400 uppercase font-bold">Tổng lợi nhuận</span>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Chia cho xã viên (85%)</span><strong className="text-slate-900">1.062.500.000 ₫</strong></div>
              <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Quỹ trích lập (10%)</span><strong className="text-slate-900">125.000.000 ₫</strong></div>
              <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-orange-400"></span> Quỹ khen thưởng, phúc lợi (5%)</span><strong className="text-slate-900">62.500.000 ₫</strong></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm">Tình hình nhận lợi nhuận</h3>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Đã nhận</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Chưa nhận</span>
            </div>
          </div>
          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-200">
            {['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'].map((m, i) => (
              <div key={m} className="flex-1 flex items-end justify-center gap-1">
                <div className="w-3 bg-emerald-600 rounded-t-xs" style={{ height: `${60 + i * 5}%` }}></div>
                <div className="w-3 bg-orange-500 rounded-t-xs" style={{ height: `${20 + i * 3}%` }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
