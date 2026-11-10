import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Material } from '@/types/inventory';
import { warehouseService, Warehouse } from '@/services/warehouseService';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface MaterialTabWarehousesProps {
  material: Material;
}

export const MaterialTabWarehouses: React.FC<MaterialTabWarehousesProps> = ({ material }) => {
  const { data: warehouses = [], isLoading } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getWarehouses(),
  });

  return (
    <div className="space-y-4">
      {/* Vị trí lưu kho chính */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Điểm kho lưu trữ chính
          </span>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
            {material.warehouseName || 'Kho trung tâm HTX'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Tên điểm kho"
            value={material.warehouseName || 'Kho trung tâm HTX'}
            highlight
          />
          <DataFieldRow
            label="Trạng thái phân bổ"
            value={<span className="text-emerald-700 font-bold">Sẵn sàng xuất kho</span>}
          />
          <DataFieldRow
            label="Tồn kho khả dụng"
            value={`${material.stockQty.toLocaleString('vi-VN')} ${material.unit}`}
            isMono
            highlight
          />
          <DataFieldRow
            label="Định mức an toàn"
            value={`${material.minSafetyStock.toLocaleString('vi-VN')} ${material.unit}`}
            isMono
          />
        </div>
      </div>

      {/* Danh sách hệ thống kho toàn HTX */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span>Hệ thống kho & điểm lưu trữ khả dụng</span>
          <span className="text-[11px] text-slate-400 font-normal">
            {warehouses.length} điểm kho đã đăng ký
          </span>
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải danh sách điểm kho HTX...
          </div>
        ) : warehouses.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
            Chưa có điểm kho nào được thiết lập trong hệ thống.
          </div>
        ) : (
          <div className="space-y-2.5">
            {warehouses.map((wh) => {
              const isAssigned =
                material.warehouseName === wh.name ||
                (!material.warehouseName && wh.warehouse_code.includes('01'));

              return (
                <div
                  key={wh.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isAssigned
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {wh.warehouse_code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{wh.name}</h4>
                        {isAssigned && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Đang lưu trữ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{wh.location || 'Khuôn viên trung tâm HTX'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          wh.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {wh.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
