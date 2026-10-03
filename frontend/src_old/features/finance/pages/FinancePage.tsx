import React, { useState } from 'react';
import { Coins, Plus, Search, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock } from 'lucide-react';

export const FinancePage: React.FC = () => {
  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Tài chính & Nhật ký Giao dịch Thu - Chi
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Theo dõi dòng tiền, thu mua nông sản xã viên, thanh toán vật tư và phân chia lợi nhuận HTX.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3.5 py-2 rounded-lg bg-[#16a34a] text-white font-bold text-[12.5px] inline-flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Lập phiếu Thu / Chi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-medium">Tổng Quỹ HTX hiện tại</div>
          <div className="text-2xl font-black text-slate-900 mt-1">485,000,000 ₫</div>
        </div>
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-medium">Doanh thu thu mua trong tháng</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">320,500,000 ₫</div>
        </div>
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-medium">Công nợ phải thu xã viên</div>
          <div className="text-2xl font-black text-amber-700 mt-1">12,500,000 ₫</div>
        </div>
      </div>

      <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
        <div className="p-3.5 border-b border-[#e7e9ec] bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-[14px] text-slate-900">Nhật ký giao dịch gần đây</h3>
          <span className="pill-badge pill-amber">1 giao dịch chờ duyệt</span>
        </div>
        <table className="w-full text-left border-collapse text-[12.9px]">
          <thead>
            <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
              <th className="py-3 px-4">Mã GD</th>
              <th className="py-3 px-4">Ngày giao dịch</th>
              <th className="py-3 px-4">Hạng mục</th>
              <th className="py-3 px-4">Đối tác / Xã viên</th>
              <th className="py-3 px-4">Số tiền</th>
              <th className="py-3 px-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-mono font-bold text-slate-600">GD-2026-089</td>
              <td className="py-3 px-4 text-slate-800">05/09/2026</td>
              <td className="py-3 px-4 font-medium text-slate-900">Thu mua Trà tươi đợt 1</td>
              <td className="py-3 px-4 text-slate-700">Nguyễn Văn An</td>
              <td className="py-3 px-4 font-bold text-emerald-700">+15,400,000 ₫</td>
              <td className="py-3 px-4"><span className="pill-badge pill-green">Đã thanh toán</span></td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-mono font-bold text-slate-600">GD-2026-088</td>
              <td className="py-3 px-4 text-slate-800">04/09/2026</td>
              <td className="py-3 px-4 font-medium text-slate-900">Thanh toán vật tư NPK</td>
              <td className="py-3 px-4 text-slate-700">Công ty Phân bón Bình Điền</td>
              <td className="py-3 px-4 font-bold text-rose-600">-8,500,000 ₫</td>
              <td className="py-3 px-4"><span className="pill-badge pill-amber">Chờ duyệt chi</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
