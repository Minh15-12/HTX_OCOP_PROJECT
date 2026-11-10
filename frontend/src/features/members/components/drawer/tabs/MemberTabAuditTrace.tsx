import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Member } from '@/types/memberTypes';
import { auditApi } from '@/services/auditApi';
import {
  ShieldCheck,
  History,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface MemberTabAuditTraceProps {
  member: Member;
}

export const MemberTabAuditTrace: React.FC<MemberTabAuditTraceProps> = ({ member }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const { data: traceData, isLoading, isError } = useQuery({
    queryKey: ['memberAuditTrace', member.id],
    queryFn: () => auditApi.traceMember(member.id),
    enabled: Boolean(member.id),
  });

  const timeline = traceData?.audit_timeline || [];

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatAction = (action: string) => {
    switch (action) {
      case 'MEMBER_CREATED':
        return { label: 'Đăng ký hồ sơ xã viên', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'MEMBER_APPROVED':
        return { label: 'Phê duyệt kết nạp', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'MEMBER_UPDATED':
        return { label: 'Cập nhật thông tin', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'CAPITAL_CONTRIBUTION_RECORDED':
        return { label: 'Góp vốn điều lệ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'LAND_CONTRIBUTION_RECORDED':
        return { label: 'Góp vốn QSD Đất (Sổ đỏ)', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'MEMBER_SUSPENDED':
        return { label: 'Tạm đình chỉ tư cách', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'MEMBER_RESTORED':
        return { label: 'Khôi phục tư cách', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: action, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4">
      {/* CARD 1: XÁC THỰC TOÀN VẸN CHUỖI KHỐI SHA-256 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Sổ cái Kiểm toán Bất biến SHA-256
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mọi thay đổi dữ liệu của xã viên đều được liên kết chuỗi mật mã chống chối bỏ.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Chuẩn Audit HTX 2023
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Mã xã viên</span>
            <span className="font-mono font-bold text-slate-800">{member.member_code}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">CCCD/CMND</span>
            <span className="font-mono font-bold text-slate-800">{member.cccd}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Ngày kết nạp</span>
            <span className="font-mono font-bold text-slate-800">{member.join_date || 'Chưa duyệt'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Sự kiện ghi nhận</span>
            <span className="font-mono font-bold text-emerald-700">{timeline.length} bản ghi</span>
          </div>
        </div>
      </div>

      {/* CARD 2: DÒNG THỜI GIAN LỊCH SỬ (TIMELINE) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-purple-600" />
            Nhật ký vòng đời xã viên ({timeline.length})
          </span>
        </h3>

        {isLoading ? (
          <div className="py-8 flex items-center justify-center text-slate-400 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            Đang truy vết chuỗi nhật ký kiểm toán từ hệ thống...
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-500 text-xs bg-rose-50 rounded-xl border border-rose-200">
            Không thể tải thông tin truy vết kiểm toán xã viên này.
          </div>
        ) : timeline.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
            <AlertCircle className="w-6 h-6 text-slate-300 mb-1" />
            <p className="font-semibold text-slate-600">Chưa ghi nhận sự kiện kiểm toán</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chưa có nhật ký thay đổi trạng thái nào cho xã viên này trong bảng audit_events.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((event) => {
              const act = formatAction(event.action);
              const isExpanded = expandedEvents[event.id];
              const isCopied = copiedHash === event.current_hash;

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-2xs group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 transition-colors">
                    {/* Event Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${act.color}`}
                        >
                          {act.label}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {event.entity_type} #{event.entity_id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(event.timestamp).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Hash Pill */}
                    <div className="mt-2.5 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/70 text-[11px]">
                      <div className="flex items-center gap-1.5 font-mono text-slate-600 truncate mr-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-400 font-semibold">SHA-256:</span>
                        <span className="truncate">{event.current_hash}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(event.current_hash)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                        title="Copy mã hash"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Expandable Before / After Payload */}
                    {(event.before || event.after) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/50">
                        <button
                          type="button"
                          onClick={() => toggleExpand(event.id)}
                          className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                          <span>
                            {isExpanded ? 'Ẩn chi tiết thay đổi dữ liệu' : 'Xem chi tiết thay đổi (Before/After)'}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] font-mono">
                            {event.before && (
                              <div className="p-2 bg-rose-50/50 border border-rose-100 rounded-lg overflow-x-auto">
                                <span className="font-bold text-rose-800 block mb-1">
                                  Dữ liệu trước (Before):
                                </span>
                                <pre className="text-slate-700 whitespace-pre-wrap">
                                  {JSON.stringify(event.before, null, 2)}
                                </pre>
                              </div>
                            )}
                            {event.after && (
                              <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg overflow-x-auto">
                                <span className="font-bold text-emerald-800 block mb-1">
                                  Dữ liệu sau (After):
                                </span>
                                <pre className="text-slate-700 whitespace-pre-wrap">
                                  {JSON.stringify(event.after, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
