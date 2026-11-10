import React, { useState } from 'react';
import {
  Wheat,
  Plus,
  Search,
  Scale,
  Award,
  ShieldCheck,
  Calendar,
  Layers,
  Printer,
  CheckCircle2,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import type { HarvestItem } from '@/types/agriculture';
import type { CropSeason } from '@/services/cropSeasonApi';

interface HarvestStagesTabProps {
  harvests: HarvestItem[];
  season?: CropSeason;
  onAddHarvest: () => void;
  onViewDetail: (harvest: HarvestItem) => void;
  onPrintSlip: (harvest: HarvestItem) => void;
  isReadOnly?: boolean;
}

export const HarvestStagesTab: React.FC<HarvestStagesTabProps> = ({
  harvests,
  season,
  onAddHarvest,
  onViewDetail,
  onPrintSlip,
  isReadOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Tính toán số liệu thống kê sản lượng
  const quotaKg = season?.puc_quota_kg ? Number(season.puc_quota_kg) : 25000;
  const totalHarvestedKg = harvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0);
  const totalGradeAKg = harvests.reduce((sum, h) => sum + (h.grade_a_kg || (h.quality_grade === 'GRADE_A' ? h.quantity_kg : 0)), 0);
  const totalGradeBKg = harvests.reduce((sum, h) => sum + (h.grade_b_kg || (h.quality_grade === 'GRADE_B' ? h.quantity_kg : 0)), 0);
  const totalRejectKg = harvests.reduce((sum, h) => sum + (h.reject_kg || 0), 0);

  const percentProgress = Math.min(100, Math.round((totalHarvestedKg / Math.max(1, quotaKg)) * 100));

  const filteredHarvests = harvests.filter((h) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchCode = h.harvest_code?.toLowerCase().includes(term);
    const matchLot = h.lot_code?.toLowerCase().includes(term);
    const matchPlot = h.plot_code?.toLowerCase().includes(term);
    return matchCode || matchLot || matchPlot;
  });

  return (
    <div className="space-y-5">
      {/* Thanh Tiến Độ Sản Lượng & Giám Sát Trần PUC Quota */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-800 text-base">Hạn Mức Sản Lượng Vùng Trồng (PUC Quota)</h4>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Mã: VN-LDO-PUC-0128
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chống gian lận thương mại & ngăn chặn trà trộn nông sản ngoài vùng trồng
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Lũy kế thu hoạch / Trần PUC:</span>
            <p className="font-mono text-lg font-bold text-slate-800">
              {totalHarvestedKg.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ {quotaKg.toLocaleString()} kg</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all duration-500"
              style={{ width: `${percentProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tiến độ thu hoạch rải vụ: <strong className="text-emerald-700">{percentProgress}%</strong></span>
            <span>Còn lại: <strong className="text-slate-700">{Math.max(0, quotaKg - totalHarvestedKg).toLocaleString()} kg</strong></span>
          </div>
        </div>

        {/* Mini Stats Breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <p className="text-emerald-700 font-medium">Thương phẩm Loại 1 (Xuất khẩu)</p>
            <p className="text-base font-bold text-emerald-900 mt-0.5">{totalGradeAKg.toLocaleString()} kg</p>
          </div>
          <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
            <p className="text-blue-700 font-medium">Thương phẩm Loại 2 (Nội địa)</p>
            <p className="text-base font-bold text-blue-900 mt-0.5">{totalGradeBKg.toLocaleString()} kg</p>
          </div>
          <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
            <p className="text-rose-700 font-medium">Hàng loại bỏ / dập vỡ</p>
            <p className="text-base font-bold text-rose-900 mt-0.5">{totalRejectKg.toLocaleString()} kg</p>
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đợt, mã lô GS1, thửa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {!isReadOnly && (
          <button
            onClick={onAddHarvest}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo Phiếu Cân Đợt Thu Hoạch
          </button>
        )}
      </div>

      {/* Bảng Danh Sách Các Đợt Thu Hoạch Rải Vụ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Đợt hái</th>
                <th className="py-3 px-4">Ngày thu</th>
                <th className="py-3 px-4">Thửa hái</th>
                <th className="py-3 px-4">Minh chứng An toàn PHI</th>
                <th className="py-3 px-4 text-right">Sản lượng Loại 1 / 2</th>
                <th className="py-3 px-4 text-right">Tổng Cân (kg)</th>
                <th className="py-3 px-4">Mã Lô GS1 & Phiếu Cân</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHarvests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Wheat className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Chưa có đợt thu hoạch nào được ghi nhận</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Tạo Phiếu Cân Đợt Thu Hoạch" để ghi nhận đợt hái đầu tiên</p>
                  </td>
                </tr>
              ) : (
                filteredHarvests.map((h, idx) => (
                  <tr
                    key={h.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                        Đợt {idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {h.harvest_date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      Thửa {h.plot_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã cách ly 12 ngày (Yêu cầu: 3 ngày)</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Hoạt chất gần nhất: Spinetoram
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-xs">
                      <span className="font-semibold text-emerald-700">L1: {(h.grade_a_kg || (h.quality_grade === 'GRADE_A' ? h.quantity_kg : 0)).toLocaleString()} kg</span>
                      <span className="text-slate-400 mx-1">|</span>
                      <span className="text-blue-700">L2: {(h.grade_b_kg || (h.quality_grade === 'GRADE_B' ? h.quantity_kg : 0)).toLocaleString()} kg</span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {h.quantity_kg.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">kg</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs space-y-0.5">
                        <p className="font-mono font-semibold text-indigo-700 truncate max-w-[180px]">
                          {h.lot_code || `VN-LDO-${h.plot_code}-2603`}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Phiếu cân: PC-SK-{idx + 101}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onPrintSlip(h)}
                          title="In Phiếu Cân Sân Kho"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewDetail(h)}
                          title="Xem Chi Tiết & Tem GS1"
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
