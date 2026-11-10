import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CropSeason,
  CropSeasonBomItem,
  fetchSeasonBoms,
  fetchSeasonPlots,
} from '@/services/cropSeasonApi';
import {
  PackageCheck,
  Plus,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Warehouse,
} from 'lucide-react';
import { SeasonBomModal } from '../../modal/SeasonBomModal';
import { ApplyBomPresetModal } from '../../modal/ApplyBomPresetModal';
import { CreateIssueFromBomModal } from '../../modal/CreateIssueFromBomModal';
import { exportSeasonBomToExcel } from '@/utils/excelExporter';

interface CropSeasonTabBomProps {
  season: CropSeason;
  onOpenPrintModal?: () => void;
}

const phaseNames: Record<string, string> = {
  GENERAL: 'Toàn vụ',
  SEEDLING: 'Ươm & Bén rễ',
  VEGETATIVE: 'Sinh dưỡng',
  FLOWERING: 'Ra hoa & Đậu quả',
  FRUITING: 'Nuôi quả & Thu hoạch',
};

export const CropSeasonTabBom: React.FC<CropSeasonTabBomProps> = ({ season, onOpenPrintModal }) => {
  const queryClient = useQueryClient();
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const {
    data: boms = [],
    isLoading,
    refetch,
  } = useQuery<CropSeasonBomItem[]>({
    queryKey: ['seasonBoms', season.id],
    queryFn: () => fetchSeasonBoms(season.id),
    enabled: !!season.id,
  });

  const { data: allocatedPlots = [] } = useQuery({
    queryKey: ['seasonPlots', season.id],
    queryFn: () => fetchSeasonPlots(season.id),
    enabled: !!season.id,
  });

  const totalAllocatedAreaM2 = allocatedPlots.reduce(
    (sum, p) => sum + (Number(p.allocated_area) || 0),
    0
  );

  const totalBudget = boms.reduce((sum, b) => sum + (Number(b.estimated_total_cost) || 0), 0);
  const totalPlannedItems = boms.length;
  const totalIssuedCount = boms.filter((b) => Number(b.issued_quantity) > 0).length;

  return (
    <div className="space-y-4">
      {/* 1. Header Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-800 text-white shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-200">Tổng Ngân sách Vật tư Dự toán</span>
          <div className="text-xl font-black font-mono mt-1">
            {totalBudget.toLocaleString()} VNĐ
          </div>
          <span className="text-[10.5px] text-emerald-300 mt-0.5 block">
            Căn cứ trần tín dụng nội bộ HTX
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">Danh mục Định mức (BOM)</span>
          <div className="text-xl font-black font-mono text-slate-900 mt-1">
            {totalPlannedItems} chủng loại
          </div>
          <span className="text-[10.5px] text-slate-400 mt-0.5 block">
            Giống, Phân bón, Thuốc BVTV, Giá thể
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">Tiến độ Xuất kho Thực tế</span>
          <div className="text-xl font-black font-mono text-emerald-700 mt-1">
            {totalIssuedCount} / {totalPlannedItems} đã xuất
          </div>
          <span className="text-[10.5px] text-slate-400 mt-0.5 block">
            Theo phiếu xuất kho vật tư TT71
          </span>
        </div>
      </div>

      {/* 2. BOM Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Định mức Vật tư Đầu vào (Bill of Materials - BOM)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Thiết lập trần hạn ngạch vật tư trước khi xuất kho cho xã viên nhận khoán.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPresetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs transition cursor-pointer"
              title="Nạp định mức phân bón thuốc BVTV theo khuyến nông VietGAP"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Nạp định mức mẫu</span>
            </button>

            {boms.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold shadow-2xs transition cursor-pointer"
                  title="Tạo phiếu xuất kho Mẫu 02-VT từ định mức BOM"
                >
                  <Warehouse className="w-3.5 h-3.5 text-blue-700" />
                  <span>Đề xuất xuất kho</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportSeasonBomToExcel(season, boms)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold shadow-2xs transition cursor-pointer"
                  title="Xuất dự toán BOM ra file Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                  Xuất Excel
                </button>

                {onOpenPrintModal && (
                  <button
                    type="button"
                    onClick={onOpenPrintModal}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition cursor-pointer"
                    title="In hồ sơ dự toán BOM chuẩn A4"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    In hồ sơ BOM
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => setIsBomModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Lập / Sửa BOM
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải dữ liệu định mức BOM...
          </div>
        ) : boms.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            <PackageCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-600 text-sm">Chưa lập bảng định mức vật tư cho mùa vụ này</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Lập dự toán BOM giúp HTX chủ động nhập hàng và kiểm soát trần xuất nợ vật tư cho xã viên.
            </p>
            <button
              type="button"
              onClick={() => setIsBomModalOpen(true)}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Lập dự toán BOM ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Vật tư &amp; Mã SKU</th>
                  <th className="py-2.5 px-3">Giai đoạn sinh trưởng</th>
                  <th className="py-2.5 px-3 text-right">Định mức / m²</th>
                  <th className="py-2.5 px-3 text-right">Kế hoạch cần</th>
                  <th className="py-2.5 px-3 text-right">Đã xuất kho</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá dự kiến</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boms.map((item) => {
                  const planned = Number(item.planned_quantity || 0);
                  const issued = Number(item.issued_quantity || 0);
                  const isFullyIssued = issued >= planned && planned > 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.material_name || 'Vật tư'}</div>
                        <div className="font-mono text-[10.5px] text-slate-400">{item.sku} &bull; {item.unit}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {phaseNames[item.stage_phase || 'GENERAL'] || item.stage_phase}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-600">
                        {Number(item.standard_rate_per_sqm || 0) > 0 ? Number(item.standard_rate_per_sqm).toFixed(3) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {planned.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">
                        <span className={isFullyIssued ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                          {issued.toLocaleString()} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {Number(item.estimated_unit_price || 0).toLocaleString()} đ
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">
                        {Number(item.estimated_total_cost || 0).toLocaleString()} đ
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100/70 font-bold text-xs">
                  <td colSpan={6} className="py-3 px-3 text-right text-slate-700 uppercase">
                    Tổng chi phí vật tư dự toán:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-900 text-sm">
                    {totalBudget.toLocaleString()} VNĐ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal BOM */}
      <SeasonBomModal
        isOpen={isBomModalOpen}
        onClose={() => setIsBomModalOpen(false)}
        season={season}
        existingBoms={boms}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['seasonBoms', season.id] });
        }}
      />

      {/* Modal Nạp định mức mẫu VietGAP */}
      <ApplyBomPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        season={season}
        totalAllocatedAreaM2={totalAllocatedAreaM2}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['seasonBoms', season.id] });
        }}
      />

      {/* Modal Đề xuất xuất kho từ BOM */}
      <CreateIssueFromBomModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        season={season}
        boms={boms}
        allocatedPlots={allocatedPlots}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['seasonBoms', season.id] });
        }}
      />
    </div>
  );
};

