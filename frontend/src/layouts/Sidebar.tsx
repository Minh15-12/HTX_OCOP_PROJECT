import React from 'react';
import { NavLink } from 'react-router-dom';
import { navigationConfig } from '@/router/navigation';
import { cn } from '@/utils/cn';
import { Sprout, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 border-r border-[#e7e9ec] overflow-y-auto z-20">
      <div className="p-4 flex flex-col gap-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-[#eafaf0] text-[#16a34a] flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-[13.5px] text-[#15803d] leading-tight tracking-tight uppercase">
              HTX NÔNG NGHIỆP
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">Hệ thống Số hóa OCOP</div>
          </div>
        </div>

        {/* Navigation Groups */}
        {navigationConfig.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <h4 className="px-2 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
              {group.groupTitle}
            </h4>
            <nav className="flex flex-col gap-0.5 mt-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group',
                        isActive
                          ? 'bg-[#eafaf0] text-[#15803d] font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      )
                    }
                  >
                    {Icon && (
                      <Icon className="w-4 h-4 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity" />
                    )}
                    <span className="truncate flex-1">{item.title}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'pill-badge ml-auto text-[10.5px] px-2 py-0.5 font-bold',
                          item.badge.color === 'red' && 'pill-red',
                          item.badge.color === 'green' && 'pill-green',
                          item.badge.color === 'amber' && 'pill-amber',
                          item.badge.color === 'blue' && 'pill-blue'
                        )}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
        {/* Footer Quick Settings Link (Matching User Mockup) */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <NavLink
            to="/system/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-150',
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              )
            }
          >
            <Settings className="w-4.5 h-4.5 shrink-0" />
            <span className="truncate flex-1">Cài đặt hệ thống</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
