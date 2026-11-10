import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { exportFarmPlotsToGeoJson } from '../utils/geoUtils';

interface PrintPucMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  productionUnit?: any;
  plots: any[];
}

export const PrintPucMapModal: React.FC<PrintPucMapModalProps> = ({
  isOpen,
  onClose,
  productionUnit,
  plots,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen) return null;

  const coopName =
    activeCooperative?.display_name ||
    activeCooperative?.legal_name ||
    activeCooperative?.short_name ||
    'HỢP TÁC XÃ NÔNG NGHIỆP';
  const unitCode = productionUnit?.unit_code || 'PUC-CHUA-CAP';
  const unitName = productionUnit?.name || 'Vùng sản xuất HTX';
  const unitAddress = productionUnit?.address || activeCooperative?.address || 'Lâm Đồng, Việt Nam';

  const totalAreaM2 = plots.reduce((acc, p) => {
    const a = parseFloat(p.area) || 0;
    return acc + (a < 100 ? a * 10000 : a);
  }, 0);
  const totalAreaHa = (totalAreaM2 / 10000).toFixed(2);
  const totalQuotaKg = plots.reduce((acc, p) => {
    const a = parseFloat(p.area) || 0;
    const m2 = a < 100 ? a * 10000 : a;
    const rate = p.max_yield_rate_per_sqm || 5.0;
    return acc + (p.max_harvest_quota_kg || Math.round(m2 * rate * 1.2));
  }, 0);

  // 1. In trực tiếp (Browser Print)
  const handlePrint = () => {
    window.print();
  };

  // 2. Tải file PDF (.pdf) theo quy định R-SYS-011
  const handleExportPdf = async () => {
    if (!printAreaRef.current) return;
    try {
      setIsExportingPdf(true);
      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `Ho_So_Ma_So_Vung_Trong_${unitCode}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const },
      };
      await html2pdf().set(opt).from(printAreaRef.current).save();
    } catch (err) {
      console.error('Lỗi xuất PDF:', err);
      alert('Không thể tạo file PDF. Vui lòng thử chức năng In Trực Tiếp hoặc Tải Excel.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 3. Tải file Excel (.xlsx) theo quy định R-SYS-011
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan vùng trồng
    const summaryData = [
      ['HỒ SƠ ĐĂNG KÝ VÀ THEO DÕI MÃ SỐ VÙNG TRỒNG (MẪU 01-PUC)'],
      ['Căn cứ Tiêu chuẩn Cục Bảo vệ thực vật TCCS 774:2020/BVTV & TCVN 11892-1:2017 (VietGAP)'],
      [''],
      ['Tên đơn vị chủ quản (HTX):', coopName],
      ['Tên vùng sản xuất:', unitName],
      ['Mã số vùng trồng (PUC Code):', unitCode],
      ['Địa chỉ vùng trồng:', unitAddress],
      ['Tổng số thửa đất canh tác:', plots.length],
      ['Tổng diện tích vùng trồng (m²):', totalAreaM2],
      ['Tổng diện tích quy đổi (ha):', totalAreaHa],
      ['Định mức sản lượng trần sinh thái (kg/vụ):', totalQuotaKg],
      ['Ngày kết xuất dữ liệu:', new Date().toLocaleDateString('vi-VN')],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Thong_Tin_Vung_Trong');

    // Sheet 2: Danh sách chi tiết thửa đất
    const plotHeaders = [
      'STT',
      'Mã thửa đất',
      'Số tờ bản đồ',
      'Số thửa địa chính',
      'Mã địa chính QG',
      'Loại nhà màng / canh tác',
      'Diện tích (ha)',
      'Diện tích (m²)',
      'Định mức suất sinh thái (kg/m²)',
      'Sản lượng trần tối đa (kg/vụ)',
      'Xã viên phụ trách canh tác',
      'Thời hạn HĐ thuê/sử dụng đất',
      'Trạng thái thửa đất',
    ];

    const plotRows = plots.map((p, index) => {
      const assignedMember =
        p.assignments && p.assignments.length > 0
          ? `${p.assignments[0]?.member?.name || 'Xã viên'} (${p.assignments[0]?.member?.code || ''})`
          : 'Chưa phân công';

      const aNum = parseFloat(p.area) || 0;
      const ha = aNum < 100 ? aNum : aNum / 10000;
      const m2 = aNum < 100 ? aNum * 10000 : aNum;
      const quota = p.max_harvest_quota_kg || Math.round(m2 * (p.max_yield_rate_per_sqm || 5.0) * 1.2);

      return [
        index + 1,
        p.plot_code,
        p.land_sheet_number || '—',
        p.land_parcel_number || '—',
        p.national_cadastral_code || '—',
        p.greenhouse_type || 'Nhà màng công nghệ cao',
        ha,
        m2,
        p.max_yield_rate_per_sqm || 5.0,
        quota,
        assignedMember,
        p.land_contract_expired_at || 'Vô thời hạn',
        p.status === 'ACTIVE' ? 'Đang canh tác' : p.status,
      ];
    });

    const wsPlots = XLSX.utils.aoa_to_sheet([plotHeaders, ...plotRows]);
    XLSX.utils.book_append_sheet(wb, wsPlots, 'Danh_Muc_Thua_Dat');

    XLSX.writeFile(wb, `Ho_So_Thua_Dat_Vung_Trong_${unitCode}.xlsx`);
  };

  // 4. Tải file dữ liệu không gian GeoJSON
  const handleExportGeoJson = () => {
    const geoJsonStr = exportFarmPlotsToGeoJson(plots, productionUnit);
    const blob = new Blob([geoJsonStr], { type: 'application/geo+json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ranh_Gioi_Thua_Dat_${unitCode}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl my-4 flex flex-col overflow-hidden max-h-[95vh]">
        {/* Modal Toolbar (Không in ra) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold">Xuất Hồ Sơ Mã Số Vùng Trồng &amp; Thửa Đất (Mẫu 01-PUC)</h2>
              <p className="text-xs text-slate-300">
                Tuân thủ quy chuẩn R-SYS-011 (Đa phương thức xuất cho Laptop/Di động) &amp; R-SYS-012 (Toàn vẹn văn bản)
              </p>
            </div>
          </div>

          {/* Action buttons: Print, PDF, Excel, GeoJSON */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition"
              title="In trực tiếp ra máy in văn phòng"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In Trực Tiếp
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition disabled:opacity-50"
              title="Tải file PDF lưu trữ trên Laptop / Di động (R-SYS-011)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF'}
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition"
              title="Tải file Excel đối soát số liệu (R-SYS-011)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Tải Excel (.xlsx)
            </button>

            <button
              onClick={handleExportGeoJson}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition"
              title="Tải ranh giới GIS GeoJSON phục vụ nộp Cục BVTV / Sở NN&PTNT"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              GeoJSON
            </button>

            <button
              onClick={onClose}
              title="Đóng hộp thoại"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Khung tài liệu in ấn chuẩn A4 - Chống cắt cụt dấu ba chấm theo R-SYS-012 */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-gray-50 flex justify-center">
          <div
            ref={printAreaRef}
            data-pdf-container="true"
            className="w-full max-w-[297mm] bg-white p-6 sm:p-10 shadow-lg border border-gray-200 text-gray-900 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none text-xs leading-relaxed"
          >
            {/* Header Quốc hiệu & Đơn vị chủ quản */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b-2 border-gray-900 mb-6">
              <div>
                <p className="font-bold uppercase tracking-wider text-sm">{coopName}</p>
                <p className="text-[11px] text-gray-600 whitespace-normal break-words">
                  Địa chỉ: {unitAddress}
                </p>
                <p className="text-[11px] font-semibold text-emerald-800">
                  Mã định danh HTX: {activeCooperative?.id ? activeCooperative.id.slice(0, 8).toUpperCase() : 'HTX-LAMDONG'}
                </p>
              </div>
              <div className="text-center">
                <p className="font-bold uppercase tracking-wider text-xs">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-xs font-semibold italic text-gray-700">Độc lập - Tự do - Hạnh phúc</p>
                <p className="text-[11px] text-gray-500 mt-1">-------o0o-------</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h1 className="text-base sm:text-lg font-black uppercase text-gray-900 tracking-wide">
                HỒ SƠ KHẢO SÁT MÃ SỐ VÙNG TRỒNG (MẪU 01-PUC)
              </h1>
              <h2 className="text-xs font-bold uppercase text-emerald-900 mt-1">
                KÈM THUYẾT MINH THỬA ĐẤT &amp; ĐỊNH MỨC SẢN LƯỢNG SINH THÁI
              </h2>
              <p className="text-[11px] italic text-gray-500 mt-0.5">
                (Căn cứ Tiêu chuẩn Cục Bảo vệ thực vật TCCS 774:2020/BVTV, Quyết định 148/QĐ-TTg &amp; TCVN 11892-1:2017)
              </p>
            </div>

            {/* Phần 1: Thông tin vùng trồng */}
            <div className="mb-6 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-950 mb-2 border-b border-gray-200 pb-1">
                I. THÔNG TIN CHUNG VỀ VÙNG TRỒNG NÔNG SẢN
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-gray-500">Tên vùng sản xuất: </span>
                  <span className="font-bold text-gray-900 whitespace-normal break-words">{unitName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mã số vùng trồng (PUC): </span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {unitCode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Địa chỉ vùng canh tác: </span>
                  <span className="font-medium text-gray-900 whitespace-normal break-words">{unitAddress}</span>
                </div>
                <div>
                  <span className="text-gray-500">Cây trồng / Giống đăng ký: </span>
                  <span className="font-bold text-gray-900">Ớt Chuông Đà Lạt (Sweet Pepper F1) / Rau Củ Quả OCOP</span>
                </div>
                <div>
                  <span className="text-gray-500">Tổng quy mô diện tích: </span>
                  <span className="font-bold text-gray-900">
                    {totalAreaM2.toLocaleString('vi-VN')} m² ({totalAreaHa} ha)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Định mức sản lượng trần tối đa: </span>
                  <span className="font-bold text-emerald-800">
                    {totalQuotaKg.toLocaleString('vi-VN')} kg/vụ (50-60 tấn/ha)
                  </span>
                </div>
              </div>
            </div>

            {/* Phần 2: Bảng kê chi tiết thửa đất (Chống cắt cụt theo R-SYS-012) */}
            <div className="mb-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-950 mb-2">
                II. DANH MỤC CÁC THỬA ĐẤT CANH TÁC &amp; ĐỊNH MỨC SUẤT SẢN LƯỢNG
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-300 text-[11px]">
                  <thead>
                    <tr className="bg-emerald-900 text-white">
                      <th className="border border-emerald-800 p-2 font-bold text-center w-10">STT</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[80px]">Mã thửa</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[60px] text-center">Tờ / Thửa</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[110px]">Mã địa chính QG</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[100px]">Loại nhà màng</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[90px] text-right">Diện tích</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[90px] text-right">Trần sản lượng (kg)</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[130px]">Xã viên canh tác</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[80px] text-center">Thời hạn HĐ</th>
                      <th className="border border-emerald-800 p-2 font-bold min-w-[80px] text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {plots.map((plot, idx) => {
                      const assignedMember =
                        plot.assignments && plot.assignments.length > 0
                          ? `${plot.assignments[0]?.member?.name || 'Xã viên'} (${plot.assignments[0]?.member?.code || ''})`
                          : 'Chưa phân công';
                      const aNum = parseFloat(plot.area) || 0;
                      const ha = aNum < 100 ? aNum : aNum / 10000;
                      const m2 = aNum < 100 ? aNum * 10000 : aNum;
                      const quotaKg =
                        plot.max_harvest_quota_kg || Math.round(m2 * (plot.max_yield_rate_per_sqm || 5.0) * 1.2);

                      return (
                        <tr key={plot.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 p-2 text-center font-semibold text-gray-700">
                            {idx + 1}
                          </td>
                          <td className="border border-gray-300 p-2 font-bold font-mono text-emerald-900 whitespace-normal break-words">
                            {plot.plot_code}
                          </td>
                          <td className="border border-gray-300 p-2 text-center whitespace-normal break-words font-mono text-gray-700">
                            {plot.land_sheet_number || '—'} / {plot.land_parcel_number || '—'}
                          </td>
                          <td className="border border-gray-300 p-2 whitespace-normal break-words font-mono text-gray-600 text-[10px]">
                            {plot.national_cadastral_code || 'Chưa liên kết'}
                          </td>
                          <td className="border border-gray-300 p-2 whitespace-normal break-words text-gray-700">
                            {plot.greenhouse_type === 'HIGH_TECH_GREENHOUSE'
                              ? 'Nhà màng Israel cao cấp'
                              : plot.greenhouse_type === 'NET_HOUSE'
                              ? 'Nhà lưới vòm kín'
                              : 'Canh tác ngoài trời'}
                          </td>
                          <td className="border border-gray-300 p-2 text-right font-bold text-gray-900 whitespace-normal break-words">
                            <div>{ha.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ha</div>
                            <div className="text-[10px] font-normal text-gray-500">({m2.toLocaleString('vi-VN')} m²)</div>
                          </td>
                          <td className="border border-gray-300 p-2 text-right font-bold text-emerald-800 whitespace-normal break-words">
                            {quotaKg.toLocaleString('vi-VN')}
                          </td>
                          <td className="border border-gray-300 p-2 whitespace-normal break-words text-gray-800 font-medium">
                            {assignedMember}
                          </td>
                          <td className="border border-gray-300 p-2 text-center whitespace-normal break-words text-[10px] text-gray-600">
                            {plot.land_contract_expired_at || 'Vô thời hạn'}
                          </td>
                          <td className="border border-gray-300 p-2 text-center whitespace-normal break-words">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                plot.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {plot.status === 'ACTIVE' ? 'Hoạt động' : plot.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
                      <td colSpan={5} className="border border-gray-300 p-2 text-right uppercase text-gray-700">
                        Tổng cộng toàn vùng:
                      </td>
                      <td className="border border-gray-300 p-2 text-right text-emerald-950 font-black">
                        {totalAreaM2.toLocaleString('vi-VN')} m²
                      </td>
                      <td className="border border-gray-300 p-2 text-right text-emerald-950 font-black">
                        {totalQuotaKg.toLocaleString('vi-VN')} kg
                      </td>
                      <td colSpan={3} className="border border-gray-300 p-2 text-center text-gray-500 italic">
                        (Dung sai trần sinh thái +20% theo quy chuẩn HTX)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Phần 3: Thuyết minh kiểm toán chống gian lận thương mại */}
            <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-[11px] text-amber-950">
              <h4 className="font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Quy Chế Chống Gian Lận Sản Lượng &amp; Bán Tráo Nông Sản Ngoài Vùng:
              </h4>
              <p className="whitespace-normal break-words leading-relaxed">
                Mọi phiếu cân thu hoạch nông sản vượt quá định mức sinh thái trần nêu trên sẽ tự động bị hệ thống gắn nhãn{' '}
                <strong>⚠️ CẦN ĐỐI SOÁT (NEEDS_RECONCILIATION)</strong>. Phần sản lượng vượt trần bị tạm giữ thanh toán cho đến khi Ban Kiểm soát Hợp tác xã cùng Tổ kỹ thuật thẩm định xác minh nguyên nhân (năng suất đột biến sinh học hoặc tuồn hàng bên ngoài vào để hưởng giá bao tiêu).
              </p>
            </div>

            {/* Phần 4: Chữ ký xác nhận */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-300 text-center text-xs break-inside-avoid">
              <div>
                <p className="font-bold uppercase text-gray-800">CÁN BỘ KỸ THUẬT VÙNG TRỒNG</p>
                <p className="italic text-[10px] text-gray-500">(Ký và ghi rõ họ tên)</p>
                <div className="h-16"></div>
              </div>
              <div>
                <p className="font-bold uppercase text-gray-800">TRƯỞNG BAN KIỂM SOÁT HTX</p>
                <p className="italic text-[10px] text-gray-500">(Ký xác nhận hạn mức trần)</p>
                <div className="h-16"></div>
              </div>
              <div>
                <p className="font-bold uppercase text-gray-800">ĐẠI DIỆN HỘI ĐỒNG QUẢN TRỊ</p>
                <p className="italic text-[10px] text-gray-500">(Ký tên, đóng dấu pháp nhân)</p>
                <div className="h-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
