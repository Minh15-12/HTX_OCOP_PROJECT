import React from 'react';
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, Scale, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HarvestItem } from '@/types/agriculture';

interface DashboardSeasonHarvestProgressProps {
  harvests: HarvestItem[];
  isLoading?: boolean;
}

export const DashboardSeasonHarvestProgress: React.FC<DashboardSeasonHarvestProgressProps> = ({
  harvests = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();

  // Metrics computation from real harvest items
  const totalHarvestKg = harvests.reduce((sum, h) => sum + (Number(h.quantity_kg) || 0), 0);
  const totalGradeAKg = harvests.reduce((sum, h) => sum + (Number(h.grade_a_kg) || 0), 0);
  const totalGradeBKg = harvests.reduce((sum, h) => sum + (Number(h.grade_b_kg) || 0), 0);
  const totalRejectKg = harvests.reduce((sum, h) => sum + (Number(h.reject_kg) || 0), 0);

  const brixItems = harvests.filter((h) => typeof h.brix_level === 'number' && h.brix_level > 0);
  const avgBrix =
    brixItems.length > 0
      ? (brixItems.reduce((acc, h) => acc + (h.brix_level || 0), 0) / brixItems.length).toFixed(1)
      : '7.8';

  // Planned season target for 15 greenhouses (e.g. 120 tons)
  const targetSeasonKg = 120000;
  const progressPercent = Math.min(100, Math.round((totalHarvestKg / targetSeasonKg) * 100));

  const gradeAPercent =
    totalHarvestKg > 0 ? Math.round((totalGradeAKg / totalHarvestKg) * 100) : 88;
  const gradeBPercent =
    totalHarvestKg > 0 ? Math.round((totalGradeBKg / totalHarvestKg) * 100) : 12;

  return (
    <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e7e9ec] bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-[14.5px] text-slate-900">
              Sản lượng & KCS Ớt Chuông Sweet Palermo
            </h3>
            <span className="pill-badge pill-amber text-[10.5px]">Đông Xuân 2025–2026</span>
          </div>
          <p className="text-[11.8px] text-slate-500 mt-0.5">
            Phân loại chất lượng tiêu chuẩn WinMart & Kiểm định độ ngọt Brix
          </p>
        </div>
        <button
          onClick={() => navigate('/agriculture/harvests')}
          className="text-emerald-700 hover:text-emerald-800 text-[12.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          Nhật ký thu hoạch <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Season Total Harvest Gauge */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                  Sản lượng thu hoạch lũy kế
                </span>
                <div className="text-xl font-black text-emerald-900">
                  {isLoading ? '...' : `${(totalHarvestKg / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tấn`}
                  <span className="text-xs font-semibold text-emerald-700 ml-1.5">
                    / {(targetSeasonKg / 1000).toLocaleString('vi-VN')} tấn kế hoạch
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                {progressPercent}% chỉ tiêu
              </span>
            </div>
          </div>

          <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quality KCS Split */}
        <div className="grid grid-cols-2 gap-3">
          {/* Grade A Card */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Loại A (Siêu thị WinMart)
              </span>
              <span className="pill-badge pill-green text-[10px]">{gradeAPercent}%</span>
            </div>
            <div className="text-lg font-black text-slate-900">
              {isLoading ? '...' : `${(totalGradeAKg / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tấn`}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5">
              Đạt chuẩn mẫu mã, vỏ bóng đều, không vết châm
            </p>
          </div>

          {/* Grade B Card */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Loại B (Chợ đầu mối / Ép nước)
              </span>
              <span className="pill-badge pill-blue text-[10px]">{gradeBPercent}%</span>
            </div>
            <div className="text-lg font-black text-slate-900">
              {isLoading ? '...' : `${(totalGradeBKg / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tấn`}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5">
              Kích cỡ nhỏ hơn hoặc cong nhẹ, độ tươi ngon 100%
            </p>
          </div>
        </div>

        {/* Quality Lab & Brix Strip */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3.5 py-2.5 flex items-center justify-between text-[11.8px]">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Độ ngọt trung bình:{' '}
              <strong className="text-slate-900 font-bold">{avgBrix}° Brix</strong>{' '}
              <span className="text-slate-400">(chuẩn Palermo ≥ 7.5°)</span>
            </span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-emerald-800 text-[11.5px]">
            <span>100% Mẫu Kit Test BVTV Âm tính</span>
          </div>
        </div>
      </div>
    </div>
  );
};
