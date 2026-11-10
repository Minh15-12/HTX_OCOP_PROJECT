import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CropSeason, fetchSeasonSupplyDemand, SupplyDemandBalance } from '@/services/cropSeasonApi';
import { DataFieldRow } from '@/components/common/DataFieldRow';
import { formatDate } from '@/utils/formatters';
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Building2,
  FileCheck,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';

interface CropSeasonTabOverviewProps {
  season: CropSeason;
  onOpenPrintModal?: () => void;
}

const DEFAULT_STAGES = [
  {
    stage: 1,
    name: '1. Ươm cây con & Bén rễ',
    range: 'Ngày 1 - 30',
    minDay: 1,
    maxDay: 30,
    desc: 'Gieo hạt, kích thích hệ rễ, tưới EC 1.2 mS/cm, phòng trừ lở cổ rễ.',
    badgeCls: 'bg-emerald-100 text-emerald-800',
  },
  {
    stage: 2,
    name: '2. Sinh dưỡng thân lá & Tạo tán',
    range: 'Ngày 31 - 75',
    minDay: 31,
    maxDay: 75,
    desc: 'Tỉa cành tạo tán chữ Y, giăng dây đỡ, tăng đạm & lân, EC 1.8 - 2.0 mS/cm.',
    badgeCls: 'bg-teal-100 text-teal-800',
  },
  {
    stage: 3,
    name: '3. Ra hoa & Đậu quả lớn',
    range: 'Ngày 76 - 105',
    minDay: 76,
    maxDay: 105,
    desc: 'Bổ sung Canxi-Bo chống nứt trái, bón Kali tăng độ ngọt Brix ≥ 7°, thả thiên địch Orius.',
    badgeCls: 'bg-amber-100 text-amber-800',
  },
  {
    stage: 4,
    name: '4. Thu hoạch rộ định kỳ & Kiểm soát PHI',
    range: 'Ngày 106 - 300',
    minDay: 106,
    maxDay: 300,
    desc: 'Cắt trái định kỳ 5 - 7 ngày/lần, kiểm tra dư lượng thuốc BVTV và cách ly PHI trước ngày hái.',
    badgeCls: 'bg-blue-100 text-blue-800',
  },
];

