import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sprout, Award } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Brand Gradient Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cop-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cop-700 to-cop-500 text-white shadow-xl shadow-cop-900/50 mb-4 border border-cop-400/30">
            <Sprout className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Hệ Thống Quản Lý HTX & OCOP
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Nền tảng số hóa nông nghiệp & phân hạng OCOP quốc gia</span>
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
          <Outlet />
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2026 HTX OCOP Project. All rights reserved.
        </p>
      </div>
    </div>
  );
};
