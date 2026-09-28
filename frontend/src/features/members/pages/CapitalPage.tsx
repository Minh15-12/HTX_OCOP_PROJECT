import React, { useState, useEffect } from 'react';
import { Wallet, Search, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { mockMembersList, mockCapitalTransactions } from '@/services/memberService';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const CapitalPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<CapitalTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In real app, fetch from API
    setMembers(mockMembersList);
    setTransactions(mockCapitalTransactions);
  }, []);

  // Tính toán KPI
  const totalCharterCapital = members.reduce((sum, m) => sum + (m.committed_capital || 0), 0);
  const totalContributedCapital = members.reduce((sum, m) => sum + (m.contributed_capital || 0), 0);
  const progressPercent = totalCharterCapital > 0 ? (totalContributedCapital / totalCharterCapital) * 100 : 0;

  // Lọc dữ liệu
  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.member_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Vốn góp</h1>
          </div>
          <p className="text-blue-50 text-lg max-w-2xl leading-relaxed">
            Theo dõi tình hình góp vốn điều lệ của xã viên, cảnh báo vượt trần 30% và xuất giấy chứng nhận vốn góp.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-bold shadow-sm transition-all hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            <span>Ghi nhận vốn góp</span>
          </button>
        </div>
      </div>

      {/* Progress Dashboard */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tiến độ Góp Vốn Điều Lệ HTX</h2>
            <p className="text-slate-500 mt-1">Tổng quan nguồn vốn thực tế so với cam kết</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalContributedCapital)} ₫</div>
            <div className="text-slate-500 font-medium">/ {formatCurrency(totalCharterCapital)} ₫ (Cam kết)</div>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden">
          <div 
            className="bg-blue-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end px-3 text-white text-xs font-bold" 
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm xã viên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="px-6 py-4 font-semibold">Thành viên</th>
                  <th className="px-6 py-4 font-semibold">Đã góp / Cam kết</th>
                  <th className="px-6 py-4 font-semibold">Tỷ lệ sở hữu (%)</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => {
                  const ownershipPct = m.ownership_percentage || 0;
                  const isWarning = ownershipPct >= 30;
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-base">{m.full_name}</div>
                        <div className="text-slate-500 text-sm">{m.member_code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{formatCurrency(m.contributed_capital)} ₫</div>
                        <div className="text-slate-500 text-sm">/ {formatCurrency(m.committed_capital)} ₫</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 font-bold ${isWarning ? 'text-orange-600' : 'text-slate-700'}`}>
                          {ownershipPct.toFixed(2)}%
                          {isWarning && <AlertTriangle className="w-4 h-4" title="Cảnh báo: Vượt trần 30% vốn điều lệ (BR-COOP-004)" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {m.capital_status === 'DU_VON' ? (
                          <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold border border-green-200 w-max">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đủ vốn
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-3 py-1 rounded-full text-xs font-semibold border border-orange-200 w-max">
                            <AlertTriangle className="w-3.5 h-3.5" /> Còn thiếu {formatCurrency(m.remaining_capital)} ₫
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">Chi tiết</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
