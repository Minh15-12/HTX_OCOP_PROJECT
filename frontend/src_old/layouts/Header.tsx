import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, LogOut, ChevronDown, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('dx2025');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-white border-b border-[#e7e9ec] px-4 sm:px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm xã viên, vùng trồng, sản phẩm, hồ sơ OCOP..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12.8px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Season Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50/60 border border-emerald-200/80 rounded-lg px-2.5 py-1">
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-transparent border-none text-[12.5px] font-semibold text-emerald-900 focus:outline-none cursor-pointer p-0"
          >
            <option value="dx2025">Mùa vụ: Đông Xuân 2025–2026 (Đang diễn ra)</option>
            <option value="ht2025">Mùa vụ: Hè Thu 2025 (Đã kết thúc)</option>
            <option value="td2025">Mùa vụ: Thu Đông 2025 (Đã kết thúc)</option>
            <option value="all">Tất cả mùa vụ</option>
          </select>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Thông báo hệ thống"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[9.5px] rounded-full px-1.5 py-0.2 min-w-[16px] text-center leading-normal shadow-xs">
            3
          </span>
        </button>

        {/* Help Circle */}
        <button
          className="w-7 h-7 rounded-full border border-slate-200 text-slate-500 text-[12px] font-bold flex items-center justify-center hover:bg-slate-100 transition-colors"
          title="Trợ giúp & Hướng dẫn"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Chip */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[12.5px] shrink-0 border border-blue-200">
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'NA'}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-[12.8px] font-bold text-slate-900">{user?.full_name || 'Nguyễn Văn A'}</p>
              <p className="text-[11px] text-slate-500">{user?.roles?.[0]?.display_name || 'Quản trị viên'}</p>
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
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
