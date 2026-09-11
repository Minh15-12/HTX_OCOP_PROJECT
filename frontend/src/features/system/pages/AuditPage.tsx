import React from 'react';
import { History, ShieldCheck, User } from 'lucide-react';

export const AuditPage: React.FC = () => {
  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Nhật ký Kiểm toán & Hoạt động Hệ thống (Audit Log)
        </h1>
        <p className="text-[12.8px] text-slate-500 mt-0.5">
          Truy vết toàn bộ lịch sử chỉnh sửa dữ liệu, duyệt minh chứng và thay đổi phân quyền người dùng.
        </p>
      </div>

      <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
        <table className="w-full text-left border-collapse text-[12.9px]">
          <thead>
            <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
              <th className="py-3 px-4">Thời gian</th>
              <th className="py-3 px-4">Người thực hiện</th>
              <th className="py-3 px-4">Hành động</th>
              <th className="py-3 px-4">Đối tượng</th>
              <th className="py-3 px-4">Chi tiết thay đổi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-mono text-[12px] text-slate-600">08/09/2026 14:32</td>
              <td className="py-3 px-4 font-bold text-slate-900">Nguyễn Văn An (Admin)</td>
              <td className="py-3 px-4"><span className="pill-badge pill-green">Cập nhật điểm</span></td>
              <td className="py-3 px-4 font-semibold text-slate-800">DOS-2026-001</td>
              <td className="py-3 px-4 text-slate-600">Chấm điểm Tiêu chí 1.1 thành 8/10 điểm</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-mono text-[12px] text-slate-600">08/09/2026 10:15</td>
              <td className="py-3 px-4 font-bold text-slate-900">Trần Thị Bình (Kế toán)</td>
              <td className="py-3 px-4"><span className="pill-badge pill-blue">Tải minh chứng</span></td>
              <td className="py-3 px-4 font-semibold text-slate-800">MC-ATVSTP-02</td>
              <td className="py-3 px-4 text-slate-600">Tải lên file Giay_Chung_Nhan_VietGAP.pdf</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
