import React, { useState } from 'react';
import { MapPin, Search, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landContributionService, LandContribution } from '@/services/landContributionService';
import { exportToExcel } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/ToastNotification';

interface LandContributionsTabProps {
  onOpenAddLandModal?: () => void;
}

export const LandContributionsTab: React.FC<LandContributionsTabProps> = ({ onOpenAddLandModal }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

  const { data: lands = [], isLoading } = useQuery<(LandContribution & { member_name?: string })[]>({
    queryKey: ['land-contributions'],
    queryFn: () => landContributionService.getAllLandContributions(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => landContributionService.deleteLandContribution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['land-contributions'] });
      showToast('Đã xóa hồ sơ góp quyền sử dụng đất thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Không thể xóa hồ sơ đất đai', 'error');
    },
  });

  const totalAreaSqm = lands.reduce((s, l) => s + (Number(l.land_area_sqm) || 0), 0);
  const totalAreaHa = (totalAreaSqm / 10000).toFixed(2);
  const totalValue = lands.reduce((s, l) => s + (Number(l.total_land_value) || 0), 0);
  const notarizedCount = lands.filter((l) => l.cadastral_status === 'NOTARIZED' || l.cadastral_status === 'REGISTERED_CHANGE').length;

  const filteredLands = lands.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (l.member_name && l.member_name.toLowerCase().includes(term)) ||
      (l.land_certificate_no && l.land_certificate_no.toLowerCase().includes(term)) ||
      (l.plot_number && l.plot_number.toLowerCase().includes(term)) ||
      (l.land_use_type && l.land_use_type.toLowerCase().includes(term))
    );
  });

  const handleExportExcel = () => {
    const rows = filteredLands.map((l, idx) => ({
      STT: idx + 1,
      'Xã Viên Đóng Góp': l.member_name || 'Xã viên HTX',
      'Số Giấy CNQSDĐ (Sổ Đỏ)': l.land_certificate_no,
      'Số Thửa': l.plot_number,
      'Số Tờ Bản Đồ': l.map_sheet_number,
      'Diện Tích (m2)': l.land_area_sqm,
      'Loại Đất': l.land_use_type || 'Đất nông nghiệp',
      'Đơn Giá Định Giá (đ/m2)': l.appraised_unit_price,
      'Tổng Giá Trị Góp Vốn (đ)': l.total_land_value,
      'Trạng Thái Pháp Lý': l.cadastral_status === 'REGISTERED_CHANGE' ? 'Đã đăng ký biến động' : l.cadastral_status === 'NOTARIZED' ? 'Đã công chứng' : 'Chờ hoàn thiện',
    }));
    exportToExcel(rows, `dat_dai_gop_von_htx_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4 animate-fade-in text-[13px]">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng diện tích đất đóng góp</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {totalAreaSqm.toLocaleString('vi-VN')} m² ({totalAreaHa} ha)
            </div>
            <div className="text-[10.5px] text-slate-400">{lands.length} thửa đất canh tác</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng giá trị định giá vốn góp</div>
            <div className="text-xl font-black text-blue-700 mt-0.5">
              {totalValue.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-[10.5px] text-blue-600">Quy đổi vào vốn điều lệ HTX</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Pháp lý địa chính</div>
            <div className="text-sm font-black text-slate-800 mt-1">
              {notarizedCount} / {lands.length} thửa hoàn tất
            </div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">Hợp đồng góp vốn công chứng</div>
          </div>
          {onOpenAddLandModal && (
            <button
              type="button"
              onClick={onOpenAddLandModal}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" /> Góp đất mới
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên xã viên, số sổ đỏ, số thửa..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel Danh Sách
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Xã Viên Đóng Góp</th>
                <th className="py-3 px-4">Số Sổ Đỏ (GCNQSDĐ)</th>
                <th className="py-3 px-4">Số Thửa / Số Tờ</th>
                <th className="py-3 px-4 text-right">Diện Tích (m²)</th>
                <th className="py-3 px-4 text-right">Giá Trị Định Giá (₫)</th>
                <th className="py-3 px-4 text-center">Tình Trạng Pháp Lý</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Đang nạp hồ sơ đất đai đóng góp...</td>
                </tr>
              ) : filteredLands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Chưa có hồ sơ góp quyền sử dụng đất</p>
                    <p className="text-xs text-slate-400 mt-0.5">Xã viên có thể góp quyền sử dụng đất nông nghiệp vào HTX theo Luật HTX 2023.</p>
                  </td>
                </tr>
              ) : (
                filteredLands.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{l.member_name || 'Xã viên HTX'}</div>
                      <div className="text-[11px] text-slate-400">{l.land_use_type || 'Đất nông nghiệp'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-800">{l.land_certificate_no || '---'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">
                        Thửa: <strong>{l.plot_number || '---'}</strong> • Tờ: <strong>{l.map_sheet_number || '---'}</strong>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {Number(l.land_area_sqm || 0).toLocaleString('vi-VN')} m²
                    </td>

                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                      {Number(l.total_land_value || 0).toLocaleString('vi-VN')} ₫
                    </td>

                    <td className="py-3 px-4 text-center">
                      {l.cadastral_status === 'REGISTERED_CHANGE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã sang tên / đổi sổ
                        </span>
                      ) : l.cadastral_status === 'NOTARIZED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold">
                          Đã công chứng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Chờ hoàn thiện
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Xác nhận xóa hồ sơ góp quyền sử dụng đất này?')) {
                            deleteMutation.mutate(l.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                        title="Xóa hồ sơ góp đất"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
