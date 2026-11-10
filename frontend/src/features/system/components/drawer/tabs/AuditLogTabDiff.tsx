import React, { useState } from 'react';
import { ArrowRight, Code, Copy, Check, FileDiff, Plus, Minus, RefreshCw } from 'lucide-react';
import { AuditLogItem } from '@/services/auditApi';

interface AuditLogTabDiffProps {
  log: AuditLogItem;
}

export const AuditLogTabDiff: React.FC<AuditLogTabDiffProps> = ({ log }) => {
  const [copiedBefore, setCopiedBefore] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);

  const before = log.beforePayload;
  const after = log.afterPayload;

  const hasBefore = before && Object.keys(before).length > 0;
  const hasAfter = after && Object.keys(after).length > 0;

  // Extract all unique keys
  const allKeys = Array.from(
    new Set([...(hasBefore ? Object.keys(before) : []), ...(hasAfter ? Object.keys(after) : [])])
  );

  const handleCopy = (data: any, isBefore: boolean) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    if (isBefore) {
      setCopiedBefore(true);
      setTimeout(() => setCopiedBefore(false), 2000);
    } else {
      setCopiedAfter(true);
      setTimeout(() => setCopiedAfter(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Context info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDiff className="w-4 h-4 text-emerald-600" />
            <span className="font-extrabold text-slate-800">
              Đối chiếu thay đổi trạng thái (State Delta Verification)
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            {allKeys.length} trường dữ liệu theo dõi
          </span>
        </div>
        <p className="text-slate-500 mt-1">
          So sánh chi tiết giá trị trước (Before) và sau (After) của thực thể nhằm phát hiện
          mọi sự can thiệp hoặc thay đổi trái phép.
        </p>
      </div>

      {/* Visual Field Diff Table */}
      {allKeys.length > 0 ? (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-3.5 w-1/4">Thuộc tính</th>
                <th className="py-2.5 px-3.5 w-3/8 text-rose-800">Giá trị Trước (Before)</th>
                <th className="py-2.5 px-3.5 w-3/8 text-emerald-800">Giá trị Sau (After)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11.5px]">
              {allKeys.map((key) => {
                const valBefore = before ? before[key] : undefined;
                const valAfter = after ? after[key] : undefined;
                const isChanged = JSON.stringify(valBefore) !== JSON.stringify(valAfter);

                return (
                  <tr
                    key={key}
                    className={`transition-colors ${
                      isChanged ? 'bg-amber-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-bold text-slate-800 font-sans">
                      {key}
                      {isChanged && (
                        <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 break-all">
                      {valBefore !== undefined ? (
                        <span className={isChanged ? 'text-rose-700 line-through' : ''}>
                          {typeof valBefore === 'object'
                            ? JSON.stringify(valBefore)
                            : String(valBefore)}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic font-sans">— (Không tồn tại)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-900 break-all font-semibold">
                      {valAfter !== undefined ? (
                        <span className={isChanged ? 'text-emerald-700 font-bold' : ''}>
                          {typeof valAfter === 'object'
                            ? JSON.stringify(valAfter)
                            : String(valAfter)}
                        </span>
                      ) : (
                        <span className="text-rose-500 italic font-sans">— (Đã bị xóa)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
          Hành động này không ghi nhận thay đổi trạng thái payload (Chỉ ghi vết sự kiện đọc/tải).
        </div>
      )}

      {/* Raw JSON Payloads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Before JSON */}
        <div className="border border-slate-200 rounded-2xl bg-slate-900 text-slate-100 p-3.5 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-rose-400" />
              Before Payload
            </span>
            {hasBefore && (
              <button
                type="button"
                onClick={() => handleCopy(before, true)}
                className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                {copiedBefore ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedBefore ? 'Đã sao chép' : 'Chép'}
              </button>
            )}
          </div>
          <pre className="text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto scrollbar-thin">
            {hasBefore ? JSON.stringify(before, null, 2) : '// Không có dữ liệu trước thay đổi'}
          </pre>
        </div>

        {/* After JSON */}
        <div className="border border-slate-200 rounded-2xl bg-slate-900 text-slate-100 p-3.5 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              After Payload
            </span>
            {hasAfter && (
              <button
                type="button"
                onClick={() => handleCopy(after, false)}
                className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                {copiedAfter ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedAfter ? 'Đã sao chép' : 'Chép'}
              </button>
            )}
          </div>
          <pre className="text-[11px] font-mono text-emerald-300 max-h-48 overflow-y-auto scrollbar-thin">
            {hasAfter ? JSON.stringify(after, null, 2) : '// Không có dữ liệu sau thay đổi'}
          </pre>
        </div>
      </div>
    </div>
  );
};
