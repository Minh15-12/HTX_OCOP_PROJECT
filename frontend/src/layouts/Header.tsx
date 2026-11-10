import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, HelpCircle, LogOut, ChevronDown, Calendar, Check, ArrowRight, Wallet, FileText, Sprout, Users, AlertCircle, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { useTaskNotificationStore } from '@/stores/taskNotificationStore';
import { useCropSeasonContextStore } from '@/stores/cropSeasonContextStore';
import { CommandPaletteModal } from './CommandPaletteModal';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { selectedSeasonId, setSelectedSeasonId } = useCropSeasonContextStore();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const {
    tasks,
    pendingTasks,
    completedTasks,
    pendingCount,
    completeTask,
    markAllAsRead,
  } = useTaskNotificationStore();

  const queryClient = useQueryClient();
  const { data: serverNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(20),
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'notifs'>('all');

  const displayRole = useMemo(() => {
    const r = user?.roles?.[0];
    if (!r) return 'Quản trị viên';
    if (typeof r === 'string') {
      const roleMap: Record<string, string> = {
        'SYSTEM_ADMIN': 'Quản trị hệ thống',
        'HTX_OWNER': 'Chủ tịch HTX',
        'HTX_STAFF': 'Nhân viên HTX',
        'HTX_MEMBER': 'Xã viên HTX',
        'AGRICULTURE_OFFICER': 'Cán bộ kỹ thuật',
        'STOREKEEPER': 'Thủ kho HTX',
        'ACCOUNTANT': 'Kế toán HTX',
      };
      return roleMap[r] || r;
    }
    return (r as any).display_name || (r as any).name || 'Quản trị viên';
  }, [user]);

  const serverNotificationItems = (serverNotifs?.data || []).map((sn) => {
    let icon = <Bell className="w-4 h-4 text-blue-500" />;
    let iconBg = 'bg-blue-50';
    let badge = 'Hệ thống';
    let badgeClass = 'bg-blue-100 text-blue-800';
    let link = '/dashboard';

    const typeStr = (sn.type || '').toLowerCase();
    if (typeStr.includes('stock') || typeStr.includes('inventory')) {
      icon = <AlertCircle className="w-4 h-4 text-amber-600" />;
      iconBg = 'bg-amber-50';
      badge = 'Kho vật tư';
      badgeClass = 'bg-amber-100 text-amber-800';
      link = '/inventory/materials';
    } else if (typeStr.includes('ocop') || typeStr.includes('certificate')) {
      icon = <FileText className="w-4 h-4 text-purple-600" />;
      iconBg = 'bg-purple-50';
      badge = 'Hạn OCOP';
      badgeClass = 'bg-purple-100 text-purple-800';
      link = '/ocop/dossiers';
    } else if (typeStr.includes('capital') || typeStr.includes('finance')) {
      icon = <Wallet className="w-4 h-4 text-rose-600" />;
      iconBg = 'bg-rose-50';
      badge = 'Vốn góp';
      badgeClass = 'bg-rose-100 text-rose-800';
      link = '/members';
    } else if (typeStr.includes('security') || typeStr.includes('audit')) {
      icon = <AlertCircle className="w-4 h-4 text-rose-600" />;
      iconBg = 'bg-rose-50';
      badge = 'Cảnh báo';
      badgeClass = 'bg-rose-100 text-rose-800';
      link = '/audit';
    }

    const timeAgo = sn.created_at
      ? new Date(sn.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(sn.created_at).toLocaleDateString('vi-VN')
      : 'Vừa xong';

    return {
      id: sn.id,
      title: sn.title,
      desc: sn.message,
      time: timeAgo,
      type: 'notifs' as const,
      badge,
      badgeClass,
      icon,
      iconBg,
      link,
      status: (sn.read ? 'COMPLETED' : 'PENDING') as 'PENDING' | 'COMPLETED',
      isServer: true,
    };
  });

  const localNotifications = tasks.map((t) => {
    let icon = <FileText className="w-4 h-4 text-blue-500" />;
    let iconBg = 'bg-blue-50';
    if (t.category === 'FINANCE') {
      icon = <Wallet className="w-4 h-4 text-emerald-600" />;
      iconBg = 'bg-emerald-50';
    } else if (t.category === 'MEMBER') {
      icon = <Users className="w-4 h-4 text-purple-600" />;
      iconBg = 'bg-purple-50';
    } else if (t.category === 'INVENTORY') {
      icon = <AlertCircle className="w-4 h-4 text-amber-600" />;
      iconBg = 'bg-amber-50';
    } else if (t.category === 'AGRICULTURE') {
      icon = <Sprout className="w-4 h-4 text-emerald-600" />;
      iconBg = 'bg-emerald-50';
    }

    return {
      id: t.id,
      title: t.title,
      desc: t.description,
      time: t.timeAgo,
      type: (t.priority === 'INFO' ? 'notifs' : 'tasks') as 'tasks' | 'notifs',
      badge: t.priorityLabel,
      badgeClass:
        t.priority === 'CRITICAL'
          ? 'bg-rose-100 text-rose-800'
          : t.priority === 'HIGH'
          ? 'bg-amber-100 text-amber-800'
          : 'bg-blue-100 text-blue-800',
      icon,
      iconBg,
      link: t.link,
      status: (t.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING') as 'PENDING' | 'COMPLETED',
      isServer: false,
    };
  });

  const allNotifications = [...serverNotificationItems, ...localNotifications];
  const totalPending = allNotifications.filter((n) => n.status === 'PENDING').length;
  const totalTasks = allNotifications.filter((n) => n.type === 'tasks' && n.status === 'PENDING').length;
  const totalCompleted = allNotifications.filter((n) => n.status === 'COMPLETED').length;

  const liveUnreadCount = (serverNotifs?.unread_count ?? 0) + pendingCount;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifs = allNotifications.filter((n) => {
    if (activeTab === 'tasks') return n.type === 'tasks' && n.status === 'PENDING';
    if (activeTab === 'notifs') return n.status === 'COMPLETED';
    return n.status === 'PENDING';
  });

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      // Ignore
    }
    markAllAsRead();
  };

  const handleItemClick = async (item: (typeof allNotifications)[0]) => {
    if (item.isServer) {
      try {
        await notificationService.markAsRead(item.id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (e) {
        console.error('Error marking server notification as read:', e);
      }
    } else {
      completeTask(item.id, 'Đã mở xem từ thông báo nhanh Header.');
    }
    setNotificationOpen(false);
    navigate(item.link);
  };

  const handleCompleteItem = async (e: React.MouseEvent, item: (typeof allNotifications)[0]) => {
    e.stopPropagation();
    if (item.isServer) {
      try {
        await notificationService.markAsRead(item.id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (e) {
        console.error('Error marking server notification as read:', e);
      }
    } else {
      completeTask(item.id, 'Đã hoàn thành từ thông báo nhanh Header.');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-white border-b border-[#e7e9ec] px-4 sm:px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div
          onClick={() => setIsSearchModalOpen(true)}
          className="relative w-full cursor-pointer group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            readOnly
            placeholder="Tìm kiếm nhanh xã viên, vùng trồng, OCOP... (Ctrl + K)"
            className="w-full pl-9 pr-14 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12.8px] text-slate-700 placeholder-slate-400 group-hover:border-emerald-400 group-hover:bg-white focus:outline-none cursor-pointer transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Season Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50/60 border border-emerald-200/80 rounded-lg px-2.5 py-1">
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
          <select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="bg-transparent border-none text-[12.5px] font-semibold text-emerald-900 focus:outline-none cursor-pointer p-0"
          >
            <option value="dx2025">Mùa vụ: Đông Xuân 2025–2026 (Đang diễn ra)</option>
            <option value="ht2025">Mùa vụ: Hè Thu 2025 (Đã kết thúc)</option>
            <option value="td2025">Mùa vụ: Thu Đông 2025 (Đã kết thúc)</option>
            <option value="all">Tất cả mùa vụ</option>
          </select>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${
              notificationOpen ? 'bg-slate-100 text-emerald-700' : ''
            }`}
            title="Thông báo hệ thống & Nhắc việc"
          >
            <Bell className="w-4.5 h-4.5" />
            {liveUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold text-[9.5px] rounded-full px-1.5 py-0.2 min-w-[16px] text-center leading-normal shadow-xs animate-pulse">
                {liveUnreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown (Hình 2 Match) */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in text-slate-800">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-700" />
                  <h3 className="font-extrabold text-[13.5px] text-slate-900">Thông báo & Nhắc việc</h3>
                  {liveUnreadCount > 0 && (
                    <span className="bg-rose-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-full">
                      {liveUnreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11.5px] text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-slate-100 px-3 text-[12px] font-bold bg-white">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'all' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cần xử lý ({totalPending})
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'tasks' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tác vụ ({totalTasks})
                </button>
                <button
                  onClick={() => setActiveTab('notifs')}
                  className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'notifs' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đã xong ({totalCompleted})
                </button>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifs.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Đã hoàn thành mọi việc!</p>
                    <p className="text-[11px] text-slate-400">Không còn thông báo hay nhắc việc cần xử lý.</p>
                  </div>
                ) : (
                  filteredNotifs.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-[12px] font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                            {item.title}
                          </h4>
                          <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${item.badgeClass}`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.time}
                          </span>
                          {item.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={(e) => handleCompleteItem(e, item)}
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-md transition-colors cursor-pointer"
                              title="Đánh dấu hoàn thành việc này"
                            >
                              Xong ✓
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => {
                    setNotificationOpen(false);
                    navigate('/dashboard');
                  }}
                  className="text-[12px] font-bold text-slate-700 hover:text-emerald-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Vào Bàn làm việc xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Circle */}
        <button
          className="w-7 h-7 rounded-full border border-slate-200 text-slate-500 text-[12px] font-bold flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
          title="Trợ giúp & Hướng dẫn"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Chip */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[12.5px] shrink-0 border border-blue-200">
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'NA'}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-[12.8px] font-bold text-slate-900">{user?.full_name || 'Nguyễn Văn A'}</p>
              <p className="text-[11px] text-slate-500">{displayRole}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[13px] font-bold text-slate-900">{user?.full_name || 'Nguyễn Văn A'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@htx.vn'}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setChangePasswordOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>Đổi mật khẩu</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/auth/login';
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <CommandPaletteModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </header>
  );
};

