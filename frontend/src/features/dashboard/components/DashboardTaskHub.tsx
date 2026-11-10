import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  RotateCcw,
  Building2,
  AlertOctagon,
  Sprout,
  Warehouse,
  Coins,
  Award,
} from 'lucide-react';
import { TaskItem, TaskCategory } from '@/stores/taskNotificationStore';

interface DashboardTaskHubProps {
  taskFilter: 'PENDING' | 'CRITICAL' | 'COMPLETED' | 'ALL';
  setTaskFilter: (filter: 'PENDING' | 'CRITICAL' | 'COMPLETED' | 'ALL') => void;
  displayTasks: TaskItem[];
  pendingCount: number;
  criticalCount: number;
  completedCount: number;
  totalCount: number;
  completedPercent: number;
  onQuickAction: (task: TaskItem) => void;
  onCompleteTask: (id: string) => void;
  onSnoozeTask: (id: string, hours: number) => void;
  onResetTasks: () => void;
  isFullWidth?: boolean;
}

export const DashboardTaskHub: React.FC<DashboardTaskHubProps> = ({
  taskFilter,
  setTaskFilter,
  displayTasks,
  pendingCount,
  criticalCount,
  completedCount,
  totalCount,
  completedPercent,
  onQuickAction,
  onCompleteTask,
  onSnoozeTask,
  onResetTasks,
  isFullWidth = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter by category and search query
  const filteredTasks = displayTasks.filter((task) => {
    const matchCategory = selectedCategory === 'ALL' || task.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.meta?.memberName && task.meta.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.meta?.memberCode && task.meta.memberCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'AGRICULTURE':
        return <Sprout className="w-3.5 h-3.5 text-emerald-600" />;
      case 'INVENTORY':
        return <Warehouse className="w-3.5 h-3.5 text-amber-600" />;
      case 'FINANCE':
        return <Coins className="w-3.5 h-3.5 text-blue-600" />;
      case 'MEMBER':
        return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'OCOP':
        return <Award className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div
      id="task-hub"
      className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden flex flex-col"
    >
      {/* Header & Metrics */}
      <div className="p-4 border-b border-[#e7e9ec] bg-slate-50/70 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-[15.5px] text-slate-900">
                Trung tâm Tác nghiệp & Phê duyệt Nhắc việc
              </h3>
              {pendingCount > 0 ? (
                <span className="pill-badge pill-red text-[11px] animate-pulse">
                  {pendingCount} việc cần xử lý
                </span>
              ) : (
                <span className="pill-badge pill-green text-[11px]">Đã xử lý xong toàn bộ</span>
              )}
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Phê duyệt dứt điểm, giải quyết tồn đọng và quản lý hạn chót công việc HTX Tân Tiến
            </p>
          </div>

          {/* Progress Summary Gauge */}
          <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10.5px] text-slate-500 font-semibold">Tiến độ hôm nay</div>
              <div className="text-[12.5px] font-extrabold text-emerald-800">
                {completedCount}/{totalCount} việc ({completedPercent}%)
              </div>
            </div>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${completedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-slate-200/60">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <button
              onClick={() => setTaskFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                taskFilter === 'PENDING'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Cần xử lý ({pendingCount})
            </button>
            <button
              onClick={() => setTaskFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                taskFilter === 'CRITICAL'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Khẩn cấp ({criticalCount})
            </button>
            <button
              onClick={() => setTaskFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                taskFilter === 'COMPLETED'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Đã giải quyết ({completedCount})
            </button>
            <button
              onClick={() => setTaskFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                taskFilter === 'ALL'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Tất cả ({totalCount})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên việc, xã viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Department / Category Tabs (Shown prominently in Full Width mode) */}
        {isFullWidth && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px] pt-1">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Phân hệ:
            </span>
            {[
              { id: 'ALL', label: 'Tất cả phân hệ' },
              { id: 'FINANCE', label: '💰 Tài chính - Kế toán' },
              { id: 'MEMBER', label: '👥 Ban Giám đốc - Xã viên' },
              { id: 'INVENTORY', label: '📦 Kho & Vật tư' },
              { id: 'AGRICULTURE', label: '🌾 Nông nghiệp & VietGAP' },
              { id: 'OCOP', label: '⭐ Hồ sơ OCOP' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-200/90 text-slate-900 border border-slate-300'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task List Content */}
      <div className={`p-4 space-y-3 flex-1 ${isFullWidth ? 'min-h-[450px]' : 'max-h-[520px] overflow-y-auto'}`}>
        {filteredTasks.length === 0 ? (
          <div className="py-14 text-center text-slate-400 space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="font-extrabold text-slate-800 text-[14px]">
              {searchQuery ? 'Không tìm thấy tác vụ phù hợp' : 'Tuyệt vời! Không còn việc tồn đọng'}
            </p>
            <p className="text-[12px] text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chuyển bộ lọc trạng thái.'
                : 'Mọi hồ sơ, phê duyệt và chứng từ trong phân hệ đều đã được giải quyết dứt điểm.'}
            </p>
            <button
              onClick={onResetTasks}
              className="mt-2 text-xs text-emerald-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Tải lại bộ tác vụ mẫu để kiểm thử &rarr;
            </button>
          </div>
        ) : (
          <div className={isFullWidth ? 'grid grid-cols-1 md:grid-cols-2 gap-3.5' : 'space-y-3'}>
            {filteredTasks.map((t) => {
              const isDone = t.status === 'COMPLETED';

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : t.priority === 'CRITICAL'
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 hover:shadow-xs'
                      : t.priority === 'HIGH'
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 hover:shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                            t.priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.priority === 'CRITICAL'
                            ? 'Khẩn cấp'
                            : t.priority === 'HIGH'
                            ? 'Ưu tiên cao'
                            : 'Bình thường'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          {getCategoryIcon(t.category)}
                          {t.categoryLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.timeAgo}
                      </span>
                    </div>

                    <div>
                      <h4
                        className={`font-extrabold text-[13.5px] leading-snug ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {t.title}
                      </h4>
                      <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    {/* Metadata Pill Tags */}
                    {t.meta && (
                      <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
                        {t.meta.memberName && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            Xã viên: <strong>{t.meta.memberName}</strong> ({t.meta.memberCode})
                          </span>
                        )}
                        {typeof t.meta.amount === 'number' && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                            Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.meta.amount)}
                          </span>
                        )}
                        {t.meta.materialName && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                            Vật tư: {t.meta.materialName}
                          </span>
                        )}
                        {t.meta.dossierName && (
                          <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-medium">
                            Hồ sơ: {t.meta.dossierName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Strip */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Hạn xử lý: <strong className="text-slate-700">{t.dueLabel}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {!isDone ? (
                        <>
                          <button
                            onClick={() => onQuickAction(t)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            {t.actionLabel || 'Xử lý ngay'} <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSnoozeTask(t.id, 24)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Báo lại sau 24h"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onCompleteTask(t.id)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg border border-emerald-200 hover:bg-emerald-50 cursor-pointer transition-colors"
                            title="Đánh dấu hoàn thành trực tiếp"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã hoàn thành
                        </span>
                      )}
                    </div>
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
