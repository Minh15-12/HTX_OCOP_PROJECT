import React from 'react';
import { NavLink } from 'react-router-dom';
import { navigationConfig } from '@/router/navigation';
import { cn } from '@/utils/cn';
import { Sprout, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#053725] text-slate-100 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 border-r border-emerald-950 overflow-y-auto z-20 shadow-md">
      <div className="p-3.5 flex flex-col gap-4">
        {/* Brand Header (Matching Image 1 & Image 2) */}
        <div className="flex items-center gap-3 px-2 py-2 pb-3 border-b border-emerald-800/60">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 shadow-xs border border-emerald-400/30">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-extrabold text-[12.5px] text-white leading-tight tracking-tight uppercase">
              HTX NÔNG NGHIỆP
            </div>
            <div className="font-black text-[12px] text-emerald-300 leading-tight uppercase">
              XANH PHÚ THỊNH
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        {navigationConfig.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <h4 className="px-2 text-[10px] font-black tracking-wider text-emerald-300/70 uppercase">
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
                        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150 group relative',
                        isActive
                          ? 'bg-[#0d6b46] text-white font-extrabold shadow-sm border border-emerald-500/30'
                          : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full" />
                        )}
                        {Icon && (
                          <Icon className={cn(
                            "w-4 h-4 shrink-0 transition-all",
                            isActive ? "text-emerald-300 opacity-100 scale-110" : "text-emerald-200/70 group-hover:text-emerald-200"
                          )} />
                        )}
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              'pill-badge ml-auto text-[10px] px-2 py-0.5 font-black border',
                              item.badge.color === 'red' && 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                              item.badge.color === 'green' && 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
                              item.badge.color === 'amber' && 'bg-amber-400/20 text-amber-300 border-amber-400/30',
                              item.badge.color === 'blue' && 'bg-sky-400/20 text-sky-300 border-sky-400/30'
                            )}
                          >
                            {item.badge.text}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Footer Quick Settings Link */}
        <div className="mt-auto pt-3 border-t border-emerald-800/60">
          <NavLink
            to="/system/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-extrabold transition-all duration-150 border',
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-200 border-emerald-800/50 hover:bg-emerald-900 hover:text-white'
              )
            }
          >
            <Settings className="w-4.5 h-4.5 shrink-0 text-emerald-300" />
            <span className="truncate flex-1">Cài đặt hệ thống</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
