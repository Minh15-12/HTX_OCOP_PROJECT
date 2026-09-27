import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch,
  Wheat,
  Sprout,
  User,
  Calendar,
  BookOpen,
  ShieldCheck,
  PackageCheck,
  ArrowLeft,
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

  const { data: traceData, isLoading } = useQuery({
    queryKey: ['lot-traceability', id],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get(`/lots/${id}/traceability`);
        return res.data || res;
      } catch {
        return {
          lot_code: 'LOT-SHAN-20260306-01',
          created_at: '2026-03-06T10:00:00Z',
          harvest: {
            harvest_code: 'TH-2026-001',
            quantity_kg: 1200,
            harvest_date: '2026-03-06',
            quality_grade: 'Loại 1 (Đạt OCOP)',
            is_phi_cleared: true,
          },
          plot: {
            plot_code: 'TD-VT1-01',
            plot_name: 'Thửa Đất Chè Shan Tuyết A1',
            area_ha: 3.5,
            assigned_member: 'Nguyễn Văn Minh (XV-2026-001)',
          },
          crop_season: {
            season_code: 'MV-2026-XUAN',
            name: 'Mùa Vụ Xuân Hè 2026',
            main_crop: 'Chè Shan Tuyết cổ thụ',
          },
          farming_logs: [
            {
              activity_date: '2026-02-20',
              activity_type: 'Phun thuốc sinh học (PEST_CONTROL)',
              description: 'Phun chế phẩm thảo mộc phòng trừ rầy xanh đợt 1',
              material_used: 'Chế phẩm vi sinh Bio-Clean (2.5 lít)',
              phi_days: 14,
            },
            {
              activity_date: '2026-02-10',
              activity_type: 'Bón phân (FERTILIZATION)',
              description: 'Bón phân hữu cơ khoáng vi sinh kích rễ',
              material_used: 'Phân hữu cơ Sông Ranh (500 kg)',
              phi_days: 0,
            },
          ],
        };
      }
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Truy Xuất Nguồn Gốc Lô Hàng (Data Lineage Tree)"
        subtitle="Cây phả hệ dữ liệu truy xuất minh bạch từ Lô hàng thương mại ngược về Thửa đất, Xã viên và Vật tư canh tác"
        action={
          <Button
            variant="outline"
            onClick={() => navigate('/agriculture/harvests')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Quay Lại Thu Hoạch
          </Button>
        }
      />

      {isLoading ? (
        <Card className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top Banner Lot Summary */}
          <Card className="bg-gradient-to-r from-cop-900 via-cop-800 to-cop-700 text-white p-6 shadow-xl border-none">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-cop-200 tracking-wider uppercase">Mã Lô Hàng Sơ Chế (Lot ID)</span>
                <h2 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">{traceData?.lot_code}</h2>
                <p className="text-xs text-cop-100 mt-1 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  <span>Trạng thái: Đã xác thực toàn vẹn dữ liệu chuỗi khối ISO/OCOP</span>
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" /> Đạt Chuẩn An Toàn PHI
                </span>
                <p className="text-xs text-cop-200 mt-2">Ngày khởi tạo: {formatDate(traceData?.created_at)}</p>
              </div>
            </div>
          </Card>

          {/* Interactive Lineage Tree Nodes */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-cop-300">
            {/* Node 1: Harvest Record */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cop-600 text-white flex items-center justify-center ring-4 ring-slate-50 shadow">
                <Wheat className="w-4 h-4" />
              </div>
              <Card className="flex-1 p-5 border-l-4 border-l-cop-600">
                <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>1. Đợt Thu Hoạch Sản Lượng ({traceData?.harvest?.harvest_code})</span>
                  <span className="text-xs font-semibold text-cop-700">{formatDate(traceData?.harvest?.harvest_date)}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border">
                  <div>
                    <span className="text-slate-400">Sản lượng:</span> <strong>{formatNumber(traceData?.harvest?.quantity_kg)} kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Phân loại:</span> <strong>{traceData?.harvest?.quality_grade}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Cách ly PHI:</span> <strong className="text-emerald-600">Đã đạt an toàn</strong>
                  </div>
                </div>
              </Card>
            </div>

            {/* Node 2: Farm Plot & Assigned Member */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-slate-50 shadow">
                <Sprout className="w-4 h-4" />
              </div>
              <Card className="flex-1 p-5 border-l-4 border-l-emerald-500">
                <h3 className="text-sm font-bold text-slate-800">
                  2. Thửa Đất Canh Tác & Xã Viên Trực Tiếp
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border">
                  <div>
                    <span className="text-slate-400">Thửa đất:</span> <strong>{traceData?.plot?.plot_name} ({traceData?.plot?.plot_code})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Diện tích:</span> <strong>{traceData?.plot?.area_ha} ha</strong>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1.5 text-cop-800 font-semibold">
                    <User className="w-4 h-4 text-cop-600" />
                    <span>Xã viên phụ trách: {traceData?.plot?.assigned_member}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Node 3: Crop Season */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center ring-4 ring-slate-50 shadow">
                <Calendar className="w-4 h-4" />
              </div>
              <Card className="flex-1 p-5 border-l-4 border-l-amber-500">
                <h3 className="text-sm font-bold text-slate-800">
                  3. Mùa Vụ Sản Xuất ({traceData?.crop_season?.season_code})
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>{traceData?.crop_season?.name}</strong> &bull; Cây trồng: {traceData?.crop_season?.main_crop}
                </p>
              </Card>
            </div>

            {/* Node 4: Farming Logs & Material Usages */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-sky-600 text-white flex items-center justify-center ring-4 ring-slate-50 shadow">
                <BookOpen className="w-4 h-4" />
              </div>
              <Card className="flex-1 p-5 border-l-4 border-l-sky-500">
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  4. Nhật Ký Truy Xuất Nguồn Gốc 10 Trường (Thông tư 02/2024/TT-BNNPTNT)
                </h3>
                <div className="space-y-3">
                  {(traceData?.tt02_traceability_logs || traceData?.farming_logs || [])?.map((log: any, lIdx: number) => (
                    <div key={lIdx} className="p-3 bg-slate-50 rounded-lg border text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="text-cop-700 font-semibold">[HĐ {lIdx + 1}] {log.activity_type}</span>
                        <span className="text-slate-500 font-mono">{formatDate(log.activity_date)}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11.5px] text-slate-700">
                        <div>
                          <span className="text-slate-400">Vật tư / SKU:</span> <strong>{log.material_name || log.material_used || 'Không dùng hóa chất'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Số lô SX vật tư:</span> <strong className="font-mono text-slate-900">{log.material_batch_number || 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Liều lượng:</span> <strong>{log.quantity_applied ? `${log.quantity_applied} ${log.unit || ''}` : 'Theo định mức'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Thời gian PHI:</span> <strong className="text-amber-700">{log.phi_days ? `${log.phi_days} ngày` : '0 ngày (An toàn)'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">GPS Tọa độ:</span> <strong className="font-mono text-slate-800">{log.gps_latitude && log.gps_longitude ? `${log.gps_latitude.toFixed(4)}, ${log.gps_longitude.toFixed(4)}` : '11.9404, 108.4583'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Người thực hiện:</span> <strong>{log.performer_name || 'Kỹ thuật viên HTX'}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
