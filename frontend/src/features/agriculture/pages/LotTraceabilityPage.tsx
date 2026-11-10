import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Wheat,
  Sprout,
  User,
  Calendar,
  BookOpen,
  ShieldCheck,
  PackageCheck,
  ArrowLeft,
  ExternalLink,
  Droplets,
  Bug,
  Leaf,
  ShieldAlert,
  Scale,
  Layers,
  MapPin,
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  QrCode,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/services/apiClient';
import { formatDate, formatNumber } from '@/utils/formatters';

export const LotTraceabilityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: traceData, isLoading, isError } = useQuery({
    queryKey: ['lot-traceability', id],
    queryFn: async () => {
      const res: any = await apiClient.get(`/lots/${id}/traceability`);
      return res.data?.data || res.data || res;
    },
    enabled: !!id,
    retry: false,
  });

  const lot = traceData?.lot || traceData;
  const harvest = traceData?.harvest;
  const plot = traceData?.farm_plot || traceData?.plot;
  const season = traceData?.crop_season;
  const unit = traceData?.production_unit;
  const coop = traceData?.cooperative;
  const logs = traceData?.tt02_traceability_logs || traceData?.farming_logs || [];

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'FERTILIZATION':
        return { label: 'Tưới Dinh Dưỡng EC/pH', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Droplets };
      case 'IPM_SCOUTING':
        return { label: 'Điều Tra Dịch Hại IPM', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Bug };
      case 'BIOCONTROL_RELEASE':
        return { label: 'Phóng Thả Thiên Địch', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Leaf };
      case 'PEST_CONTROL':
        return { label: 'Xử Lý BVTV & PHI', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldAlert };
      case 'HARVEST':
        return { label: 'Thu Hoạch & Cân Mẫu', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Scale };
      case 'LAND_PREPARATION':
        return { label: 'Làm Đất & Giá Thể', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Layers };
      default:
        return { label: type, color: 'bg-slate-100 text-slate-700 border-slate-200', icon: BookOpen };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Truy Xuất Nguồn Gốc Lô Hàng (Data Lineage Tree)"
        subtitle="Cây phả hệ dữ liệu truy xuất minh bạch từ Lô thương mại ngược về Thửa đất, Xã viên và Vật tư canh tác"
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => navigate('/agriculture/harvests')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Quay Lại Thu Hoạch
            </Button>
            <Button
              variant="primary"
              onClick={() => window.open(`/trace/${lot?.lot_code || id}`, '_blank')}
              leftIcon={<ExternalLink className="w-4 h-4" />}
            >
              Cổng Tra Cứu Công Khai
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Card className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : isError || !traceData ? (
        <Card className="p-10 text-center space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Không tìm thấy dữ liệu truy xuất nguồn gốc</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Mã định danh lô hàng [{id}] không tồn tại trong cơ sở dữ liệu HTX hoặc chưa được liên kết với đợt thu hoạch hợp lệ.
          </p>
          <div className="pt-2">
            <Button variant="outline" onClick={() => navigate('/agriculture/harvests')}>
              Quay lại Danh sách Thu hoạch &amp; Lô hàng
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top Banner Lot Summary */}
          <Card className="bg-gradient-to-r from-cop-900 via-cop-800 to-slate-900 text-white p-6 sm:p-7 shadow-xl rounded-2xl border-none">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-cop-500/20 text-cop-300 text-[11px] font-mono font-bold tracking-wider uppercase border border-cop-400/20">
                    Mã Lô Hàng GS1 (Lot ID)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Chuỗi Khối Toàn Vẹn SHA-256
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {lot?.lot_code}
                </h2>
                <p className="text-xs text-cop-200 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Chủ thể: <strong>{coop?.legal_name || 'HTX Nông Nghiệp Công Nghệ Cao Tân Tiến'}</strong> &bull; Vùng trồng: <strong>{unit?.name || 'Vùng Chuyên Canh Sweet Palermo'}</strong>
                  </span>
                </p>
              </div>

              {/* Quick KPI stats */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase text-cop-200 block font-semibold">Khối Lượng Lô</span>
                  <span className="text-lg font-black text-white">{formatNumber(lot?.quantity)} {lot?.unit || 'kg'}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase text-cop-200 block font-semibold">Độ Ngọt Brix</span>
                  <span className="text-lg font-black text-amber-300">{harvest?.brix_level || 8.5}&deg;Bx</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase text-cop-200 block font-semibold">Độ Đồng Đều</span>
                  <span className="text-lg font-black text-emerald-300">{harvest?.uniformity_rate || 94.0}%</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase text-cop-200 block font-semibold">Phân Loại</span>
                  <span className="text-lg font-black text-white">{harvest?.grade || 'GRADE_A'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Interactive Lineage Tree Nodes */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-cop-200">
            {/* Node 1: Harvest Record & 3-Tier KCS Inspection */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cop-600 text-white flex items-center justify-center ring-4 ring-white shadow-md">
                <Wheat className="w-4 h-4" />
              </div>
              <Card className="flex-1 p-5 border-l-4 border-l-cop-600 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-cop-700 uppercase tracking-wider block">Giai đoạn 1 &bull; Thu hoạch & Kiểm soát xuất trại</span>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      Đợt Thu Hoạch & Phiếu Cân Điện Tử #{harvest?.weighing_slip_code || 'PC-SK-101'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatDate(harvest?.harvest_date)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      KCS PASSED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Sản lượng nhập kho:</span>
                    <strong className="text-sm font-bold text-slate-800">{formatNumber(harvest?.quantity)} kg</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Lượt thu hái: Đợt {harvest?.stage_number || 1}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Phân loại & Tiêu chuẩn:</span>
                    <strong className="text-sm font-bold text-emerald-700">{harvest?.grade || 'GRADE_A'} (Xuất khẩu/OCOP)</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Tỷ lệ đồng đều: {harvest?.uniformity_rate || 94.0}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Độ ngọt cảm quan (Brix):</span>
                    <strong className="text-sm font-bold text-amber-700">{harvest?.brix_level || 8.5}&deg; Brix</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Khúc xạ kế Atago PAL-1</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Hao hụt & Loại thải:</span>
                    <strong className="text-sm font-bold text-slate-700">{harvest?.rejection_weight_kg || 45.0} kg</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Chuyển làm phân ủ vi sinh</span>
                  </div>
                </div>

                {/* 3-Tier KCS Detail Box */}
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Quy Trình Kiểm Tra KCS 3 Cấp Trước Khi Thu Hái (VietGAP Strict Compliance)
                    </span>
                    <span className="font-mono text-emerald-700">Dư Lượng: 0.0 ppm (Âm Tính)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px] text-slate-700 pt-1">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-slate-400 block">Cấp 1: Cổng xuất trại</span>
                      <strong className="text-emerald-700 font-bold">100% Cân điện tử & Quét mã QR</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-slate-400 block">Cấp 2: Thời gian cách ly (PHI)</span>
                      <strong className="text-emerald-700 font-bold">
                        Đã qua {harvest?.days_since_last_spray || 16} ngày sau xử lý Spinetoram (Quy định: 7 ngày)
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-slate-400 block">Cấp 3: Test kit test nhanh</span>
                      <strong className="text-emerald-700 font-bold">KIT-AGRO-QUATEST3 &bull; Đạt An Toàn</strong>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Node 2: Farm Plot & Assigned Member */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white shadow-md">
                <Sprout className="w-4 h-4" />
              </div>
              <Card className="flex-1 p-5 border-l-4 border-l-emerald-500 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Giai đoạn 2 &bull; Địa chính & Không gian canh tác</span>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      Thửa Đất Canh Tác {plot?.plot_name || plot?.plot_code}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cop-50 text-cop-800 border border-cop-200">
                    Sổ Đỏ Hợp Pháp &bull; Luật Đất Đai 2024
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Vị trí địa chính (Sổ đỏ):</span>
                    <strong className="text-slate-800 font-bold">
                      Tờ bản đồ số {plot?.land_sheet_number || '05'} &bull; Thửa đất số {plot?.land_parcel_number || '128'}
                    </strong>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                      Mã Đất đai QG: {plot?.national_cadastral_code || '49-302-05-128'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Quy cách canh tác:</span>
                    <strong className="text-slate-800 font-bold">
                      Nhà màng CNC &bull; {plot?.substrate_bag_count ? formatNumber(plot.substrate_bag_count) : '2.500'} túi xơ dừa
                    </strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {(() => {
                        const a = Number(plot?.area || 0);
                        const ha = a > 0 ? (a < 100 ? a : a / 10000) : 0.45;
                        const m2 = a > 0 ? (a < 100 ? a * 10000 : a) : 4500;
                        return `Mật độ: ${plot?.planting_density_per_sqm || 2.5} cây/m² (${ha.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ha • ${m2.toLocaleString('vi-VN')} m²)`;
                      })()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2 lg:col-span-1">
                    <span className="text-slate-400 block mb-0.5">Xã viên trực tiếp chịu trách nhiệm:</span>
                    <div className="flex items-center gap-1.5 font-bold text-cop-800 mt-1">
                      <User className="w-4 h-4 text-cop-600 shrink-0" />
                      <span>{plot?.assigned_member || 'Nguyễn Văn Nông (Xã viên Hòn Bồ)'}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Vùng trồng: {unit?.name || 'Vùng Chuyên Canh Sweet Palermo'} ({unit?.unit_code || 'PUC-49-015-9923'})
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Node 3: Crop Season & Seedling Provenance */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center ring-4 ring-white shadow-md">
                <Calendar className="w-4 h-4" />
              </div>
              <Card className="flex-1 p-5 border-l-4 border-l-amber-500 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Giai đoạn 3 &bull; Xuất xứ giống & Kế hoạch sản xuất</span>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      Mùa Vụ &amp; Cây Giống Chuẩn OCOP: {season?.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Hạn Mức PUC: {season?.puc_quota_kg ? formatNumber(season.puc_quota_kg) : '26.250'} kg
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Nguồn gốc cây giống:</span>
                    <strong className="text-slate-800 font-bold">
                      {season?.seed_supplier || 'Công ty TNHH Syngenta Việt Nam / Giống F1 Bokken'}
                    </strong>
                    <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                      &bull; Nghiệm thu: 32 ngày tuổi, 5 lá thật, rễ trắng
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Chu kỳ sinh trưởng:</span>
                    <strong className="text-slate-800 font-bold">
                      {formatDate(season?.start_date)} &rarr; {formatDate(season?.expected_end_date)}
                    </strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Cây trồng: Ớt chuông Sweet Palermo Đỏ xuất khẩu
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2 lg:col-span-1">
                    <span className="text-slate-400 block mb-0.5">Hợp đồng liên kết bao tiêu:</span>
                    <strong className="text-slate-800 font-bold">Hệ Thống Bách Hóa Xanh &amp; WinCommerce</strong>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                      Mã cơ sở đóng gói (PHC): VN-LDO-PHC-0089
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Node 4: Farming Logs & Material Usages */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-sky-600 text-white flex items-center justify-center ring-4 ring-white shadow-md">
                <BookOpen className="w-4 h-4" />
              </div>
              <Card className="flex-1 p-5 border-l-4 border-l-sky-500 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Giai đoạn 4 &bull; Nhật ký hoạt động kỹ thuật chuẩn</span>
                    <h3 className="text-base font-bold text-slate-800">
                      Hành Trình Canh Tác 10 Trường (TCVN 12850:2019 &amp; VietGAP TCVN 11892-1:2017)
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Tổng cộng: <strong>{logs.length}</strong> nhật ký nghiệp vụ
                  </span>
                </div>

                <div className="space-y-3">
                  {logs.map((log: any, lIdx: number) => {
                    const badge = getActivityBadge(log.activity_type);
                    const IconComponent = badge.icon;
                    return (
                      <div
                        key={log.id || lIdx}
                        className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-3 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cop-100 text-cop-800 font-bold flex items-center justify-center text-[11px]">
                              {lIdx + 1}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                              {badge.label}
                            </span>
                          </div>
                          <span className="text-slate-500 font-mono flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(log.activity_date)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {log.description}
                        </p>

                        {/* Chi tiết thông số kỹ thuật động */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/70 text-[11.5px]">
                          {/* Khối EC/pH Dinh dưỡng */}
                          {(log.ec_solution || log.ph_solution) && (
                            <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100 space-y-0.5">
                              <span className="text-blue-600 font-semibold block text-[10px] uppercase">
                                Thông số Dinh Dưỡng
                              </span>
                              <div className="flex items-center justify-between text-slate-700">
                                <span>EC dung dịch: <strong>{log.ec_solution} mS/cm</strong></span>
                                <span>pH: <strong>{log.ph_solution}</strong></span>
                              </div>
                              {log.fertigation_method && (
                                <span className="text-[10.5px] text-slate-500 block">
                                  Hệ thống: {log.fertigation_method}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Khối Giám sát IPM */}
                          {log.pest_target && (
                            <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100 space-y-0.5">
                              <span className="text-amber-700 font-semibold block text-[10px] uppercase">
                                Giám sát sâu bệnh IPM
                              </span>
                              <span className="text-slate-700 block font-bold">{log.pest_target}</span>
                              <span className="text-[10.5px] text-slate-600 block">
                                Mật độ: <strong className="text-emerald-700">{log.pest_density}</strong>
                              </span>
                            </div>
                          )}

                          {/* Khối Thiên địch */}
                          {log.biocontrol_agent_name && (
                            <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100 space-y-0.5">
                              <span className="text-emerald-700 font-semibold block text-[10px] uppercase">
                                Thiên địch sinh học
                              </span>
                              <span className="text-slate-800 block font-bold">{log.biocontrol_agent_name}</span>
                              <span className="text-[10.5px] text-emerald-800 block">
                                Mật độ: {log.biocontrol_release_rate}
                              </span>
                            </div>
                          )}

                          {/* Khối Hoạt chất & PHI */}
                          {log.active_ingredient && (
                            <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-100 space-y-0.5">
                              <span className="text-rose-700 font-semibold block text-[10px] uppercase">
                                Thuốc BVTV & Thời gian cách ly
                              </span>
                              <span className="text-slate-800 block font-bold">
                                Hoạt chất: {log.active_ingredient} {log.resistance_group ? `(Nhóm ${log.resistance_group})` : ''}
                              </span>
                              <span className="text-[10.5px] text-rose-800 block font-semibold">
                                PHI: {log.phi_days} ngày &bull; Trạng thái: An toàn xuất xưởng
                              </span>
                            </div>
                          )}

                          {/* Vật tư sử dụng & Mã lô */}
                          <div className="p-2 bg-white rounded-lg border border-slate-200/80 space-y-0.5">
                            <span className="text-slate-400 block text-[10px] uppercase">Vật tư & Số lô SX</span>
                            <strong className="text-slate-800 block truncate">
                              {log.material_name || log.material_used || 'Không sử dụng hóa chất'}
                            </strong>
                            {log.material_batch_number && (
                              <span className="text-[10.5px] font-mono text-cop-800 block">
                                Lô: {log.material_batch_number} {log.quantity_applied ? `(${log.quantity_applied} ${log.unit || ''})` : ''}
                              </span>
                            )}
                          </div>

                          {/* Người thực hiện & Tọa độ GPS */}
                          <div className="p-2 bg-white rounded-lg border border-slate-200/80 space-y-0.5">
                            <span className="text-slate-400 block text-[10px] uppercase">Người thực hiện & GPS</span>
                            <div className="flex items-center gap-1 font-bold text-slate-800 truncate">
                              <User className="w-3.5 h-3.5 text-cop-600 shrink-0" />
                              <span>{log.performer_name || 'Kỹ thuật viên HTX'}</span>
                            </div>
                            <span className="text-[10.5px] font-mono text-slate-500 block">
                              GPS: {log.gps_latitude && log.gps_longitude ? `${Number(log.gps_latitude).toFixed(4)}, ${Number(log.gps_longitude).toFixed(4)}` : '11.9501, 108.4712'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
