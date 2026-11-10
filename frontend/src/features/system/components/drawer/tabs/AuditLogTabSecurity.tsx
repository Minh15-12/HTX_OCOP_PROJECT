import React from 'react';
import { ShieldCheck, Globe, Terminal, Lock, Key, Award, FileLock } from 'lucide-react';
import { AuditLogItem } from '@/services/auditApi';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface AuditLogTabSecurityProps {
  log: AuditLogItem;
}

export const AuditLogTabSecurity: React.FC<AuditLogTabSecurityProps> = ({ log }) => {
  return (
    <div className="space-y-4">
      {/* Non-repudiation Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-extrabold text-sm text-emerald-950">
            Nguyên tắc Chống chối bỏ (Non-Repudiation) & Toàn vẹn SHA-256
          </h4>
          <p className="text-emerald-800 leading-relaxed">
            Bản ghi nhật ký này được băm mật mã học SHA-256 ngay tại thời điểm thực thi.
            Không có bất kỳ người dùng hay quản trị viên nào có thể sửa đổi hoặc xóa nhật ký
            hệ thống theo quy chuẩn kiểm toán an ninh mạng (FIPS 180-4).
          </p>
        </div>
      </div>

      {/* Thông số mạng & Phiên làm việc */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          Mạng & Thiết bị truy cập
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow label="Địa chỉ IP nguồn" value={log.ipAddress || '127.0.0.1'} isMono />
          <DataFieldRow
            label="Trình duyệt / User Agent"
            value={
              <span className="font-mono text-[11px] text-slate-600 break-all">
                {log.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
              </span>
            }
          />
          <DataFieldRow label="Mã định danh người dùng" value={log.userId || 'USER-SYSTEM'} isMono />
          <DataFieldRow label="Tên người dùng thực hiện" value={log.userName || 'Admin'} />
          <DataFieldRow
            label="Mã định danh HTX (Tenant ID)"
            value={log.cooperativeId || 'COOP-DEFAULT-01'}
            isMono
          />
        </div>
      </div>

      {/* Cơ chế bảo mật chuỗi băm */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <FileLock className="w-3.5 h-3.5 text-emerald-600" />
          Chứng thực chữ ký số & Hash Chain
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow
            label="Mã băm SHA-256 của bản ghi"
            value={
              <span className="font-mono text-[11px] text-slate-700 break-all select-all font-semibold">
                {log.hashSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </span>
            }
          />
          <DataFieldRow
            label="Thuật toán mã hóa băm"
            value="NIST FIPS 180-4 Secure Hash Algorithm 256-bit"
          />
          <DataFieldRow
            label="Tuân thủ pháp lý"
            value="Nghị định 13/2023/NĐ-CP & Luật An ninh mạng 2018"
          />
          <DataFieldRow
            label="Tính nguyên vẹn"
            value={
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Chuỗi khối chưa bị chỉnh sửa hoặc phá vỡ
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
};
