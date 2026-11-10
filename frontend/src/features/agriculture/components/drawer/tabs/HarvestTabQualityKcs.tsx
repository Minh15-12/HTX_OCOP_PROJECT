import React from 'react';
import type { HarvestItem } from '@/types/agriculture';
import { DataFieldRow } from '@/components/common/DataFieldRow';
import { formatDate, formatNumber } from '@/utils/formatters';
import { ShieldCheck, ShieldAlert, Award, FlaskConical, Scale } from 'lucide-react';

interface HarvestTabQualityKcsProps {
  harvest: HarvestItem;
}

export const HarvestTabQualityKcs: React.FC<HarvestTabQualityKcsProps> = ({ harvest }) => {
  const isGradeA = harvest.quality_grade === 'GRADE_A';
  const isGradeB = harvest.quality_grade === 'GRADE_B';
  const totalQty = Number(harvest.quantity_kg) || 0;
  const gradeAQty = Number(harvest.grade_a_kg) || 0;
  const gradeAPct = totalQty > 0 ? Math.round((gradeAQty / totalQty) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* CARD 1: THÔNG TIN CANH TÁC & NGUỒN GỐC */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" />
            Thông tin lệnh & Vùng canh tác
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Lệnh: {harvest.harvest_code}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow label="Mã lệnh thu hoạch" value={harvest.harvest_code} isMono highlight />
          <DataFieldRow label="Mã lô GS1 Quốc tế" value={harvest.lot_code} isMono />
          <DataFieldRow label="Thửa đất canh tác" value={`${harvest.plot_code} - ${harvest.plot_name}`} />
          <DataFieldRow label="Mùa vụ sản xuất" value={harvest.crop_season_name || 'Vụ Canh tác OCOP'} />
          <DataFieldRow label="Ngày thu hoạch thực tế" value={formatDate(harvest.harvest_date)} isMono />
          <DataFieldRow
            label="Trạng thái hồ sơ KCS"
            value={
              harvest.kcs_status === 'PASSED' ? (
                <span className="text-emerald-700 font-bold">Đã kiểm định (Passed)</span>
              ) : harvest.kcs_status === 'REJECTED' ? (
                <span className="text-rose-700 font-bold">Không đạt chuẩn</span>
              ) : (
                <span className="text-amber-800 font-bold">Chờ phúc tra</span>
              )
            }
          />
        </div>
      </div>

      {/* CARD 2: PHÂN LOẠI SẢN LƯỢNG & PHẨM CẤP */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" />
            Phân loại sản lượng theo phẩm cấp KCS
          </span>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
            Tỷ lệ Grade A: {gradeAPct}%
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Tổng sản lượng nhập xưởng"
            value={`${formatNumber(totalQty)} kg`}
            isMono
            highlight
          />
          <DataFieldRow
            label="Phẩm cấp chung kết luận"
            value={
              <span
                className={`font-bold ${
                  isGradeA ? 'text-emerald-700' : isGradeB ? 'text-amber-800' : 'text-rose-700'
                }`}
              >
                {isGradeA ? 'GRADE A (Thượng hạng)' : isGradeB ? 'GRADE B (Tiêu chuẩn)' : 'REJECT (Loại bỏ)'}
              </span>
            }
          />
          <DataFieldRow
            label="Hạng A (Xuất khẩu / OCOP 4-5 sao)"
            value={`${formatNumber(harvest.grade_a_kg || 0)} kg`}
            isMono
            highlight
          />
          <DataFieldRow
            label="Hạng B (Tiêu thụ nội địa / Siêu thị)"
            value={`${formatNumber(harvest.grade_b_kg || 0)} kg`}
            isMono
          />
          <DataFieldRow
            label="Hàng loại bỏ (Dập vỡ / Không đạt)"
            value={`${formatNumber(harvest.reject_kg || 0)} kg`}
            isMono
          />
          <DataFieldRow
            label="Quy chuẩn phân hạng"
            value="Quyết định 148/QĐ-TTg & TCVN"
          />
        </div>
      </div>

      {/* CARD 3: CHỈ SỐ KỸ THUẬT & CHẤT LƯỢNG */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100">
          Chỉ số kiểm nghiệm cảm quan & Sinh hóa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Độ ngọt Brix đo khúc xạ"
            value={harvest.brix_level != null ? `${harvest.brix_level}° Brix` : 'Chưa đo khúc xạ'}
            isMono
            highlight={harvest.brix_level != null}
          />
          <DataFieldRow
            label="Độ đồng đều quả theo kích cỡ"
            value={harvest.uniformity_rate != null ? `${harvest.uniformity_rate}%` : 'Chưa đánh giá'}
            isMono
          />
          <DataFieldRow
            label="Màu sắc trái chín"
            value="Đỏ tươi đồng nhất > 95% bề mặt quả"
          />
          <DataFieldRow
            label="Độ cứng và độ dày thịt vỏ"
            value="Vỏ dày > 6mm, giòn ngọt, không nứt nẻ"
          />
        </div>
      </div>

      {/* CARD 4: KIỂM SOÁT GATE PHI & TEST NHANH BVTV */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-rose-600" />
            Kiểm soát Gate PHI & Test nhanh Kit Lab
          </span>
          {harvest.is_phi_cleared ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              An toàn Gate PHI
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              Chưa đủ thời gian cách ly
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Cơ chế Gate Check PHI"
            value={
              harvest.is_phi_cleared ? (
                <span className="text-emerald-700 font-bold">Vượt qua kiểm tra cách ly</span>
              ) : (
                <span className="text-rose-700 font-bold">Cảnh báo vi phạm thời gian cách ly</span>
              )
            }
          />
          <DataFieldRow
            label="Ngày an toàn PHI tính toán"
            value={harvest.safe_harvest_date ? formatDate(harvest.safe_harvest_date) : 'Đã xác minh'}
            isMono
          />
          <DataFieldRow
            label="Kết quả Test Kit nhanh BVTV"
            value={
              harvest.kcs_quick_lab ? (
                harvest.kcs_quick_lab.test_result === 'LAB_PASSED' ? (
                  <span className="text-emerald-700 font-bold">Âm tính (Pass an toàn)</span>
                ) : (
                  <span className="text-rose-700 font-bold">Dương tính (Phát hiện tồn dư)</span>
                )
              ) : (
                <span className="text-slate-500 font-medium">Chưa thực hiện test kit</span>
              )
            }
          />
          <DataFieldRow
            label="Mã Kit Test Lab đã dùng"
            value={harvest.kcs_quick_lab?.kit_code || 'Chưa ghi nhận'}
            isMono
          />
          <DataFieldRow
            label="Dư lượng hóa chất ghi nhận"
            value={
              harvest.kcs_quick_lab?.residue_ppm != null
                ? `${harvest.kcs_quick_lab.residue_ppm} ppm (Dưới ngưỡng MRL)`
                : 'Chưa có số liệu'
            }
            isMono
          />
          <DataFieldRow
            label="Chuyên viên KCS thực hiện"
            value={harvest.kcs_quick_lab?.tester_name || 'Bộ phận KCS HTX'}
          />
        </div>
      </div>
    </div>
  );
};
