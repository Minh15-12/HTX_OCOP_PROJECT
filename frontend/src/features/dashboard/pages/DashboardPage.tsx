import React, { useState } from 'react';
import { Users, Sprout, Warehouse, Coins, ArrowRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskNotificationStore, TaskItem } from '@/stores/taskNotificationStore';
import { QuickActionTaskModal } from '@/features/dashboard/components/QuickActionTaskModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    tasks,
    pendingTasks,
    completedTasks,
    criticalTasks,
    pendingCount,
    totalCount,
    completedPercent,
    completeTask,
    snoozeTask,
    resetDefaultTasks,
  } = useTaskNotificationStore();

  const [taskFilter, setTaskFilter] = useState<'PENDING' | 'CRITICAL' | 'COMPLETED' | 'ALL'>('PENDING');
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleQuickAction = (task: TaskItem) => {
    setActiveTask(task);
    setModalOpen(true);
  };

  const displayTasks =
    taskFilter === 'PENDING'
      ? pendingTasks
      : taskFilter === 'CRITICAL'
      ? criticalTasks
      : taskFilter === 'COMPLETED'
      ? completedTasks
      : tasks;

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-1 max-w-2xl">
            Tình hình xã viên, vùng trồng, kho vật tư, tài chính và tiến độ số hóa hồ sơ OCOP.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-slate-500">Mùa vụ hiện tại:</span>
          <span className="pill-badge pill-green text-[12px] px-3 py-1">Đông Xuân 2025–2026</span>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Members */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-medium">Xã viên hoạt động</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">128</div>
            <div className="text-[11.3px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              4 xã viên chờ duyệt
            </div>
          </div>
        </div>

        {/* Card 2: Zones */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Sprout className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-medium">Diện tích vùng trồng</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">86,4 ha</div>
            <div className="text-[11.3px] text-emerald-600 font-bold mt-0.5">
              14 vùng / 5 loại cây
            </div>
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Warehouse className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-medium">Vật tư dưới ngưỡng tồn</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">2</div>
            <div className="text-[11.3px] text-amber-700 font-bold mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Cần nhập bổ sung
            </div>
          </div>
        </div>

        {/* Card 4: Receivables/Debt */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Coins className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-medium">Công nợ xã viên</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">12,500,000 ₫</div>
            <div className="text-[11.3px] text-purple-700 font-bold mt-0.5">
              Chưa thu hồi
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Panel: OCOP Status Breakdown */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e7e9ec] bg-slate-50/50">
            <div>
              <h3 className="font-bold text-[14.5px] text-slate-900">Tiến độ hồ sơ OCOP theo trạng thái</h3>
              <p className="text-[11.8px] text-slate-500">Đợt đánh giá phân hạng 2026</p>
            </div>
            <button
              onClick={() => navigate('/ocop/dossiers')}
              className="text-emerald-700 hover:text-emerald-800 text-[12.5px] font-bold inline-flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-4">
            <table className="w-full text-left border-collapse text-[12.9px]">
              <thead>
                <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/80">
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Số hồ sơ</th>
                  <th className="py-2.5 px-3 w-[45%]">Tỉ lệ hoán thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <span className="pill-badge pill-amber">Chờ nộp minh chứng</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">2 hồ sơ</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-[11.5px] font-bold text-slate-600">40%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">
                    <span className="pill-badge pill-blue">Đang chấm điểm</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">1 hồ sơ</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-[11.5px] font-bold text-slate-600">75%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">
                    <span className="pill-badge pill-green">Đã chứng nhận OCOP</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">2 hồ sơ</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-[11.5px] font-bold text-slate-600">100%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Trung tâm Nhắc việc & Thao tác Tập trung (Actionable Task Hub) */}
        <div id="task-hub" className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden flex flex-col">
          {/* Header với Thống kê & Thanh Tiến độ Tác vụ */}
          <div className="p-4 border-b border-[#e7e9ec] bg-slate-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[15px] text-slate-900">Trung tâm Nhắc việc & Thao tác</h3>
                  {pendingCount > 0 ? (
                    <span className="pill-badge pill-red text-[10.5px] animate-pulse">
                      {pendingCount} việc cần xử lý
                    </span>
                  ) : (
                    <span className="pill-badge pill-green text-[10.5px]">
                      Đã xử lý xong toàn bộ
                    </span>
                  )}
                </div>
                <p className="text-[11.8px] text-slate-500 mt-0.5">
                  Xử lý dứt điểm, phê duyệt tức thì & cảnh báo hạn chót
                </p>
              </div>

              {/* Progress Summary Gauge */}
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="text-right">
                  <div className="text-[10.5px] text-slate-500 font-semibold">Tiến độ hôm nay</div>
                  <div className="text-[12px] font-extrabold text-emerald-800">
                    {completedTasks.length}/{totalCount} việc ({completedPercent}%)
                  </div>
                </div>
                <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${completedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 border-t border-slate-200/60 pt-2.5 overflow-x-auto text-xs">
              <button
                onClick={() => setTaskFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  taskFilter === 'PENDING'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Cần xử lý ({pendingCount})
              </button>
              <button
                onClick={() => setTaskFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  taskFilter === 'CRITICAL'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Khẩn cấp ({criticalTasks.length})
              </button>
              <button
                onClick={() => setTaskFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  taskFilter === 'COMPLETED'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Đã giải quyết ({completedTasks.length})
              </button>
              <button
                onClick={() => setTaskFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  taskFilter === 'ALL'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Tất cả ({totalCount})
              </button>
            </div>
          </div>

          {/* Task List Content */}
          <div className="p-4 space-y-3.5 flex-1 max-h-[520px] overflow-y-auto">
            {displayTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">Tuyệt vời! Không còn việc tồn đọng</p>
                <p className="text-xs text-slate-500">Mọi hồ sơ, phiếu kho và giao dịch đều đã được giải quyết dứt điểm.</p>
                <button
                  onClick={resetDefaultTasks}
                  className="mt-2 text-xs text-emerald-700 hover:underline font-bold inline-block cursor-pointer"
                >
                  Tải lại danh sách việc mẫu để kiểm thử &rarr;
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {displayTasks.map((t) => {
                  const isDone = t.status === 'COMPLETED';

                  return (
                    <li
                      key={t.id}
                      className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                        isDone
                          ? 'bg-slate-50/70 border-slate-200 opacity-80'
                          : t.priority === 'CRITICAL'
                          ? 'bg-rose-50/60 border-rose-200/90 hover:border-rose-300'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-50/60 border-amber-200/90 hover:border-amber-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Header of Task */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isDone ? (
                            <span className="pill-badge pill-green text-[10px]">Đã giải quyết</span>
                          ) : (
                            <span
                              className={`pill-badge text-[10px] ${
                                t.priority === 'CRITICAL'
                                  ? 'pill-red'
                                  : t.priority === 'HIGH'
                                  ? 'pill-amber'
                                  : 'pill-blue'
                              }`}
                            >
                              {t.priorityLabel}
                            </span>
                          )}
                          <strong
                            className={`text-[13px] font-extrabold ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {t.title}
                          </strong>
                        </div>
                        <span className="text-[10.5px] text-slate-400 shrink-0 font-medium">
                          {t.timeAgo}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        {t.description}
                      </p>

                      {/* Resolution Note if Done */}
                      {isDone && t.resolutionNote && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11.5px] text-emerald-900 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{t.resolutionNote}</span>
                        </div>
                      )}

                      {/* Due & Action Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-semibold text-slate-500">📍 {t.categoryLabel}</span>
                          {!isDone && (
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${
                                t.isOverdue ? 'text-rose-700 animate-pulse' : 'text-amber-800'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {t.dueLabel}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {!isDone && (
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            {/* Snooze 24h Button */}
                            <button
                              onClick={() => snoozeTask(t.id)}
                              title="Nhắc lại vào ngày mai"
                              className="px-2 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Nhắc lại sau
                            </button>

                            {/* Mark as Done directly */}
                            <button
                              onClick={() => completeTask(t.id, 'Đã hoàn tất kiểm tra.')}
                              title="Đánh dấu đã hoàn thành"
                              className="px-2 py-1 text-emerald-700 hover:bg-emerald-100/70 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Đã xong ✓
                            </button>

                            {/* Primary Action Button */}
                            {t.quickAction ? (
                              <button
                                onClick={() => handleQuickAction(t)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                {t.actionLabel} &rarr;
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(t.link)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                {t.actionLabel} &rarr;
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Modal */}
      <QuickActionTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={activeTask}
        onComplete={(id, note) => {
          completeTask(id, note);
        }}
      />
    </div>
  );
};