export const CropSeasonTabOverview: React.FC<CropSeasonTabOverviewProps> = ({ season, onOpenPrintModal }) => {
  const startDate = new Date(season.start_date);
  const endDate = new Date(season.expected_end_date);
  const actualEndDate = season.actual_end_date ? new Date(season.actual_end_date) : null;
  const now = new Date();

  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const isCompleted = season.status === 'COMPLETED';
  const isPastExpected = now.getTime() >= endDate.getTime();

  // Tuổi cây nông học thực tế:
  // 1. Nếu vụ đã hoàn tất hoặc có ngày kết thúc thực tế: chốt tuổi cây tại thời điểm kết thúc vụ
  // 2. Nếu vụ đã quá hạn dự kiến: chốt ở thời hạn tối đa của vụ (không để ngày tăng tràn vô hạn)
  // 3. Nếu vụ đang diễn ra: tính số ngày sinh trưởng thực tế từ lúc xuống giống
  let currentAgeDays: number;
  if (actualEndDate && !Number.isNaN(actualEndDate.getTime())) {
    const actualElapsed = Math.ceil((actualEndDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    currentAgeDays = Math.max(1, Math.min(totalDays, actualElapsed));
  } else if (isCompleted || isPastExpected) {
    currentAgeDays = totalDays;
  } else {
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    currentAgeDays = Math.max(1, Math.min(totalDays, daysElapsed));
  }

  // Xác định giai đoạn hiện tại
  let currentStageIndex = 0;
  if (currentAgeDays > 105) {
    currentStageIndex = 3;
  } else if (currentAgeDays > 75) {
    currentStageIndex = 2;
  } else if (currentAgeDays > 30) {
    currentStageIndex = 1;
  }

  // Lấy dữ liệu cân đối cung cầu hợp đồng bao tiêu
  const { data: balance } = useQuery<SupplyDemandBalance>({
    queryKey: ['seasonSupplyDemand', season.id],
    queryFn: () => fetchSeasonSupplyDemand(season.id),
    enabled: !!season.id,
  });

  const handlePrintProtocol = () => {
    if (onOpenPrintModal) {
      onOpenPrintModal();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. THẺ CÂN ĐỐI HỢP ĐỒNG BAO TIÊU (SUPPLY-DEMAND BALANCE) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Cân đối Hợp đồng Bao tiêu &amp; Hạn mức PUC OCOP
            </span>
          </div>

          {balance?.anomaly_high_yield ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Cảnh báo: Sản lượng vượt 125% mức cam kết (Nghi vấn ngoài vùng)
            </span>
          ) : balance?.is_shortage ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Thiếu hụt sản lượng cam kết ({Math.abs(balance.commitment_gap_kg).toLocaleString()} kg)
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Đảm bảo nguồn cung ứng hợp đồng siêu thị
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Đối tác &amp; Mã đóng gói PHC</span>
            <div className="font-bold text-white text-sm">
              {balance?.buyer_name || season.buyer_contract_info?.buyer_name || 'Chưa thiết lập hợp đồng'}
            </div>
            <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">
              Mã PHC: {balance?.phc_code || season.buyer_contract_info?.phc_code || '—'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Hợp đồng Siêu thị vs Cam kết Xã viên</span>
            <div className="font-mono text-sm font-bold text-white">
              HĐ: {Number(balance?.buyer_contract_quantity_kg || season.puc_quota_kg || 0).toLocaleString()} kg
            </div>
            <span className="text-[11px] font-mono text-teal-300 block mt-0.5">
              Xã viên ký: {Number(balance?.total_committed_quantity_kg || 0).toLocaleString()} kg ({balance?.commitment_coverage_percent || 0}%)
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
              <span>Tiến độ giao nộp thực tế</span>
              <span className="font-bold font-mono text-emerald-400">
                {balance?.fulfillment_rate_percent || 0}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, balance?.fulfillment_rate_percent || 0)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-300 block mt-1">
              Đã thu: {Number(balance?.total_actual_harvested_kg || 0).toLocaleString()} kg
            </span>
          </div>
        </div>
      </div>

      {/* 2. BỘ ĐẾM 4 GIAI ĐOẠN SINH TRƯỞNG VIETGAP (CROP STAGES TRACKER) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Phác đồ Sinh trưởng 4 Giai đoạn VietGAP (300 Ngày)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
              {isCompleted
                ? `Tuổi cây khi thu hoạch: ${currentAgeDays}/${totalDays} ngày`
                : isPastExpected
                ? `Tuổi cây: ${currentAgeDays}/${totalDays} ngày (Hết chu kỳ vụ)`
                : `Tuổi cây: ${currentAgeDays}/${totalDays} ngày`}
            </span>
            <button
              type="button"
              onClick={handlePrintProtocol}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              title="In phác đồ kỹ thuật cho xã viên"
            >
              <Printer className="w-3.5 h-3.5" />
              In phác đồ
            </button>
          </div>
        </div>

        {/* 4 Stages Horizontal Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {DEFAULT_STAGES.map((st, idx) => {
            const isCurrent = idx === currentStageIndex && !isCompleted && !isPastExpected;
            const isPassed = isCompleted || isPastExpected || idx < currentStageIndex;

            return (
              <div
                key={st.stage}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                    : isPassed
                    ? 'border-slate-200 bg-slate-50 text-slate-700'
                    : 'border-slate-200/60 bg-white text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.badgeCls}`}>
                    {st.range}
                  </span>
                  {isCurrent && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                    </span>
                  )}
                  {isPassed && !isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-700">✓ Đã qua</span>
                  )}
                </div>

                <div className="font-bold text-xs text-slate-900 mb-1">
                  {st.name}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CARD: THÔNG TIN QUY HOẠCH CHI TIẾT */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Thông tin quy hoạch sản xuất</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Mã vùng: {season.unit_code || season.production_unit_id}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow label="Tên mùa vụ" value={season.name} highlight />
          <DataFieldRow label="Cây trồng / Giống cây" value={season.crop} highlight />
          <DataFieldRow
            label="Vùng sản xuất liên kết"
            value={season.unit_name || season.production_unit_id}
          />
          <DataFieldRow
            label="Mã vùng cấp phép (PUC)"
            value={season.unit_code || 'Chưa cấp mã PUC'}
            isMono
          />
          <DataFieldRow
            label="Nguồn gốc hạt giống F1"
            value={season.seed_supplier || '—'}
          />
          <DataFieldRow
            label="Hạn mức cấp phép PUC"
            value={season.puc_quota_kg ? `${Number(season.puc_quota_kg).toLocaleString()} kg` : 'Theo năng suất sinh học'}
            isMono
          />
          <DataFieldRow
            label="Trạng thái sổ nhật ký"
            value={
              season.logbook_status === 'FROZEN_ARCHIVED'
                ? 'Đã khóa sổ đóng băng (Merkle SHA-256)'
                : 'Đang mở ghi chép nhật ký VietGAP'
            }
          />
          <DataFieldRow
            label="Trạng thái chu kỳ"
            value={
              season.status === 'ACTIVE'
                ? 'Đang chăm sóc tích cực'
                : season.status === 'HARVESTING'
                ? 'Đang trong giai đoạn thu hoạch rộ 🍇'
                : season.status === 'COMPLETED'
                ? 'Đã hoàn tất vụ mùa'
                : season.status
            }
          />
        </div>
      </div>

      {/* 4. CARD: THỜI GIAN BIỂU */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100">
          Thời gian biểu &amp; Chu kỳ sinh trưởng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Ngày bắt đầu xuống giống"
            value={formatDate(season.start_date)}
            isMono
          />
          <DataFieldRow
            label="Ngày dự kiến kết thúc vụ"
            value={formatDate(season.expected_end_date)}
            isMono
          />
          <DataFieldRow
            label="Thời gian sinh trưởng kế hoạch"
            value={`${totalDays} ngày (~ ${(totalDays / 30).toFixed(1)} tháng)`}
            isMono
            highlight
          />
          <DataFieldRow
            label="Ngày kết thúc thực tế"
            value={season.actual_end_date ? formatDate(season.actual_end_date) : 'Đang diễn ra'}
            isMono
          />
        </div>
      </div>
    </div>
  );
};
