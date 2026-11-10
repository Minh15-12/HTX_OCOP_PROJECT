import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  X,
  History,
  Terminal,
  Globe,
  Database,
  User,
} from 'lucide-react';
import { AuditLogItem } from '@/services/auditApi';

interface AuditLogDrawerHeaderProps {
  log: AuditLogItem;
  onClose: () => void;
}

export const AuditLogDrawerHeader: React.FC<AuditLogDrawerHeaderProps> = ({ log, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    if (log.hashSha256) {
      navigator.clipboard.writeText(log.hashSha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 border-b border-slate-700/60">
      {/* Top action row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-emerald-400 border border-white/10 shadow-inner">
            <ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                AUDIT-{log.id}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                {log.action}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">
              {log.entityType}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng ngăn chi tiết nhật ký audit"
          className="p-1.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* SHA-256 Hash Badge Row */}
      {log.hashSha256 && (
        <div className="mt-3.5 bg-black/30 rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 shrink-0">
              SHA-256
            </span>
            <span className="font-mono text-[11px] text-slate-300 truncate" title={log.hashSha256}>
              {log.hashSha256}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyHash}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition shrink-0 cursor-pointer"
            title="Sao chép mã băm SHA-256"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 4 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3.5 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <User className="w-3.5 h-3.5 text-sky-400" />
            Người thao tác
          </div>
          <div className="text-xs font-extrabold text-white mt-0.5 truncate" title={log.userName}>
            {log.userName || 'Hệ thống'}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            Địa chỉ IP
          </div>
          <div className="text-xs font-extrabold text-white mt-0.5 font-mono truncate">
            {log.ipAddress || '127.0.0.1'}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Thời điểm
          </div>
          <div className="text-[11.5px] font-extrabold text-white mt-0.5 font-mono truncate">
            {log.createdAt}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Toàn vẹn dữ liệu
          </div>
          <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
            Xác thực chuỗi
          </div>
        </div>
      </div>
    </div>
  );
};
