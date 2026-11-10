import React, { useState } from 'react';
import { Users, FileSpreadsheet, Printer, ShieldCheck, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { DashboardMetrics } from '@/services/reportApi';
import { Member } from '@/types/memberTypes';
import { openInteractivePrintWindow } from '@/utils/pdfExportUtils';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { Skeleton } from '@/components/ui/Skeleton';

interface MembersEquityReportTabProps {
  metrics: DashboardMetrics | undefined;
  members: Member[];
  isLoading: boolean;
  onExportExcel: () => void;
  isExportingExcel: boolean;
}

export const MembersEquityReportTab: React.FC<MembersEquityReportTabProps> = ({
  metrics,
  members,
  isLoading,
  onExportExcel,
  isExportingExcel,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const coopName = activeCooperative?.legal_name || 'Hợp tác xã Nông nghiệp';

  const totalCommitted = members.reduce((sum, m) => sum + (m.committed_capital || 0), 0);
  const totalContributed = metrics?.members?.total_capital_contribution ?? members.reduce((sum, m) => sum + (m.contributed_capital || 0), 0);
  const completionPct = totalCommitted > 0 ? Math.min(100, Math.round((totalContributed / totalCommitted) * 100)) : 100;

  const associateMembers = members.filter((m) => m.member_type === 'LIEN_KET_GOP_VON' || m.member_type === 'LIEN_KET_KHONG_GOP_VON');
  const associateCapital = members.filter((m) => m.member_type === 'LIEN_KET_GOP_VON').reduce((sum, m) => sum + (m.contributed_capital || 0), 0);
  const associatePct = totalContributed > 0 ? Math.round((associateCapital / totalContributed) * 100) : 0;
  const isOverLimit = associatePct > 30;

  const handlePrint = () => {
    const tableRows = members.map((m, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td style="font-family:monospace; font-weight:bold;">${m.member_code}</td>
        <td style="font-weight:bold;">${m.full_name}</td>
        <td>${m.cccd || '—'}</td>
        <td>${m.phone || '—'}</td>
        <td>${m.member_type === 'CHINH_THUC' ? 'Xã viên chính thức' : 'Xã viên liên kết'}</td>
        <td style="text-align:right; font-family:monospace;">${(m.contributed_capital || 0).toLocaleString('vi-VN')} ₫</td>
        <td style="text-align:center;">${m.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1e293b;">
        <div style="border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #0f766e; font-size: 20px; text-transform: uppercase;">${coopName}</h2>
          <h1 style="margin: 6px 0 0 0; color: #0f172a; font-size: 16px;">BÁO CÁO CƠ CẤU XÃ VIÊN & VỐN GÓP ĐIỀU LỆ</h1>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Căn cứ Luật Hợp tác xã số 17/2023/QH15 • Ngày trích xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Tổng số xã viên</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${members.length} thành viên</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Vốn đã góp thực tế</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f766e;">${totalContributed.toLocaleString('vi-VN')} ₫</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Tỷ lệ hoàn thành vốn</div>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb;">${completionPct}%</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Vốn thành viên liên kết</div>
            <div style="font-size: 18px; font-weight: bold; color: ${isOverLimit ? '#dc2626' : '#16a34a'};">${associatePct}% (Trần: 30%)</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">STT</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Mã số</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Họ và tên</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">CCCD</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Điện thoại</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Phân loại</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:right;">Vốn đã góp</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:center;">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px;">
          <div style="text-align: center;">
            <strong>NGƯỜI LẬP BIỂU</strong><br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div style="text-align: center;">
            <strong>KẾ TOÁN TRƯỞNG</strong><br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div style="text-align: center;">
            <strong>ĐẠI DIỆN HỢP TÁC XÃ</strong><br/>
            <em>(Giám đốc / Chủ tịch HĐQT)</em><br/><br/><br/>
            (Ký tên và đóng dấu)
          </div>
        </div>
      </div>
    `;

    openInteractivePrintWindow({
      title: `Báo Cáo Sổ Xã Viên - ${coopName}`,
      filename: `bao_cao_xa_vien_${new Date().toISOString().slice(0, 10)}.html`,
      contentHtml: html,
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng số xã viên HTX</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics?.totalMembers ?? members.length} <span className="text-xs font-bold text-slate-500">người</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Chính thức: {members.filter((m) => m.member_type === 'CHINH_THUC').length} • Liên kết: {associateMembers.length}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Vốn đã góp thực tế</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-2" />
          ) : (
            <div className="text-xl font-black text-emerald-700 mt-1 truncate">
              {totalContributed.toLocaleString('vi-VN')} ₫
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium truncate">
            Cam kết: {totalCommitted.toLocaleString('vi-VN')} ₫
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tỷ lệ hoàn thành vốn</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <div className="text-2xl font-black text-blue-700 mt-1">
              {completionPct}%
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Tiến độ nộp vốn điều lệ
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Vốn thành viên liên kết</span>
            {isOverLimit ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className={`text-2xl font-black mt-1 ${isOverLimit ? 'text-rose-600' : 'text-slate-900'}`}>
              {associatePct}% <span className="text-xs font-bold text-slate-400">/ 30% trần</span>
            </div>
          )}
          <div className="text-[11px] mt-1 font-medium">
            {isOverLimit ? (
              <span className="text-rose-600 font-bold">Vượt trần Luật HTX 2023!</span>
            ) : (
              <span className="text-emerald-700 font-bold">✓ Đúng hạn mức điều lệ</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Toolbar & Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Danh sách chi tiết Sổ Xã Viên & Vốn điều lệ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dữ liệu được cập nhật tự động từ Sổ đăng ký xã viên và Giấy chứng nhận phần vốn góp.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExportExcel}
              disabled={isExportingExcel}
              className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              {isExportingExcel ? 'Đang xuất...' : 'Xuất Sổ Xã Viên Excel'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In / Lưu PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Mã số</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Số CCCD</th>
                <th className="py-2.5 px-3">Số điện thoại</th>
                <th className="py-2.5 px-3">Loại xã viên</th>
                <th className="py-2.5 px-3 text-right">Vốn đã nộp</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">Đang tải dữ liệu xã viên...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">Chưa có dữ liệu xã viên.</td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{m.member_code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.full_name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{m.cccd || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{m.phone || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        m.member_type === 'CHINH_THUC'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {m.member_type === 'CHINH_THUC' ? 'Chính thức' : 'Liên kết'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {(m.contributed_capital || 0).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="pill-badge pill-green text-[10px]">Đang hoạt động</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
