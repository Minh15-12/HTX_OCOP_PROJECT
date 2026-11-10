import React from 'react';
import {
  MapPin,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { FarmPlot, ProductionUnit } from '@/services/farmPlotApi';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface FarmPlotTabOverviewProps {
  plot: FarmPlot;
  unit?: ProductionUnit | null;
}

export const FarmPlotTabOverview: React.FC<FarmPlotTabOverviewProps> = ({ plot, unit }) => {
  const isQuarantine = plot.status === 'IN_QUARANTINE';
  const gps = plot.gps_coordinates?.trim();

  // Create Google Maps link if coordinates available
  const googleMapsUrl = gps
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gps)}`
    : null;

  return (
    <div className="space-y-4">
      {/* PHI Status Banner */}
      {isQuarantine ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-extrabold text-sm text-rose-900">
                Thửa đất đang trong thời gian cách ly thuốc BVTV (PHI Guard)
              </h4>
              <p className="text-rose-700 leading-relaxed">
                Nghiêm cấm mọi hoạt động thu hoạch hoặc xuất bán nông sản trước ngày{' '}
                <strong className="underline font-bold">
                  {plot.safe_harvest_date || 'Chưa xác định'}
                </strong>{' '}
                theo quy định an toàn vệ sinh thực phẩm và chứng nhận OCOP.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-emerald-900 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Đạt chuẩn thời gian cách ly (PHI Clean):</span> Thửa đất
            đang trong ngưỡng an toàn để thu hoạch hoặc xuất bán theo quy chuẩn VietGAP.
          </div>
        </div>
      )}

      {/* Thông tin vùng sản xuất mẹ */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          Vùng sản xuất trực thuộc
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow label="Tên vùng sản xuất" value={plot.unit_name || unit?.name || '—'} />
          <DataFieldRow label="Mã vùng" value={plot.unit_code || unit?.unit_code || '—'} isMono />
          <DataFieldRow
            label="Mã số vùng trồng (PUC)"
            value={unit?.puc_code || 'Chưa đăng ký PUC Cục BVTV'}
            isMono={!!unit?.puc_code}
          />
          <DataFieldRow label="Cây trồng chủ lực" value={unit?.crop || '—'} />
          <DataFieldRow
            label="Tổng diện tích vùng"
            value={unit?.area ? `${unit.area} ha` : '—'}
          />
        </div>
      </div>

      {/* Thông tin chi tiết thửa */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          Thông số kỹ thuật thửa đất
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow label="Mã định danh thửa" value={plot.plot_code} isMono />
          <DataFieldRow
            label="Diện tích thửa"
            value={<span className="font-bold text-slate-900">{plot.area} ha</span>}
          />
          <DataFieldRow
            label="Tọa độ GPS"
            value={
              gps ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-700">{gps}</span>
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Bản đồ <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : (
                <span className="text-slate-400">Chưa cập nhật tọa độ</span>
              )
            }
          />
          <DataFieldRow
            label="Hạn mức sản lượng trần (OCOP)"
            value={
              <span className="font-extrabold text-emerald-700 font-mono">
                {(plot.max_harvest_quota_kg || Math.round((Number(plot.area) * 10000) * (plot.max_yield_rate_per_sqm || 5.0) * 1.2)).toLocaleString('vi-VN')} kg / vụ
              </span>
            }
          />
          <DataFieldRow
            label="Ranh giới WebGIS"
            value={
              plot.geometry_geojson?.coordinates?.[0]?.length >= 3 ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đa giác khép kín ({plot.geometry_geojson.coordinates[0].length} đỉnh)
                </span>
              ) : (
                <span className="text-slate-400 italic">Chưa vẽ ranh giới đa giác</span>
              )
            }
          />
          <DataFieldRow
            label="Mô hình nhà kính"
            value={
              plot.greenhouse_type === 'HIGH_TECH_GREENHOUSE'
                ? 'Nhà màng CNC Israel (Tưới nhỏ giọt)'
                : plot.greenhouse_type === 'NET_HOUSE'
                ? 'Nhà lưới ngăn côn trùng'
                : 'Canh tác ngoài trời (Đất hở)'
            }
          />
          <DataFieldRow
            label="Ngày an toàn thu hoạch (PHI)"
            value={plot.safe_harvest_date || 'Không có yêu cầu cách ly'}
            isMono={!!plot.safe_harvest_date}
          />
          <DataFieldRow
            label="Thời điểm tạo hồ sơ"
            value={plot.created_at ? new Date(plot.created_at).toLocaleDateString('vi-VN') : '—'}
          />
        </div>
      </div>

      {/* Thông tin pháp lý đất đai (Sổ đỏ) */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          Hồ sơ pháp lý đất đai (Sổ đỏ)
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow
            label="Số seri Giấy chứng nhận"
            value={plot.land_relation?.certificate_number || plot.land_relation?.so_seri || 'Chưa cập nhật'}
            isMono
          />
          <DataFieldRow
            label="Số vào sổ cấp GCN"
            value={plot.land_relation?.book_number || plot.land_relation?.so_vao_so || 'Chưa cập nhật'}
            isMono
          />
          <DataFieldRow
            label="Số tờ bản đồ / Số thửa"
            value={
              plot.land_relation?.map_sheet && plot.land_relation?.plot_number
                ? `Tờ ${plot.land_relation.map_sheet}, Thửa ${plot.land_relation.plot_number}`
                : `Thửa ${plot.plot_code}`
            }
          />
          <DataFieldRow
            label="Hình thức tham gia HTX"
            value={
              plot.land_relation?.contribution_type === 'RENTAL'
                ? 'HTX thuê quyền sử dụng đất'
                : 'Xã viên góp quyền sử dụng đất vào HTX'
            }
          />
        </div>
      </div>
    </div>
  );
};
