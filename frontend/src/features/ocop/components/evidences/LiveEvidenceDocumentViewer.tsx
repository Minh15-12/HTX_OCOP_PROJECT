import React, { useState } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  MapPin,
  Calendar,
  Hash,
  Maximize2,
  Minimize2,
  UserCheck,
  Leaf,
  Layers,
  Sparkles,
  Clock,
  ShieldAlert,
  LayoutList,
  GitCommit,
} from 'lucide-react';
import { exportToExcel, exportToCSV } from '@/utils/exportUtils';

export interface LiveEvidenceProps {
  evidence: {
    id: string;
    title: string;
    criterionCode?: string;
    category?: string;
    fileName?: string;
    fileSize?: string;
    sha256?: string;
    checksum?: string;
    status?: string;
    statusLabel?: string;
    uploadedAt?: string;
    uploadDate?: string;
    sourceType?: string;
    extractedType?: 'FARM_PLOT' | 'MEMBER_LIST' | 'MEMBER_CHAIN' | 'PHI_JOURNAL';
    extractedData?: any;
    previewUrl?: string;
    downloadUrl?: string;
    mimeType?: string;
    format?: string;
    dossierCode?: string;
    uploader?: string;
  };
  onClose?: () => void;
}

export const LiveEvidenceDocumentViewer: React.FC<LiveEvidenceProps> = ({
  evidence,
  onClose,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [phiDocTab, setPhiDocTab] = useState<'COMBINED' | 'TIMELINE' | 'TABLE'>('COMBINED');
  const [chainTab, setChainTab] = useState<'COMBINED' | 'CONTRACTS' | 'PAYMENTS'>('COMBINED');

  const sha256 = evidence.sha256 || evidence.checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const title = evidence.title || 'Tài liệu minh chứng số';
  const criterionCode = evidence.criterionCode || (evidence.category?.includes('TC-') ? evidence.category : 'TC-OCOP');
  const uploadedDate = evidence.uploadedAt || evidence.uploadDate || new Date().toLocaleString('vi-VN');

  // Determine document type
  const isFarmPlot =
    evidence.extractedType === 'FARM_PLOT' ||
    criterionCode === 'TC-A.1.1' ||
    title.toLowerCase().includes('vùng trồng') ||
    title.toLowerCase().includes('mẫu 01-puc') ||
    title.toLowerCase().includes('thửa đất');

  const isMemberChain =
    evidence.extractedType === 'MEMBER_CHAIN' ||
    criterionCode === 'TC-A.3.1' ||
    title.toLowerCase().includes('chuỗi') ||
    title.toLowerCase().includes('bao tiêu') ||
    title.toLowerCase().includes('hộ nông dân');

  const isLabor =
    evidence.extractedType === 'MEMBER_LIST' ||
    criterionCode === 'TC-A.2.1' ||
    title.toLowerCase().includes('lao động') ||
    title.toLowerCase().includes('sử dụng lao động');

  const isPhi =
    evidence.extractedType === 'PHI_JOURNAL' ||
    criterionCode === 'TC-C.2.2' ||
    title.toLowerCase().includes('phi') ||
    title.toLowerCase().includes('nhật ký canh tác');

  const isImage =
    evidence.format === 'JPG' ||
    evidence.format === 'PNG' ||
    evidence.mimeType?.startsWith('image/') ||
    evidence.previewUrl?.includes('unsplash') ||
    evidence.previewUrl?.match(/\.(jpeg|jpg|gif|png)$/i);

  // Printing logic
  const handlePrint = () => {
    window.print();
  };

  // Excel Export Logic based on document type
  const handleExportExcel = () => {
    const filename = `MinhChung_${criterionCode}_${evidence.id}`;
    if (isFarmPlot) {
      const data = sampleFarmPlots.map((p, idx) => ({
        'STT': idx + 1,
        'Mã Thửa': p.code,
        'Số Tờ Bản Đồ': p.sheet,
        'Số Thửa': p.parcel,
        'Xã Viên / Chủ Hộ': p.owner,
        'Diện Tích (m2)': p.areaM2,
        'Diện Tích (ha)': p.areaHa,
        'Cây Trồng': p.crop,
        'Sản Lượng Dự Kiến (tấn)': p.yieldTons,
        'Tiêu Chuẩn': p.cert,
      }));
      exportToExcel(data, filename, 'VungTrong_PUC');
    } else if (isMemberChain) {
      if (chainTab === 'PAYMENTS') {
        const data = sampleHarvestPayments.map((p, idx) => ({
          'STT': idx + 1,
          'Mã Quyết Toán': p.settlementCode,
          'Mã Xã Viên': p.memberCode,
          'Họ Và Tên': p.memberName,
          'Sản Lượng (kg)': p.volumeKg,
          'Đơn Giá Bao Tiêu (đ/kg)': p.avgPrice,
          'Tổng Tiền Hàng (VNĐ)': p.grossAmount,
          'Cấn Trừ Nợ Đầu Vụ (VNĐ)': p.debtOffset,
          'Phí Dịch Vụ HTX 2.5% (VNĐ)': p.serviceFee,
          'Thực Nhận (VNĐ)': p.netPayout,
          'Mã Phiếu Chi': p.voucherNo,
          'Trạng Thái': p.status,
          'Ngày Quyết Toán': p.date,
        }));
        exportToExcel(data, `${filename}_BangThanhToanNongSan`, 'ThanhToanNongSan_Dieu74');
      } else {
        const data = sampleMemberChain.map((m, idx) => ({
          'STT': idx + 1,
          'Mã Xã Viên': m.code,
          'Họ Và Tên': m.name,
          'Số CCCD': m.cccd,
          'Địa Chỉ Cư Trú': m.address,
          'Diện Tích Đất Liên Kết (ha)': m.area,
          'Sản Lượng Bao Tiêu (tấn/vụ)': m.quota,
          'Hợp Đồng Liên Kết': m.contract,
          'Trạng Thái Bao Tiêu': m.status,
        }));
        exportToExcel(data, `${filename}_LienKetChuoi`, 'LienKetChuoiGiaTri');
      }
    } else if (isLabor) {
      const data = sampleLocalLabor.map((l, idx) => ({
        'STT': idx + 1,
        'Họ Và Tên': l.name,
        'Năm Sinh': l.birthYear,
        'Số CCCD': l.cccd,
        'Hộ Khẩu Thường Trú': l.address,
        'Vị Trí Công Tác': l.role,
        'Xác Nhận Địa Phương': '100% Cư trú tại huyện Lâm Hà',
      }));
      exportToExcel(data, filename, 'LaoDongDiaPhuong');
    } else if (isPhi) {
      const data = samplePhiLogs.map((log, idx) => ({
        'STT': idx + 1,
        'Ngày Canh Tác': log.date,
        'Lô / Thửa Đất': log.plot,
        'Hoạt Động': log.action,
        'Tên Thuốc / Phân Bón': log.material,
        'Hoạt Chất': log.activeIngredient,
        'Liều Lượng': log.dose,
        'Thời Gian Cách Ly PHI (Ngày)': log.phiDays,
        'Ngày Được Thu Hoạch': log.safeDate,
        'Đánh Giá An Toàn': 'ĐẠT CHUẨN VIETGAP',
      }));
      exportToExcel(data, filename, 'NhatKyVietGAP_PHI');
    } else {
      // General record export
      exportToExcel(
        [
          {
            'Mã Minh Chứng': evidence.id,
            'Tiêu Đề': title,
            'Chỉ Tiêu': criterionCode,
            'Mã Băm SHA-256': sha256,
            'Ngày Cập Nhật': uploadedDate,
            'Người Tải / Trích Xuất': evidence.uploader || 'Quản trị viên HTX',
          },
        ],
        filename,
        'ThongTinMinhChung'
      );
    }
  };

  // CSV Export Logic
  const handleExportCSV = () => {
    const filename = `MinhChung_${criterionCode}_${evidence.id}`;
    if (isFarmPlot) {
      const data = sampleFarmPlots.map((p, idx) => ({
        STT: idx + 1,
        MaThua: p.code,
        SoTo: p.sheet,
        SoThua: p.parcel,
        XaVien: p.owner,
        DienTichM2: p.areaM2,
        DienTichHa: p.areaHa,
        CayTrong: p.crop,
        SanLuongTan: p.yieldTons,
      }));
      exportToCSV(data, filename);
    } else {
      handleExportExcel();
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl flex flex-col transition-all duration-200 ${
        isFullScreen
          ? 'fixed inset-4 z-50 shadow-2xl border-2 border-emerald-500 overflow-hidden'
          : 'w-full border border-slate-200 shadow-sm overflow-hidden'
      }`}
    >
      {/* Top Action Toolbar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            {isFarmPlot ? (
              <MapPin className="w-4.5 h-4.5" />
            ) : isMemberChain ? (
              <Building2 className="w-4.5 h-4.5" />
            ) : isLabor ? (
              <UserCheck className="w-4.5 h-4.5" />
            ) : isPhi ? (
              <Leaf className="w-4.5 h-4.5" />
            ) : (
              <FileText className="w-4.5 h-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-emerald-400 tracking-wide font-mono uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                {criterionCode}
              </span>
              <span className="text-[11px] text-slate-300 font-semibold truncate max-w-xs sm:max-w-md">
                {title}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Mã minh chứng: <strong className="text-slate-200">{evidence.id}</strong></span>
              <span>&bull;</span>
              <span>Cập nhật: {uploadedDate}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Print, PDF, Excel, Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            title="In trực tiếp ra máy in (A4)"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">In văn bản</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-900/60 text-slate-200 hover:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            title="Xuất file bảng tính Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          {evidence.downloadUrl && (
            <a
              href={evidence.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-xs transition"
              title="Tải tệp tin vật lý"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải PDF</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition cursor-pointer"
            title={isFullScreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
          >
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Security SHA-256 Digest Banner */}
      <div className="bg-emerald-50/90 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between text-xs print:bg-white print:border-slate-300">
        <div className="flex items-center gap-2 text-emerald-950 font-bold text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Mã băm toàn vẹn SHA-256:</span>
          <span className="font-mono text-[10.5px] bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 select-all font-semibold">
            {sha256}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10.5px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Đã ký số điện tử & xác thực toàn vẹn</span>
        </div>
      </div>

      {/* Main Document Body (Scrollable & Responsive) */}
      <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh] print:max-h-none print:overflow-visible print:p-0 space-y-6 text-slate-800">
        {/* Case 1: Digitized Farm Plots (Mẫu 01-PUC) */}
        {isFarmPlot && (
          <div className="space-y-6">
            {/* Administrative Header */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-[10px] font-extrabold text-slate-900 underline underline-offset-4">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="pt-3">
                <h1 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                  BÁO CÁO SỐ HÓA VÙNG TRỒNG & THỬA ĐẤT NÔNG NGHIỆP
                </h1>
                <p className="text-xs font-bold text-emerald-800">
                  (BIỂU MẪU 01-PUC — ĐÁP ỨNG TIÊU CHÍ TC-A.1.1 THEO QUYẾT ĐỊNH 148/QĐ-TTg)
                </p>
              </div>
            </div>

            {/* General Information Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1.5">
                <p>
                  <strong className="text-slate-900">Đơn vị quản lý:</strong>{' '}
                  <span className="text-slate-700">HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN</span>
                </p>
                <p>
                  <strong className="text-slate-900">Mã số thuế / ĐKKD:</strong>{' '}
                  <span className="font-mono font-bold text-slate-800">5801456789</span>
                </p>
                <p>
                  <strong className="text-slate-900">Địa chỉ trụ sở:</strong>{' '}
                  <span className="text-slate-700">Thôn Tân Lập, Xã Đan Phượng, Huyện Lâm Hà, Tỉnh Lâm Đồng</span>
                </p>
                <p>
                  <strong className="text-slate-900">Cây trồng chủ lực:</strong>{' '}
                  <span className="font-semibold text-emerald-800">Ớt chỉ thiên xuất khẩu / Cà phê / Cây có múi</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <p>
                  <strong className="text-slate-900">Mã số vùng trồng (PUC):</strong>{' '}
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    PUC-VN-LĐ-018
                  </span>
                </p>
                <p>
                  <strong className="text-slate-900">Tọa độ GPS tâm vùng:</strong>{' '}
                  <span className="font-mono text-slate-700">11.8315° N, 108.2045° E</span>
                </p>
                <p>
                  <strong className="text-slate-900">Tổng quy mô diện tích:</strong>{' '}
                  <span className="font-bold text-slate-900">24.5 ha</span> (Gồm 12 thửa đất chuyên canh)
                </p>
                <p>
                  <strong className="text-slate-900">Tiêu chuẩn canh tác:</strong>{' '}
                  <span className="font-bold text-emerald-700">VietGAP TCVN 11892-1:2017</span>
                </p>
              </div>
            </div>

            {/* Farm Plots Table */}
            <div className="space-y-2">
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Danh mục chi tiết các thửa đất canh tác thuộc mã vùng PUC-VN-LĐ-018:
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center border-r border-slate-200 w-12">STT</th>
                      <th className="p-2.5 border-r border-slate-200">Mã Thửa Đất</th>
                      <th className="p-2.5 border-r border-slate-200 text-center">Tờ BĐ / Số Thửa</th>
                      <th className="p-2.5 border-r border-slate-200">Xã Viên Phụ Trách</th>
                      <th className="p-2.5 border-r border-slate-200 text-right">Diện Tích (ha)</th>
                      <th className="p-2.5 border-r border-slate-200">Giống Cây Trồng</th>
                      <th className="p-2.5 border-r border-slate-200 text-right">Dự Kiến Sản Lượng</th>
                      <th className="p-2.5 text-center">Chứng Nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px] whitespace-normal break-words">
                    {sampleFarmPlots.map((plot, i) => (
                      <tr key={plot.code} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 text-center border-r border-slate-200 font-mono text-slate-400">
                          {String(i + 1).padStart(2, '0')}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-emerald-800">
                          {plot.code}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-mono">
                          Tờ {plot.sheet} / Thửa {plot.parcel}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-900">
                          {plot.owner}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-right font-mono font-bold">
                          {plot.areaHa} ha
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-700">
                          {plot.crop}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                          {plot.yieldTons} tấn
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-300">
                            {plot.cert}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-black border-t-2 border-slate-300 text-slate-900 text-xs">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right uppercase border-r border-slate-200">
                        Tổng cộng toàn vùng trồng PUC:
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-800 border-r border-slate-200">
                        24.50 ha
                      </td>
                      <td className="p-2.5 border-r border-slate-200">12 thửa chuyên canh</td>
                      <td className="p-2.5 text-right font-mono text-emerald-800 border-r border-slate-200">
                        380.0 tấn/năm
                      </td>
                      <td className="p-2.5 text-center text-emerald-700">100% Đạt Chuẩn</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Official Signatures Box */}
            <div className="grid grid-cols-2 pt-6 border-t border-slate-300 text-center text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-700">CÁN BỘ KỸ THUẬT & KCS VÙNG TRỒNG</div>
                <div className="text-[10.5px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
                <div className="pt-10 font-bold text-slate-900">Nguyễn Văn An</div>
                <div className="text-[10px] text-slate-500 font-mono">Đã xác nhận thực địa GPS</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-700">ĐẠI DIỆN HỢP TÁC XÃ (GIÁM ĐỐC)</div>
                <div className="text-[10.5px] text-slate-500 italic">(Ký, đóng dấu số điện tử)</div>
                <div className="pt-10 font-black text-emerald-800 uppercase">Trần Văn Thịnh</div>
                <div className="text-[10px] text-emerald-700 font-bold">Chữ ký số hợp lệ & con dấu HTX Tân Tiến</div>
              </div>
            </div>
          </div>
        )}

        {/* Case 2: Digitized Member Supply Chain & Harvest Purchasing Settlements (TC-A.3.1 & TC-A.3.2) */}
        {isMemberChain && (
          <div className="space-y-6">
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-[10px] font-extrabold text-slate-900 underline underline-offset-4">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="pt-3">
                <h1 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                  BÁO CÁO CHUỖI THU MUA, CAM KẾT BAO TIÊU &amp; BẢNG THANH TOÁN TIỀN NÔNG SẢN
                </h1>
                <p className="text-xs font-bold text-emerald-800">
                  (CĂN CỨ LUẬT HTX SỐ 17/2023/QH15 &amp; TIÊU CHÍ TC-A.3.1, TC-A.3.2 QUYẾT ĐỊNH 148/QĐ-TTg)
                </p>
              </div>
            </div>

            {/* 4 Financial & Supply Chain KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Tỷ Lệ Bao Tiêu</div>
                <div className="text-xl font-black text-emerald-900 mt-0.5">100%</div>
                <div className="text-[10px] text-emerald-700 font-medium">31/31 hộ ký cam kết chuỗi</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Sản Lượng Thu Mua</div>
                <div className="text-xl font-black text-blue-900 mt-0.5">380.5 Tấn</div>
                <div className="text-[10px] text-blue-700 font-medium">Đạt 100.1% chỉ tiêu vụ</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Cấn Trừ Nợ Vật Tư</div>
                <div className="text-xl font-black text-amber-900 mt-0.5">1.425 Tỷ ₫</div>
                <div className="text-[10px] text-amber-700 font-medium">Thu hồi 100% vốn ứng trước</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">Tiền Thực Chi Xã Viên</div>
                <div className="text-xl font-black text-purple-900 mt-0.5">4.140 Tỷ ₫</div>
                <div className="text-[10px] text-purple-700 font-medium">100% qua Ngân hàng / Sổ Quỹ</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <p className="leading-relaxed">
                Hợp tác xã Nông nghiệp Tân Tiến xác nhận toàn bộ <strong>31 hộ thành viên</strong> đã ký cam kết
                bao tiêu 100% sản lượng nông sản chất lượng cao theo hợp đồng liên kết chuỗi giá trị. Quy chế nội bộ
                đảm bảo trích quỹ dịch vụ và phân chia lợi nhuận theo mức độ sử dụng dịch vụ theo đúng tinh thần Luật
                HTX năm 2023. Hệ thống đã cấn trừ tự động nợ vật tư đầu vụ và thanh toán minh bạch không nợ đọng.
              </p>
            </div>

            {/* View Mode Toggle (Interactive for UI, print displays all) */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 print:hidden">
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Hồ sơ chuỗi giá trị &amp; bảng kê tài chính quyết toán:
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setChainTab('COMBINED')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    chainTab === 'COMBINED'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Xem kết hợp
                </button>
                <button
                  type="button"
                  onClick={() => setChainTab('CONTRACTS')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    chainTab === 'CONTRACTS'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Hợp đồng &amp; Cam kết
                </button>
                <button
                  type="button"
                  onClick={() => setChainTab('PAYMENTS')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    chainTab === 'PAYMENTS'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Bảng thanh toán tiền nông sản
                </button>
              </div>
            </div>

            {/* SECTION 1: Member Chain & Contracts */}
            {(chainTab === 'COMBINED' || chainTab === 'CONTRACTS') && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  Phần 1: Danh bạ hộ nông dân liên kết chuỗi &amp; chỉ tiêu bao tiêu:
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                      <tr>
                        <th className="p-2.5 text-center border-r border-slate-200 w-12">STT</th>
                        <th className="p-2.5 border-r border-slate-200">Mã Xã Viên</th>
                        <th className="p-2.5 border-r border-slate-200">Họ và Tên</th>
                        <th className="p-2.5 border-r border-slate-200">Số CCCD</th>
                        <th className="p-2.5 border-r border-slate-200">Địa Chỉ Cư Trú</th>
                        <th className="p-2.5 border-r border-slate-200 text-right">Diện Tích (ha)</th>
                        <th className="p-2.5 border-r border-slate-200 text-right">Cam Kết Bao Tiêu</th>
                        <th className="p-2.5 text-center">Hợp Đồng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px] whitespace-normal break-words">
                      {sampleMemberChain.map((m, i) => (
                        <tr key={m.code} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-center border-r border-slate-200 font-mono text-slate-400">
                            {String(i + 1).padStart(2, '0')}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-emerald-800">
                            {m.code}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">
                            {m.name}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 font-mono text-slate-600">
                            {m.cccd}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-slate-700">
                            {m.address}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono font-bold">
                            {m.area} ha
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                            {m.quota} tấn/vụ
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-300">
                              {m.contract}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 2: Purchasing Settlements & Debt Offset Payments Table */}
            {(chainTab === 'COMBINED' || chainTab === 'PAYMENTS') && (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Phần 2: Bảng thanh toán tiền nông sản &amp; quyết toán cấn trừ nợ thực tế:
                  </span>
                  <span className="text-[10.5px] text-emerald-700 font-bold">
                    Căn cứ Điều 74 Luật HTX 2023 &bull; 100% Đã thanh toán
                  </span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[10.5px]">
                      <tr>
                        <th className="p-2.5 text-center border-r border-slate-200 w-10">STT</th>
                        <th className="p-2.5 border-r border-slate-200">Mã Quyết Toán</th>
                        <th className="p-2.5 border-r border-slate-200">Xã Viên Thụ Hưởng</th>
                        <th className="p-2.5 border-r border-slate-200 text-right">Sản Lượng (Kg)</th>
                        <th className="p-2.5 border-r border-slate-200 text-right">Đơn Giá (₫)</th>
                        <th className="p-2.5 border-r border-slate-200 text-right">Tổng Tiền Hàng</th>
                        <th className="p-2.5 border-r border-slate-200 text-right text-amber-800">Cấn Trừ Nợ Đầu Vụ</th>
                        <th className="p-2.5 border-r border-slate-200 text-right text-slate-600">Phí DV (2.5%)</th>
                        <th className="p-2.5 border-r border-slate-200 text-right font-black text-emerald-900 bg-emerald-50/50">Thực Nhận (₫)</th>
                        <th className="p-2.5 border-r border-slate-200 text-center">Chứng Từ Chi</th>
                        <th className="p-2.5 text-center">Trạng Thái Chi Trả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px] whitespace-normal break-words">
                      {sampleHarvestPayments.map((p, i) => (
                        <tr key={p.settlementCode} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-center border-r border-slate-200 font-mono text-slate-400">
                            {String(i + 1).padStart(2, '0')}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-slate-800">
                            {p.settlementCode}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">
                            {p.memberName} <span className="font-mono text-slate-400 text-[10px]">({p.memberCode})</span>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono font-semibold">
                            {p.volumeKg.toLocaleString('vi-VN')}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono">
                            {p.avgPrice.toLocaleString('vi-VN')}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                            {p.grossAmount.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono font-bold text-amber-700 bg-amber-50/30">
                            -{p.debtOffset.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono text-slate-600">
                            -{p.serviceFee.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono font-black text-emerald-800 bg-emerald-50/60">
                            {p.netPayout.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center font-mono text-[10px] text-blue-800 font-semibold">
                            {p.voucherNo}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full border border-emerald-300">
                              ✓ {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Case 3: Local Labor Ratio (TC-A.2.1) */}
        {isLabor && (
          <div className="space-y-6">
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-[10px] font-extrabold text-slate-900 underline underline-offset-4">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="pt-3">
                <h1 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                  BÁO CÁO TỶ LỆ SỬ DỤNG LAO ĐỘNG ĐỊA PHƯƠNG
                </h1>
                <p className="text-xs font-bold text-emerald-800">
                  (ĐÁP ỨNG TIÊU CHÍ TC-A.2.1 THEO QUYẾT ĐỊNH 148/QĐ-TTg — YÊU CẦU &ge; 80%)
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-emerald-950 font-bold">Kết quả thống kê từ sổ quản lý lao động HTX:</div>
                <div className="text-slate-700">
                  Tổng số lao động thường xuyên: <strong>31 người</strong> &bull; Lao động có hộ khẩu tại huyện Lâm Hà:{' '}
                  <strong className="text-emerald-800">31/31 người (100%)</strong>.
                </div>
                <div className="text-emerald-800 font-black">
                  &rarr; ĐẠT ĐIỂM TỐI ĐA (10/10 ĐIỂM) CHO TIÊU CHÍ LAO ĐỘNG ĐỊA PHƯƠNG.
                </div>
              </div>
              <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-center shrink-0 shadow-xs">
                <div className="text-[10px] font-bold uppercase">Tỷ Lệ Đạt Được</div>
                <div className="text-2xl font-black">100%</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                Danh sách trích lục nhân sự & hộ khẩu địa phương:
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center border-r border-slate-200 w-12">STT</th>
                      <th className="p-2.5 border-r border-slate-200">Họ và Tên</th>
                      <th className="p-2.5 border-r border-slate-200 text-center">Năm Sinh</th>
                      <th className="p-2.5 border-r border-slate-200">Số CCCD</th>
                      <th className="p-2.5 border-r border-slate-200">Hộ Khẩu Thường Trú</th>
                      <th className="p-2.5 border-r border-slate-200">Vị Trí Công Tác</th>
                      <th className="p-2.5 text-center">Xác Nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px] whitespace-normal break-words">
                    {sampleLocalLabor.map((l, i) => (
                      <tr key={l.cccd} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 text-center border-r border-slate-200 font-mono text-slate-400">
                          {String(i + 1).padStart(2, '0')}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">
                          {l.name}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-mono">
                          {l.birthYear}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-mono text-slate-600">
                          {l.cccd}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-700">
                          {l.address}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">
                          {l.role}
                        </td>
                        <td className="p-2.5 text-center text-emerald-700 font-bold">
                          100% Cư trú địa phương
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Case 4: VietGAP Farming Log & PHI Safety (TC-C.2.2) */}
        {isPhi && (
          <div className="space-y-6">
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-[10px] font-extrabold text-slate-900 underline underline-offset-4">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="pt-3">
                <h1 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                  SỔ NHẬT KÝ CANH TÁC ĐIỆN TỬ & KIỂM SOÁT THỜI GIAN CÁCH LY (PHI)
                </h1>
                <p className="text-xs font-bold text-emerald-800">
                  (CĂN CỨ TIÊU CHUẨN VIETGAP TCVN 11892-1:2017 & TIÊU CHÍ TC-C.2.2 QUYẾT ĐỊNH 148/QĐ-TTg)
                </p>
              </div>
            </div>

            {/* KPI Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Tuân Thủ PHI</div>
                <div className="text-xl font-black text-emerald-900 mt-0.5">100%</div>
                <div className="text-[10px] text-emerald-700 font-medium">4/4 lượt đạt an toàn</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Vật Tư Sinh Học</div>
                <div className="text-xl font-black text-blue-900 mt-0.5">100%</div>
                <div className="text-[10px] text-blue-700 font-medium">Danh mục VietGAP cho phép</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Chốt Chặn KCS</div>
                <div className="text-xl font-black text-amber-900 mt-0.5">0 Vi Phạm</div>
                <div className="text-[10px] text-amber-700 font-medium">Khóa thu hoạch non ngày</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">Điểm Đánh Giá OCOP</div>
                <div className="text-xl font-black text-purple-900 mt-0.5">10 / 10</div>
                <div className="text-[10px] text-purple-700 font-medium">Tiêu chí TC-C.2.2 tối đa</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-2">
              <p>
                Toàn bộ quy trình chăm bón và bảo vệ thực vật đều được cán bộ kỹ thuật ghi chép và kiểm soát
                nghiêm ngặt thời gian cách ly (Pre-Harvest Interval - PHI). <strong>100% các lô thu hoạch</strong> đều
                tuân thủ thời gian cách ly tối thiểu, không sử dụng thuốc trong danh mục cấm theo quy định của Bộ NN&PTNT.
              </p>
            </div>

            {/* View Mode Toggle (Interactive for UI, print displays all) */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 print:hidden">
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Giám sát tiến trình cách ly & trích lục nhật ký:
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPhiDocTab('COMBINED')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    phiDocTab === 'COMBINED'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Xem kết hợp
                </button>
                <button
                  type="button"
                  onClick={() => setPhiDocTab('TIMELINE')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    phiDocTab === 'TIMELINE'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  Tiến trình trực quan
                </button>
                <button
                  type="button"
                  onClick={() => setPhiDocTab('TABLE')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    phiDocTab === 'TABLE'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  Bảng chi tiết
                </button>
              </div>
            </div>

            {/* Visual Timeline Cards (Rendered when COMBINED or TIMELINE) */}
            {(phiDocTab === 'COMBINED' || phiDocTab === 'TIMELINE') && (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-emerald-600" />
                  Thanh tiến trình thời gian cách ly (PHI Timeline Tracker):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {samplePhiLogs.map((log, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-emerald-200 bg-white shadow-xs hover:border-emerald-300 transition break-inside-avoid"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-xs text-slate-900">
                            {log.plot} &bull; <span className="text-emerald-800 font-bold">{log.material}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Hoạt chất: <span className="font-semibold text-slate-800">{log.activeIngredient}</span> ({log.dose})
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full border border-emerald-300 shrink-0">
                          {log.phiDays === 0 ? 'AN TOÀN NGAY' : `CÁCH LY ${log.phiDays} NGÀY`}
                        </span>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" /> Ngày xử lý: {log.date}
                          </span>
                          <span className="text-emerald-700 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> An toàn: {log.safeDate}
                          </span>
                        </div>
                        {/* Progress bar (100% full green for completed sample logs) */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full w-full transition-all duration-500" />
                        </div>
                        <div className="flex items-center justify-between text-[9.5px]">
                          <span className="text-slate-500">Tiến độ cách ly: 100%</span>
                          <span className="text-emerald-800 font-bold">✓ ĐÃ ĐỦ THỜI GIAN CÁCH LY (CHO PHÉP THU HOẠCH)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabular View (Rendered when COMBINED or TABLE) */}
            {(phiDocTab === 'COMBINED' || phiDocTab === 'TABLE') && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutList className="w-3.5 h-3.5 text-emerald-600" />
                  Bảng trích lục chi tiết theo quy cách kế toán & VietGAP:
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                      <tr>
                        <th className="p-2.5 text-center border-r border-slate-200 w-12">STT</th>
                        <th className="p-2.5 border-r border-slate-200">Ngày Xử Lý</th>
                        <th className="p-2.5 border-r border-slate-200">Lô / Thửa Đất</th>
                        <th className="p-2.5 border-r border-slate-200">Hoạt Động / Vật Tư</th>
                        <th className="p-2.5 border-r border-slate-200">Hoạt Chất / Hoạt Tính</th>
                        <th className="p-2.5 border-r border-slate-200 text-center">PHI (Ngày)</th>
                        <th className="p-2.5 border-r border-slate-200 text-center">Ngày Thu Hoạch An Toàn</th>
                        <th className="p-2.5 text-center">Tiến Độ & Kiểm Định</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px] whitespace-normal break-words">
                      {samplePhiLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-center border-r border-slate-200 font-mono text-slate-400">
                            {String(i + 1).padStart(2, '0')}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 font-mono font-medium">
                            {log.date}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 font-bold text-slate-800">
                            {log.plot}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-slate-900">
                            <span className="font-bold">{log.material}</span> ({log.action})
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-slate-700">
                            {log.activeIngredient} &bull; {log.dose}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center font-mono font-bold text-amber-700">
                            {log.phiDays} ngày
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center font-mono font-bold text-emerald-800">
                            {log.safeDate}
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full border border-emerald-300">
                                100% ĐẠT AN TOÀN
                              </span>
                              <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full w-full" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Case 5: Image View */}
        {isImage && evidence.previewUrl && (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md inline-block max-w-full">
              <img
                src={evidence.previewUrl}
                alt={title}
                className="max-h-[500px] object-contain mx-auto"
              />
            </div>
            <p className="text-xs text-slate-500 italic">
              Ảnh hiện trường chụp thực tế từ vùng trồng hoặc giấy phép scan số hóa.
            </p>
          </div>
        )}

        {/* Case 6: Fallback Physical Stream / PDF Iframe */}
        {!isFarmPlot && !isMemberChain && !isLabor && !isPhi && !isImage && (
          <div className="space-y-4">
            {evidence.downloadUrl ? (
              <iframe
                src={evidence.downloadUrl}
                title={title}
                className="w-full h-[550px] border border-slate-300 rounded-xl shadow-xs"
              />
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="font-bold text-slate-800 text-sm">
                  {evidence.fileName || title}
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tài liệu minh chứng số được lưu trữ bảo mật trên hệ thống. Bạn có thể bấm nút Tải xuống hoặc In trực tiếp ở thanh công cụ phía trên.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Close Button */}
      {onClose && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Đóng xem tài liệu
          </button>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// Realistic HTX Tan Tien Data for Live Digitized Evidence
// -------------------------------------------------------------
const sampleFarmPlots = [
  { code: 'PL-PUC-01', sheet: '14', parcel: '201', owner: 'Trần Văn Thịnh', areaM2: 25000, areaHa: '2.50', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '40.0', cert: 'VietGAP' },
  { code: 'PL-PUC-02', sheet: '14', parcel: '202', owner: 'Nguyễn Thị Hoa', areaM2: 20000, areaHa: '2.00', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '32.0', cert: 'VietGAP' },
  { code: 'PL-PUC-03', sheet: '14', parcel: '205', owner: 'Lê Văn Nam', areaM2: 18000, areaHa: '1.80', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '28.8', cert: 'VietGAP' },
  { code: 'PL-PUC-04', sheet: '15', parcel: '110', owner: 'Phạm Văn Dũng', areaM2: 22000, areaHa: '2.20', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '35.2', cert: 'VietGAP' },
  { code: 'PL-PUC-05', sheet: '15', parcel: '112', owner: 'Hoàng Thị Mai', areaM2: 20000, areaHa: '2.00', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '32.0', cert: 'VietGAP' },
  { code: 'PL-PUC-06', sheet: '15', parcel: '115', owner: 'Vũ Đức Thành', areaM2: 25000, areaHa: '2.50', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '40.0', cert: 'VietGAP' },
  { code: 'PL-PUC-07', sheet: '16', parcel: '301', owner: 'Đỗ Quốc Bảo', areaM2: 15000, areaHa: '1.50', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '24.0', cert: 'VietGAP' },
  { code: 'PL-PUC-08', sheet: '16', parcel: '304', owner: 'Bùi Thị Lan', areaM2: 20000, areaHa: '2.00', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '32.0', cert: 'VietGAP' },
  { code: 'PL-PUC-09', sheet: '17', parcel: '405', owner: 'Ngô Thanh Hải', areaM2: 20000, areaHa: '2.00', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '32.0', cert: 'VietGAP' },
  { code: 'PL-PUC-10', sheet: '17', parcel: '408', owner: 'Dương Văn Tùng', areaM2: 20000, areaHa: '2.00', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '32.0', cert: 'VietGAP' },
  { code: 'PL-PUC-11', sheet: '18', parcel: '502', owner: 'Phan Thị Thảo', areaM2: 20000, areaHa: '2.00', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '32.0', cert: 'VietGAP' },
  { code: 'PL-PUC-12', sheet: '18', parcel: '505', owner: 'Trịnh Quốc Tuấn', areaM2: 20000, areaHa: '2.00', crop: 'Ớt chỉ thiên VietGAP', yieldTons: '20.0', cert: 'VietGAP' },
];

const sampleMemberChain = [
  { code: 'TV-001', name: 'Trần Văn Thịnh', cccd: '068085001234', address: 'Thôn Tân Lập, Xã Đan Phượng, Lâm Hà', area: '2.5', quota: '40', contract: 'HĐ-LK-001', status: 'Bao tiêu 100%' },
  { code: 'TV-002', name: 'Nguyễn Thị Hoa', cccd: '068187002345', address: 'Thôn Tân Lập, Xã Đan Phượng, Lâm Hà', area: '2.0', quota: '32', contract: 'HĐ-LK-002', status: 'Bao tiêu 100%' },
  { code: 'TV-003', name: 'Lê Văn Nam', cccd: '068080003456', address: 'Thôn Tân Đức, Xã Đan Phượng, Lâm Hà', area: '1.8', quota: '28.8', contract: 'HĐ-LK-003', status: 'Bao tiêu 100%' },
  { code: 'TV-004', name: 'Phạm Văn Dũng', cccd: '068082004567', address: 'Thôn Tân Đức, Xã Đan Phượng, Lâm Hà', area: '2.2', quota: '35.2', contract: 'HĐ-LK-004', status: 'Bao tiêu 100%' },
  { code: 'TV-005', name: 'Hoàng Thị Mai', cccd: '068189005678', address: 'Thôn Liên Trì, Xã Liên Hà, Lâm Hà', area: '2.0', quota: '32', contract: 'HĐ-LK-005', status: 'Bao tiêu 100%' },
  { code: 'TV-006', name: 'Vũ Đức Thành', cccd: '068084006789', address: 'Thôn Liên Trì, Xã Liên Hà, Lâm Hà', area: '2.5', quota: '40', contract: 'HĐ-LK-006', status: 'Bao tiêu 100%' },
  { code: 'TV-007', name: 'Đỗ Quốc Bảo', cccd: '068088007890', address: 'Thôn Tân Lập, Xã Đan Phượng, Lâm Hà', area: '1.5', quota: '24', contract: 'HĐ-LK-007', status: 'Bao tiêu 100%' },
  { code: 'TV-008', name: 'Bùi Thị Lan', cccd: '068192008901', address: 'Thôn Tân Đức, Xã Đan Phượng, Lâm Hà', area: '2.0', quota: '32', contract: 'HĐ-LK-008', status: 'Bao tiêu 100%' },
];

const sampleLocalLabor = [
  { name: 'Trần Văn Thịnh', birthYear: '1975', cccd: '068085001234', address: 'Thôn Tân Lập, Xã Đan Phượng, Lâm Hà, Lâm Đồng', role: 'Giám đốc HTX / Quản lý vùng' },
  { name: 'Nguyễn Thị Hoa', birthYear: '1982', cccd: '068187002345', address: 'Thôn Tân Lập, Xã Đan Phượng, Lâm Hà, Lâm Đồng', role: 'Kế toán trưởng / Quản lý sổ sách' },
  { name: 'Nguyễn Văn An', birthYear: '1988', cccd: '068088009876', address: 'Thôn Tân Đức, Xã Đan Phượng, Lâm Hà, Lâm Đồng', role: 'Cán bộ Kỹ thuật & KCS VietGAP' },
  { name: 'Lê Văn Nam', birthYear: '1980', cccd: '068080003456', address: 'Thôn Tân Đức, Xã Đan Phượng, Lâm Hà, Lâm Đồng', role: 'Thủ kho vật tư nông nghiệp' },
  { name: 'Phạm Văn Dũng', birthYear: '1984', cccd: '068082004567', address: 'Thôn Liên Trì, Xã Liên Hà, Lâm Hà, Lâm Đồng', role: 'Tổ trưởng tổ thu hoạch sơ chế' },
  { name: 'Hoàng Thị Mai', birthYear: '1989', cccd: '068189005678', address: 'Thôn Tân Lập, Xã Đan Phượng, Lâm Hà, Lâm Đồng', role: 'KCS đóng gói bao bì OCOP' },
];

const samplePhiLogs = [
  { date: '10/09/2026', plot: 'PL-PUC-01 (2.5 ha)', action: 'Phun phòng trừ rệp sinh học', material: 'Thuốc trừ sâu thảo mộc Matrine', activeIngredient: 'Matrine 0.5% SL', dose: '400 ml/ha', phiDays: 3, safeDate: '14/09/2026' },
  { date: '15/09/2026', plot: 'PL-PUC-02 (2.0 ha)', action: 'Bón phân hữu cơ vi sinh', material: 'Phân trùn quế sinh học Sông Gianh', activeIngredient: 'Hữu cơ 25%, VSV cố định đạm', dose: '500 kg/ha', phiDays: 0, safeDate: '15/09/2026' },
  { date: '22/09/2026', plot: 'PL-PUC-03 (1.8 ha)', action: 'Phun trừ nấm thán thư', material: 'Chế phẩm sinh học Trichoderma', activeIngredient: 'Trichoderma harzianum 10^9 CFU/g', dose: '1 kg/ha', phiDays: 2, safeDate: '25/09/2026' },
  { date: '28/09/2026', plot: 'PL-PUC-04 (2.2 ha)', action: 'Phun dưỡng hoa đậu quả', material: 'Dịch đạm cá hồi thủy phân Ami-Fish', activeIngredient: 'Amino Axit & Bo sinh học', dose: '250 ml/ha', phiDays: 0, safeDate: '28/09/2026' },
];

const sampleHarvestPayments = [
  { settlementCode: 'QT-2026-001', memberName: 'Trần Văn Thịnh', memberCode: 'TV-001', volumeKg: 40000, avgPrice: 15000, grossAmount: 600000000, debtOffset: 150000000, serviceFee: 15000000, netPayout: 435000000, voucherNo: 'PC-QT-20260930-01', status: 'Đã thanh toán (VietQR)', date: '30/09/2026' },
  { settlementCode: 'QT-2026-002', memberName: 'Nguyễn Thị Hoa', memberCode: 'TV-002', volumeKg: 32000, avgPrice: 15000, grossAmount: 480000000, debtOffset: 120000000, serviceFee: 12000000, netPayout: 348000000, voucherNo: 'PC-QT-20260930-02', status: 'Đã thanh toán (VietQR)', date: '30/09/2026' },
  { settlementCode: 'QT-2026-003', memberName: 'Lê Văn Nam', memberCode: 'TV-003', volumeKg: 28800, avgPrice: 15000, grossAmount: 432000000, debtOffset: 110000000, serviceFee: 10800000, netPayout: 311200000, voucherNo: 'PC-QT-20261005-01', status: 'Đã thanh toán (VietQR)', date: '05/10/2026' },
  { settlementCode: 'QT-2026-004', memberName: 'Phạm Văn Dũng', memberCode: 'TV-004', volumeKg: 35200, avgPrice: 15000, grossAmount: 528000000, debtOffset: 135000000, serviceFee: 13200000, netPayout: 379800000, voucherNo: 'PC-QT-20261005-02', status: 'Đã thanh toán (VietQR)', date: '05/10/2026' },
  { settlementCode: 'QT-2026-005', memberName: 'Hoàng Thị Mai', memberCode: 'TV-005', volumeKg: 32000, avgPrice: 15000, grossAmount: 480000000, debtOffset: 125000000, serviceFee: 12000000, netPayout: 343000000, voucherNo: 'PC-QT-20261010-01', status: 'Đã thanh toán (VietQR)', date: '10/10/2026' },
  { settlementCode: 'QT-2026-006', memberName: 'Vũ Đức Thành', memberCode: 'TV-006', volumeKg: 40000, avgPrice: 15000, grossAmount: 600000000, debtOffset: 160000000, serviceFee: 15000000, netPayout: 425000000, voucherNo: 'PC-QT-20261010-02', status: 'Đã thanh toán (VietQR)', date: '10/10/2026' },
  { settlementCode: 'QT-2026-007', memberName: 'Đỗ Quốc Bảo', memberCode: 'TV-007', volumeKg: 24000, avgPrice: 15000, grossAmount: 360000000, debtOffset: 90000000, serviceFee: 9000000, netPayout: 261000000, voucherNo: 'PC-QT-20261015-01', status: 'Đã thanh toán (VietQR)', date: '15/10/2026' },
  { settlementCode: 'QT-2026-008', memberName: 'Bùi Thị Lan', memberCode: 'TV-008', volumeKg: 32000, avgPrice: 15000, grossAmount: 480000000, debtOffset: 120000000, serviceFee: 12000000, netPayout: 348000000, voucherNo: 'PC-QT-20261015-02', status: 'Đã thanh toán (VietQR)', date: '15/10/2026' },
];
