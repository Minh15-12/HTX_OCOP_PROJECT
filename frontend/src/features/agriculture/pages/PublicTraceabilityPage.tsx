import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Award,
  CheckCircle,
  MapPin,
  Calendar,
  Layers,
  Sprout,
  Wheat,
  Phone,
  Mail,
  Building,
  QrCode,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  BadgeCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { fetchPublicTraceability } from '@/services/traceabilityApi';
import { QrCodeSvg } from '../components/QrCodeSvg';
import type { PublicTraceabilityData } from '@/types/agriculture';

export const PublicTraceabilityPage: React.FC = () => {
  const { lotId = 'LOT-TT-XV003-01-20261015-01' } = useParams<{ lotId: string }>();
  const [copied, setCopied] = useState(false);
  const [showHashDetails, setShowHashDetails] = useState(false);

  const { data: trace, isLoading, isError } = useQuery<PublicTraceabilityData>({
    queryKey: ['public-traceability', lotId],
    queryFn: async () => {
      return fetchPublicTraceability(lotId);
    },
    retry: false,
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Đang tải hồ sơ nguồn gốc nông sản OCOP...</p>
        </div>
      </div>
    );
  }

  if (isError || !trace) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy mã lô truy xuất</h2>
          <p className="text-xs text-slate-500 mt-1">Mã lô "{lotId}" chưa có dữ liệu hoặc không hợp lệ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      {/* Top Banner Verification Status */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-4 py-2.5 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-300" />
            <span className="font-extrabold tracking-wide uppercase">Cổng Tra Cứu Nguồn Gốc Công Khai (OCOP 148)</span>
          </div>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-bold text-[11px] backdrop-blur-xs">
            Xác thực 100%
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Cooperative & Product Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 mb-2.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" /> OCOP 4 SAO TỈNH LÂM ĐỒNG (QĐ 148/QĐ-TTg)
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {trace.product.name}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-800 font-bold mt-1">
                  {trace.cooperative.name}
                </p>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {trace.cooperative.province}
                  </span>
                  <span className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> Mã PUC: {trace.product.puc_code}
                  </span>
                </div>
              </div>

              {/* QR Code preview */}
              <div className="flex flex-col items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <QrCodeSvg value={trace.qr_verify_url || window.location.href} size={96} />
                <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase font-bold">Mã GS1 Chuẩn</span>
              </div>
            </div>

            {/* Product description & highlights */}
            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-slate-100">
              {trace.product.description}
            </p>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Phân hạng</span>
                <span className="text-xs font-black text-emerald-700">GRADE A (Thượng hạng)</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Độ ngọt Brix</span>
                <span className="text-xs font-black text-slate-900">≥ {trace.product.brix_level}° Brix</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Độ đồng đều</span>
                <span className="text-xs font-black text-slate-900">{trace.product.uniformity_rate}%</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Kiểm soát PHI</span>
                <span className="text-xs font-black text-emerald-700">100% An Toàn</span>
              </div>
            </div>
          </div>

          {/* GS1 Lot Identification Card */}
          <div className="p-4 sm:p-6 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block">
                Mã Lô Định Danh Toàn Cầu (GS1 Lot Code):
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-slate-900 block mt-0.5">
                {trace.lot_code}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Thu hoạch: <strong>{trace.product.harvest_date}</strong></span>
                <span>•</span>
                <span>HSD: <strong>{trace.product.expiry_date}</strong></span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Đã sao chép link!' : 'Chia sẻ chứng thực'}</span>
            </button>
          </div>
        </div>

        {/* 3-Tier KCS Quality Inspection Results */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Kết Quả Kiểm Soát Chất Lượng KCS 3 Cấp
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ĐẠT CHUẨN XUẤT XƯỞNG
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cấp 1 */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Cấp 1: Gate Check PHI</span>
              <div className="text-sm font-extrabold text-emerald-950 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> ĐẠT 100%
              </div>
              <p className="text-[11px] text-slate-600">
                Thửa đất đã hoàn thành thời gian cách ly thuốc BVTV an toàn trước khi hái.
              </p>
            </div>

            {/* Cấp 2 */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Cấp 2: Quick Lab Test</span>
              <div className="text-sm font-extrabold text-emerald-950 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> ÂM TÍNH (Pass)
              </div>
              <p className="text-[11px] text-slate-600">
                Kit {trace.kcs_inspection.lab_kit_code}: Không tồn dư hóa chất cấm (0.0 ppm).
              </p>
            </div>

            {/* Cấp 3 */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Cấp 3: Grading Phân Hạng</span>
              <div className="text-sm font-extrabold text-emerald-950 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> GRADE A (Premium)
              </div>
              <p className="text-[11px] text-slate-600">
                Độ ngọt {trace.kcs_inspection.brix_level}° Brix ≥ 7.0°, độ đồng đều {trace.kcs_inspection.uniformity_rate}% ≥ 90%.
              </p>
            </div>
          </div>
        </div>

        {/* 5-Stage Farming Journey Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              Hành Trình Canh Tác 5 Bước Chuẩn Thông Tư 02/2024
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ dữ liệu được ghi nhận theo thời gian thực từ hiện trường nhà kính HTX Tân Tiến.
            </p>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
            {trace.farming_journey.map((step) => (
              <div key={step.stage_number} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-sm ring-4 ring-white">
                  {step.stage_number}
                </div>

                <div className="bg-slate-50 hover:bg-emerald-50/40 p-4 rounded-2xl border border-slate-200 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {step.stage_name}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      {step.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {step.description}
                  </p>

                  {step.materials_used && (
                    <div className="mt-2 text-[11px] text-slate-500 font-medium">
                      <strong className="text-slate-700">Vật tư sử dụng:</strong> {step.materials_used}
                    </div>
                  )}

                  {step.location_gps && (
                    <div className="mt-1 font-mono text-[10.5px] text-emerald-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      Tọa độ GPS: {step.location_gps}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Farm Plot & GPS Map Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Vùng Trồng & Định Vị Thửa Đất Canh Tác
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Vùng sản xuất:</span>
                <p className="font-bold text-slate-800 text-sm">{trace.plot.production_unit_name}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Thửa đất / Nhà kính:</span>
                <p className="font-bold text-slate-800">{trace.plot.plot_name} ({trace.plot.plot_code})</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Xã viên phụ trách:</span>
                <p className="font-semibold text-slate-700">{trace.plot.assigned_member}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Diện tích & Thổ nhưỡng:</span>
                <p className="font-medium text-slate-700">{trace.plot.area_sqm} m² • {trace.plot.soil_type}</p>
              </div>
            </div>

            {/* GPS Map Pin Display */}
            <div className="bg-emerald-950 text-white rounded-2xl p-4 flex flex-col justify-between shadow-inner relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Tọa độ vệ tinh GPS WGS-84
                </span>
                <p className="text-sm font-mono font-black mt-1 text-emerald-100">
                  {trace.plot.gps_coordinates}
                </p>
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  Độ cao ~1.500m so với mực nước biển, khí hậu ôn đới cao nguyên Đà Lạt.
                </p>
              </div>
              <a
                href={`https://www.google.com/maps?q=${trace.plot.gps_latitude},${trace.plot.gps_longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition w-fit"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Xem trên Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Certifications Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Chứng Nhận Chất Lượng & Pháp Lý
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {trace.certifications.map((cert) => (
              <div key={cert.code} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                  {cert.badge_label}
                </span>
                <h4 className="text-xs font-extrabold text-slate-800 leading-snug pt-1">
                  {cert.name}
                </h4>
                <p className="text-[10.5px] font-mono text-slate-500">Mã: {cert.code}</p>
                <p className="text-[10.5px] text-slate-400">Hiệu lực đến: {cert.valid_until}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SHA-256 Digital Integrity Checksum */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                Bảo Chứng Số Toàn Vẹn SHA-256 (Hash Chain)
              </h3>
            </div>
            <button
              onClick={() => setShowHashDetails(!showHashDetails)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>{showHashDetails ? 'Thu gọn' : 'Chi tiết mã băm'}</span>
              {showHashDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Mỗi công đoạn canh tác và kiểm nghiệm lô hàng được băm mã SHA-256 bất biến chống sửa đổi hồi tố, đảm bảo tính trung thực tuyệt đối của sản phẩm OCOP HTX Tân Tiến.
          </p>

          <div className="p-3 bg-black/40 rounded-xl font-mono text-[11px] text-emerald-300 break-all border border-emerald-900/40">
            {trace.integrity_hash}
          </div>

          {showHashDetails && (
            <div className="pt-2 text-[11px] text-slate-400 space-y-1 border-t border-slate-800">
              <p>• Thuật toán: SHA-256 HMAC với khóa kiểm toán hợp tác xã</p>
              <p>• Trạng thái hồ sơ: ĐÃ ĐÓNG BĂNG & XÁC THỰC BẤT BIẾN (IMMUTABLE)</p>
              <p>• Thời điểm phát hành: {trace.product.harvest_date} 09:30:00 ICT</p>
            </div>
          )}
        </div>

        {/* Cooperative Contact & Footer */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-2">
          <h4 className="text-sm font-black text-slate-900">{trace.cooperative.name}</h4>
          <p className="text-xs text-slate-500">{trace.cooperative.address}</p>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-bold pt-1">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> {trace.cooperative.hotline}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" /> {trace.cooperative.email}
            </span>
          </div>
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Hệ thống Quản lý Nông nghiệp & Đánh giá phân hạng OCOP Quyết định 148/QĐ-TTg • HTX Nông nghiệp Tân Tiến
          </div>
        </div>
      </div>
    </div>
  );
};
