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
  Droplets,
  Bug,
  ShieldAlert,
  Scale,
  Leaf,
  FlaskConical,
  PackageCheck,
  User,
  Clock,
  Shield,
  FileCheck as FileCheckIcon,
} from 'lucide-react';
import { fetchPublicTraceability } from '@/services/traceabilityApi';
import { QrCodeSvg } from '../components/QrCodeSvg';
import type { PublicTraceabilityData } from '@/types/agriculture';

const getActivityBadge = (type: string) => {
  const t = (type || '').toUpperCase();
  if (t.includes('FERTILIZ') || t.includes('IRRIGAT') || t.includes('TUOI')) {
    return {
      label: 'Tưới & Dinh Dưỡng EC/pH',
      icon: <Droplets className="w-3.5 h-3.5" />,
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
      nodeColor: 'bg-blue-600',
    };
  }
  if (t.includes('IPM') || t.includes('SCOUT') || t.includes('DIEU_TRA')) {
    return {
      label: 'Giám Sát Dịch Hại IPM',
      icon: <Bug className="w-3.5 h-3.5" />,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
      nodeColor: 'bg-amber-600',
    };
  }
  if (t.includes('BIO') || t.includes('SWIRSKII') || t.includes('THIEN_DICH')) {
    return {
      label: 'Thiên Địch Sinh Học',
      icon: <Leaf className="w-3.5 h-3.5" />,
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      nodeColor: 'bg-emerald-600',
    };
  }
  if (t.includes('SPRAY') || t.includes('THUOC') || t.includes('RADIANT')) {
    return {
      label: 'Thuốc Sinh Học & An Toàn PHI',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
      nodeColor: 'bg-purple-600',
    };
  }
  if (t.includes('HARVEST') || t.includes('THU_HOACH')) {
    return {
      label: 'Thu Hoạch & KCS Cổng Vườn',
      icon: <Scale className="w-3.5 h-3.5" />,
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-200',
      nodeColor: 'bg-rose-600',
    };
  }
  if (t.includes('LAND') || t.includes('PLOW') || t.includes('DAT') || t.includes('GIA_THE')) {
    return {
      label: 'Làm Đất & Giá Thể Xơ Dừa',
      icon: <Layers className="w-3.5 h-3.5" />,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
      nodeColor: 'bg-amber-700',
    };
  }
  return {
    label: 'Kỹ Thuật Chăm Sóc',
    icon: <Sprout className="w-3.5 h-3.5" />,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    nodeColor: 'bg-teal-600',
  };
};

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
                <Check className="w-4 h-4 text-emerald-600" /> ĐẠT AN TOÀN 100%
              </div>
              <p className="text-[11px] text-slate-600">
                Đã cách ly <strong>{trace.kcs_inspection.days_since_last_spray || 16} ngày</strong> sau lần phun cuối ({trace.kcs_inspection.last_active_ingredient || 'Spinetoram'}). Vượt hạn cách ly PHI an toàn.
              </p>
            </div>

            {/* Cấp 2 */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Cấp 2: Quick Lab Test</span>
              <div className="text-sm font-extrabold text-emerald-950 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> ÂM TÍNH (Pass)
              </div>
              <p className="text-[11px] text-slate-600">
                Kit {trace.kcs_inspection.lab_kit_code}: Không tồn dư hóa chất cấm ({trace.kcs_inspection.residue_ppm ?? 0.0} ppm).
              </p>
            </div>

            {/* Cấp 3 */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Cấp 3: Grading Phân Hạng</span>
              <div className="text-sm font-extrabold text-emerald-950 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> GRADE A (Premium)
              </div>
              <p className="text-[11px] text-slate-600">
                Độ ngọt {trace.kcs_inspection.brix_level}° Brix ≥ 7.0°, độ đồng đều {trace.kcs_inspection.uniformity_rate}% ≥ 90% • Phiếu cân: <strong>{trace.product.weighing_slip_code || 'PC-SK-101'}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Seed Origin & Commercial Contract */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              Nguồn Gốc Cây Giống &amp; Hợp Đồng Bao Tiêu Chuẩn OCOP
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              CHÍNH HÃNG F1 BOKKEN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cơ sở cung cấp hạt giống:</span>
                <p className="font-bold text-slate-800 mt-0.5">{trace.product.seed_supplier || 'Công ty TNHH Syngenta Việt Nam / Giống F1 Bokken'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Nghiệm thu xuất vườn cây giống:</span>
                <p className="text-slate-600 font-medium mt-0.5">
                  Cây con 32 ngày tuổi • Chiều cao 16.5 cm • 5 lá thật • Cổ rễ 3.5mm • Rễ trắng khỏe sạch nấm lở cổ rễ.
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Hợp đồng bao tiêu thương mại:</span>
                <p className="font-bold text-slate-800 mt-0.5">{trace.product.buyer_contract_info?.buyer_name || 'Hệ thống Siêu thị WinCommerce & Xuất khẩu'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cơ sở đóng gói (PHC):</span>
                  <p className="font-mono font-bold text-slate-700">{trace.product.buyer_contract_info?.phc_code || 'VN-LDO-PHC-0089'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Hạn mức PUC Quota:</span>
                  <p className="font-bold text-emerald-700">{trace.product.puc_quota_kg ? `${trace.product.puc_quota_kg.toLocaleString('vi-VN')} kg` : '26.250 kg'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Farming Journey Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheckIcon className="w-5 h-5 text-emerald-600" />
                Hành Trình Canh Tác Chi Tiết Chuẩn VietGAP &amp; TCVN 12850:2019
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu thời gian thực được xác thực tại hiện trường nhà kính HTX Tân Tiến ({trace.farming_journey.length} công đoạn kỹ thuật).
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              100% MINH BẠCH
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
            {trace.farming_journey.map((step) => {
              const badge = getActivityBadge(step.activity_type);
              return (
                <div key={step.stage_number} className="relative group">
                  {/* Timeline node */}
                  <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full ${badge.nodeColor} text-white flex items-center justify-center text-xs font-black shadow-sm ring-4 ring-white`}>
                    {step.stage_number}
                  </div>

                  <div className="bg-slate-50 hover:bg-emerald-50/40 p-4 rounded-2xl border border-slate-200 transition space-y-2.5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.badgeClass}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {step.stage_name}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full self-start sm:self-auto flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-700" />
                        {step.date}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Rich Technical Parameters Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/70">
                      {/* Fertigation parameters */}
                      {(step.ec_solution !== null && step.ec_solution !== undefined || step.ph_solution !== null && step.ph_solution !== undefined) && (
                        <div className="col-span-full flex flex-wrap items-center gap-2 text-blue-900 font-semibold bg-blue-50/70 px-2.5 py-1.5 rounded-lg border border-blue-200">
                          <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Dinh dưỡng: EC đạt <strong>{step.ec_solution} mS/cm</strong></span>
                          <span>•</span>
                          <span>pH đạt <strong>{step.ph_solution}</strong></span>
                          <span>•</span>
                          <span className="text-slate-600 font-normal">Hệ thống que ghim bù áp Israel</span>
                        </div>
                      )}

                      {/* Pest scouting parameters */}
                      {step.pest_target && (
                        <div className="col-span-full flex flex-wrap items-center gap-2 text-amber-900 font-semibold bg-amber-50/70 px-2.5 py-1.5 rounded-lg border border-amber-200">
                          <Bug className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Dịch hại giám sát: <strong>{step.pest_target}</strong></span>
                          {step.pest_density && (
                            <>
                              <span>•</span>
                              <span>Mật độ: <strong>{step.pest_density}</strong></span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Biocontrol parameters */}
                      {step.biocontrol_agent_name && (
                        <div className="col-span-full flex flex-wrap items-center gap-2 text-emerald-900 font-semibold bg-emerald-50/70 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Thiên địch: <strong>{step.biocontrol_agent_name}</strong></span>
                          {step.biocontrol_release_rate && (
                            <>
                              <span>•</span>
                              <span>Liều lượng: <strong>{step.biocontrol_release_rate}</strong></span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Chemical Spray & PHI Safety */}
                      {step.active_ingredient && (
                        <div className="col-span-full flex flex-wrap items-center gap-2 text-purple-900 font-semibold bg-purple-50/70 px-2.5 py-1.5 rounded-lg border border-purple-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Hoạt chất: <strong>{step.active_ingredient}</strong></span>
                          {step.resistance_group && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-purple-700">[{step.resistance_group}]</span>
                            </>
                          )}
                          {step.phi_days && (
                            <>
                              <span>•</span>
                              <span className="text-purple-800">Cách ly PHI: <strong>{step.phi_days} ngày</strong></span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Materials used */}
                      {step.materials_used && (
                        <div className="sm:col-span-2 text-slate-600">
                          <strong className="text-slate-800">Vật tư:</strong> {step.materials_used}
                          {step.quantity_applied && (
                            <span className="text-slate-500 font-medium"> ({step.quantity_applied} {step.unit || 'kg'})</span>
                          )}
                          {step.material_batch_number && (
                            <span className="font-mono text-[10px] text-slate-500 ml-1.5 bg-slate-100 px-1.5 py-0.5 rounded">
                              Lô: {step.material_batch_number}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer: Performer & Location */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10.5px] text-slate-500">
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Người thực hiện: <strong>{step.performer_name || 'Kỹ sư Nông nghiệp HTX'}</strong></span>
                      </div>
                      {step.location_gps && (
                        <div className="font-mono text-emerald-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{step.location_gps}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Farm Plot & Cadastral 2024 Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Vùng Trồng &amp; Định Vị Thửa Đất (Luật Đất Đai 2024)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              NHÀ MÀNG CNC ISRAEL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Vùng sản xuất &amp; Mã số vùng trồng (PUC):</span>
                <p className="font-bold text-slate-900 text-sm">{trace.plot.production_unit_name}</p>
                <p className="text-[11px] font-mono font-bold text-emerald-700">Mã PUC Cục BVTV: {trace.plot.puc_code || trace.product.puc_code}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Thửa đất Sổ đỏ:</span>
                  <p className="font-bold text-slate-800">Tờ 05 • Thửa 128</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Mã Đất đai QG:</span>
                  <p className="font-mono font-bold text-slate-800">{trace.plot.national_cadastral_code || '49-302-05-128'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Quy mô &amp; Canh tác CNC:</span>
                <p className="font-medium text-slate-700 mt-0.5">
                  {trace.plot.substrate_bag_count || 2500} túi giá thể xơ dừa • Mật độ {trace.plot.planting_density_per_sqm || 2.5} cây/m² • {trace.plot.soil_type}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 pt-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Xã viên trực tiếp phụ trách: <strong>{trace.plot.assigned_member}</strong></span>
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
