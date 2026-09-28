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
  ShieldCheck,
  Percent,
  RefreshCw,
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
    internal_service_surplus: surplusPlan.internal_service_surplus || 850000000,
    external_service_surplus: surplusPlan.external_service_surplus || 400000000,
    unallocated_common_fund_rate: surplusPlan.unallocated_common_fund_rate || 5,
    reserve_fund_rate: surplusPlan.reserve_fund_rate || 10,
    patronage_rebate_rate: surplusPlan.patronage_rebate_rate || 55,
    welfare_fund_rate: surplusPlan.welfare_fund_rate || 5,
    planned_payout_date: surplusPlan.planned_payout_date,
    notes: surplusPlan.notes,
  });

  const totalNetProfit = profitPlanForm.internal_service_surplus + profitPlanForm.external_service_surplus * 0.8;
  const unallocatedCommonFundAmount = (profitPlanForm.external_service_surplus * profitPlanForm.unallocated_common_fund_rate) / 100;
  const reserveFundAmount = (totalNetProfit * profitPlanForm.reserve_fund_rate) / 100;
  const welfareFundAmount = (totalNetProfit * profitPlanForm.welfare_fund_rate) / 100;
  const memberDistributableAmount = totalNetProfit - unallocatedCommonFundAmount - reserveFundAmount - welfareFundAmount;

  const distributedProfitAmount = surplusItems
    .filter((i) => i.payout_status === 'DA_NHAN')
    .reduce((sum, i) => sum + (i.net_payout_amount ?? i.total_payout_amount ?? 0), 0);
  const remainingProfitAmount = totalNetProfit - distributedProfitAmount;
  const distributedProfitPct = Math.round((distributedProfitAmount / (totalNetProfit || 1)) * 100);
  const paidMemberCount = surplusItems.filter((i) => i.payout_status === 'DA_NHAN').length;
  const unpaidMemberCount = surplusItems.filter((i) => i.payout_status === 'CHUA_NHAN').length;

  const handleUpdateProfitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (profitPlanForm.unallocated_common_fund_rate < 5) {
      triggerToast('VI PHẠM NGHỊ ĐỊNH 113/2024: Quỹ chung không chia tối thiểu phải đạt 5% từ thu nhập bên ngoài!', 'danger');
      return;
    }
    if (profitPlanForm.patronage_rebate_rate < 51) {
      triggerToast('VI PHẠM ĐIỀU 86 LUẬT HTX 2023: Tỷ lệ chia theo sử dụng dịch vụ nội bộ tối thiểu phải đạt 51%!', 'danger');
      return;
    }

    setSurplusPlan({
      ...surplusPlan,
      fiscal_year: profitPlanForm.fiscal_year,
      internal_service_surplus: profitPlanForm.internal_service_surplus,
      external_service_surplus: profitPlanForm.external_service_surplus,
      total_net_profit: totalNetProfit,
      unallocated_common_fund_rate: profitPlanForm.unallocated_common_fund_rate,
      unallocated_common_fund_amount: unallocatedCommonFundAmount,
      reserve_fund_rate: profitPlanForm.reserve_fund_rate,
      reserve_fund_amount: reserveFundAmount,
      patronage_rebate_rate: profitPlanForm.patronage_rebate_rate,
      member_share_amount: memberDistributableAmount,
      welfare_fund_rate: profitPlanForm.welfare_fund_rate,
      welfare_fund_amount: welfareFundAmount,
      planned_payout_date: profitPlanForm.planned_payout_date,
      notes: profitPlanForm.notes,
    });

    triggerToast(`Đã cập nhật phương án phân chia thặng dư năm ${profitPlanForm.fiscal_year} theo Luật HTX 2023!`);
  };

  const handleToggleReinvest = (itemId: string) => {
    setSurplusItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              reinvest_as_capital: !item.reinvest_as_capital,
            }
          : item
      )
    );
    const it = surplusItems.find((i) => i.id === itemId);
    if (it) {
      triggerToast(
        !it.reinvest_as_capital
          ? `Đã đăng ký tái đầu tư thặng dư thành vốn góp bổ sung cho xã viên ${it.member_name}!`
          : `Đã hủy tái đầu tư, nhận thặng dư bằng tiền mặt/chuyển khoản cho ${it.member_name}.`
      );
    }
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
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${toast.type === 'danger' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Quản trị HTX</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Phân chia thặng dư & Lợi nhuận (Luật HTX 2023)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Phân chia Thặng dư Xã viên theo Giao dịch Nội bộ</h1>
          <p className="text-[12.8px] text-slate-500">
            Bóc tách thu nhập nội bộ (TK 512 - Miễn thuế TNDN), trích Quỹ chung không chia (NĐ 113/2024) và chia thưởng Patronage Rebate ($\ge 51\%$)
          </p>
        </div>

        <button
          onClick={() => triggerToast('Đã tính toán phân bổ thặng dư niên độ mới thành công!')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Tạo đợt phân chia
        </button>
      </div>

      {/* TOP 5 KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng lợi nhuận khả dụng</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">{totalNetProfit.toLocaleString('vi-VN')} ₫</div>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Gồm 850M đ thu nhập nội bộ (Miễn thuế)
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Quỹ chung không chia</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-purple-900">{unallocatedCommonFundAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="text-[11px] text-slate-500 font-semibold">Tối thiểu 5% thu nhập bên ngoài</div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Chia thưởng dịch vụ (&ge;51%)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-blue-900">{((memberDistributableAmount * profitPlanForm.patronage_rebate_rate) / 100).toLocaleString('vi-VN')} ₫</div>
          <div className="text-[11px] text-blue-600 font-semibold">Patronage Rebate theo doanh số</div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Đã chi trả thực tế</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-800">{distributedProfitAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${distributedProfitPct}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Niên độ kế toán</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <select className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800">
            <option value="2024">Niên độ 2024</option>
            <option value="2025">Niên độ 2025</option>
          </select>
        </div>
      </div>

      {/* FORM BÓC TÁCH THU NHẬP NỘI BỘ VS BÊN NGOÀI & TỶ LỆ TRÍCH QUỸ */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle space-y-4">
        <div className="flex justify-between items-center border-b border-[#e7e9ec] pb-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Tham số Bóc tách Thu nhập & Cấu hình Trích Quỹ (Luật HTX 2023)
          </h3>
          <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Thông tư 71/2024/TT-BTC & Nghị định 113/2024/NĐ-CP
          </span>
        </div>

        <form onSubmit={handleUpdateProfitPlan} className="space-y-4 text-[12.8px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lợi nhuận Giao dịch Nội bộ (TK 512) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={profitPlanForm.internal_service_surplus}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, internal_service_surplus: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-emerald-300 bg-emerald-50/20 rounded-lg font-extrabold text-emerald-900"
                />
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Miễn 100% thuế TNDN</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lợi nhuận Giao dịch Bên ngoài (TK 511) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={profitPlanForm.external_service_surplus}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, external_service_surplus: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Thuế TNDN 20% = {(profitPlanForm.external_service_surplus * 0.2).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Quỹ chung không chia (Min 5%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={profitPlanForm.unallocated_common_fund_rate}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, unallocated_common_fund_rate: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 border border-purple-300 rounded-lg font-bold text-purple-900"
                />
                <span className="text-[11.5px] text-purple-800 font-bold">({unallocatedCommonFundAmount.toLocaleString('vi-VN')} đ)</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chia theo Dịch vụ nội bộ (Min 51%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={51}
                  max={100}
                  value={profitPlanForm.patronage_rebate_rate}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, patronage_rebate_rate: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 border border-blue-300 rounded-lg font-bold text-blue-900"
                />
                <span className="text-[11.5px] text-blue-800 font-bold">(Patronage Rebate)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-[12.8px] whitespace-nowrap transition-all"
            >
              Cập nhật mô hình phân bổ thặng dư
            </button>
          </div>
        </form>
      </div>

      {/* MAIN PROFIT ALLOCATION TABLE & SIDE DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className={`${selectedSurplusItem ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden`}>
          <div className="p-3 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-[12.5px] font-bold text-slate-600">
              <span className="text-emerald-800 border-b-2 border-emerald-600 pb-1">Tất cả ({surplusItems.length})</span>
              <span className="hover:text-slate-900 cursor-pointer">Đã nhận ({paidMemberCount})</span>
              <span className="hover:text-slate-900 cursor-pointer">Chưa nhận ({unpaidMemberCount})</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên xã viên..."
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.8px]">
              <thead>
                <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã & Họ tên</th>
                  <th className="py-2.5 px-3 text-right">Chia theo Dịch vụ (&ge;51%)</th>
                  <th className="py-2.5 px-3 text-right">Chia theo Vốn góp</th>
                  <th className="py-2.5 px-3 text-right">Cấn trừ công nợ (đ)</th>
                  <th className="py-2.5 px-3 text-right">Thực lĩnh chuyển khoản (đ)</th>
                  <th className="py-2.5 px-3 text-center">Tái đầu tư vốn</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSurplusItems.map((item, idx) => {
                  const serviceShare = item.service_share_amount || Math.round(item.total_payout_amount * 0.55);
                  const capitalShare = item.capital_share_amount || (item.total_payout_amount - serviceShare);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedSurplusItem(item)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedSurplusItem?.id === item.id ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 block">{item.member_name}</strong>
                        <span className="text-[10.5px] font-mono text-slate-400">{item.member_code}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-blue-700">
                        +{serviceShare.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-700">
                        +{capitalShare.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-800">
                        {(item.debt_deduction || 0) > 0 ? `-${(item.debt_deduction || 0).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-800">
                        {(item.net_payout_amount || item.total_payout_amount || 0).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleReinvest(item.id)}
                          className={`p-1 rounded-md text-[11px] font-bold flex items-center gap-1 mx-auto ${item.reinvest_as_capital ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'}`}
                          title="Tự động chuyển thặng dư thành vốn góp bổ sung"
                        >
                          <RefreshCw className="w-3 h-3" /> {item.reinvest_as_capital ? 'Tái đầu tư' : 'Rút tiền'}
                        </button>
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
                  );
                })}
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
                    <span className="pill-badge pill-green text-[10.5px]">Đã duyệt</span>
                  </div>
                  <p className="text-[11.8px] text-slate-500">{selectedSurplusItem.member_code} &bull; Thành viên chính thức</p>
                </div>
              </div>
              <button onClick={() => setSelectedSurplusItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[12.5px] border-b border-slate-200 pb-3">
              <div className="font-bold text-slate-800 text-[12px] uppercase">Chi tiết Phân bổ Thặng dư</div>
              <div className="flex justify-between"><span className="text-slate-500">Doanh số dịch vụ nội bộ:</span> <span className="font-bold text-slate-900">12.500 kg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thưởng theo Dịch vụ (&ge;51%):</span> <span className="font-bold text-blue-700">+{((selectedSurplusItem.total_payout_amount * 0.55)).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thưởng theo Tỷ lệ vốn:</span> <span className="font-bold text-slate-900">+{((selectedSurplusItem.total_payout_amount * 0.45)).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between text-amber-800"><span>Khấu trừ nợ vật tư tồn đọng:</span> <span className="font-bold">-${(selectedSurplusItem.debt_deduction || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between text-emerald-900 font-extrabold text-sm border-t pt-1"><span>Thực lĩnh chuyển khoản:</span> <span>{(selectedSurplusItem.net_payout_amount || selectedSurplusItem.total_payout_amount || 0).toLocaleString('vi-VN')} ₫</span></div>
            </div>

            <div className="space-y-2 text-[12.5px] border-b border-slate-200 pb-3">
              <div className="font-bold text-slate-800 text-[12px] uppercase">Thông tin ngân hàng thụ hưởng</div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-emerald-800 text-[12px]">{selectedSurplusItem.bank_name || 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)'}</div>
                <div className="text-[12px] text-slate-700 font-mono font-bold">STK: {selectedSurplusItem.bank_account || '1234567890'}</div>
                <div className="text-[11.5px] text-slate-500">Chủ tài khoản: <strong>{selectedSurplusItem.account_holder || selectedSurplusItem.member_name}</strong></div>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2 border-t border-slate-200">
              <button className="px-3 py-1.5 border border-rose-300 text-rose-700 font-bold hover:bg-rose-50 text-[12px] rounded-lg inline-flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Hủy
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
          <h3 className="font-extrabold text-slate-900 text-sm">Cơ cấu trích Quỹ & Phân chia Thặng dư (Luật HTX 2023)</h3>
          <div className="flex items-center justify-between">
            <div className="w-36 h-36 rounded-full border-[16px] border-emerald-600 border-l-purple-500 border-b-blue-500 flex flex-col items-center justify-center text-center">
              <span className="text-[12px] font-extrabold text-slate-900">1.250.000.000 ₫</span>
              <span className="text-[9.5px] text-slate-400 uppercase font-bold">Tổng thặng dư</span>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Chia cho xã viên (85%)</span><strong className="text-slate-900">1.042.500.000 ₫</strong></div>
              <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Quỹ chung không chia (5%)</span><strong className="text-purple-900">20.000.000 ₫</strong></div>
              <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Quỹ ĐTPT & Khác (10%)</span><strong className="text-slate-900">187.500.000 ₫</strong></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm">Tiến độ chi trả thặng dư chuyển khoản</h3>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Đã chuyển</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Chưa chuyển</span>
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
