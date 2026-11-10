import React from 'react';
import {
  FileText,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Sparkles,
  Info,
  Scale,
  Award,
  Layers,
  Leaf,
  AlertCircle
} from 'lucide-react';
import type { CropSeason } from '@/services/cropSeasonApi';
import type { FarmPlot } from '@/types/agriculture';

interface LogbookCoverTabProps {
  season?: CropSeason;
  plots: FarmPlot[];
  selectedPlotId: string;
  onSelectPlot: (plotId: string) => void;
  onPrintCover: () => void;
}

export const LogbookCoverTab: React.FC<LogbookCoverTabProps> = ({
  season,
  plots,
  selectedPlotId,
  onSelectPlot,
  onPrintCover,
}) => {
  const currentPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];
  const isFrozen = season?.logbook_status === 'FROZEN_ARCHIVED';

  return (
    <div className="space-y-6">
      {/* Banner Trạng thái Sổ Mùa Vụ */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isFrozen
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isFrozen ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-emerald-600 text-white shadow-emerald-200'
          } shadow-md`}>
            {isFrozen ? <ShieldCheck className="w-6 h-6" /> : <Award className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">
                {isFrozen ? 'Sổ Nhật Ký Đã Khóa Đóng Băng (Lưu Trữ Quốc Gia)' : 'Sổ Nhật Ký Canh Tác Điện Tử Đang Hoạt Động'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isFrozen ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'
              }`}>
                {isFrozen ? 'CHỈ ĐỌC (FROZEN)' : 'VIETGAP CHUẨN'}
              </span>
            </div>
            <p className="text-sm opacity-90 mt-0.5">
              Căn cứ pháp lý: VietGAP TCVN 11892-1:2017, TCVN 12850:2019, Thông tư 17/2021/TT-BNNPTNT & Luật Đất đai 2024.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={onPrintCover}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl shadow-sm transition hover:bg-slate-50 text-sm"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            In Bìa Sổ VietGAP (PDF)
          </button>
        </div>
      </div>

      {/* Selector Chọn Thửa Đất Canh Tác */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Lô / Thửa canh tác đang xem:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {plots.map((plot) => (
            <button
              key={plot.id}
              onClick={() => onSelectPlot(plot.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                currentPlot?.id === plot.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Thửa {plot.plot_code}
            </button>
          ))}
        </div>
      </div>

      {/* Grid 4 Thẻ Thông Tin Chuẩn Bìa Sổ Phụ Lục F */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thẻ 1: Thông tin Chủ thể & Mã Vùng Trồng PUC */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">1. Đơn Vị Sản Xuất & Mã Vùng Trồng</h4>
              <p className="text-xs text-slate-500">Chủ thể pháp lý chịu trách nhiệm an toàn thực phẩm</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Hợp tác xã quản lý:</span>
              <span className="font-semibold text-slate-800">HTX Nông Nghiệp Công Nghệ Cao Tân Tiến</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mã Vùng Trồng (Mã PUC):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                  VN-LDO-PUC-0128
                </span>
                <span className="text-xs text-slate-400">(Chính thức)</span>
              </div>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Hộ thành viên / Xã viên:</span>
              <span className="font-semibold text-slate-800">Hộ Nguyễn Văn A (Mã: TV-024)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Số CCCD chủ hộ:</span>
              <span className="font-mono text-slate-700">068095001234 (12 số)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Số điện thoại liên hệ:</span>
              <span className="font-mono text-slate-700">0913.882.194</span>
            </div>
          </div>
        </div>

        {/* Thẻ 2: Thông tin Đất đai & Nhà màng Công nghệ cao */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">2. Hồ Sơ Đất Đai & Cơ Sở Canh Tác</h4>
              <p className="text-xs text-slate-500">Căn cứ Điều 33 Luật Đất đai 2024</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mã thửa nội bộ HTX:</span>
              <span className="font-bold text-slate-800">Thửa {currentPlot?.plot_code || 'THUA-02'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mã định danh CSDL Đất đai 2024:</span>
              <span className="font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                {currentPlot?.national_cadastral_code || '49-302-05-128'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Số tờ bản đồ / Số thửa Sổ đỏ:</span>
              <span className="font-medium text-slate-700">Tờ 05 / Thửa 128 (Lạc Dương, Lâm Đồng)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Diện tích canh tác thực tế:</span>
              <span className="font-semibold text-slate-800">{currentPlot?.area ? (currentPlot.area * 10000).toLocaleString() : '2.000'} m² (0.2 ha)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mô hình / Hình thức canh tác:</span>
              <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                Nhà màng công nghệ cao (Tưới nhỏ giọt Fertigation)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Số lượng túi giá thể / Mật độ:</span>
              <span className="font-semibold text-slate-800">2.500 túi x 2 cây = 5.000 cây (2.5 cây/m²)</span>
            </div>
          </div>
        </div>

        {/* Thẻ 3: Hồ sơ Giống & Tiêu chuẩn Cây giống Xuất vườn */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">3. Giống Cây Trồng & Cây Con Xuất Vườn</h4>
              <p className="text-xs text-slate-500">Kiểm tra nghiệm thu cây giống trước khi trồng</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Tên giống cây trồng:</span>
              <span className="font-bold text-slate-800">{season?.crop || 'Ớt chuông Sweet Palermo Đỏ (F1 Bokken)'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Hãng cung cấp giống / Vườn ươm:</span>
              <span className="font-medium text-slate-700">Công ty TNHH Syngenta Việt Nam / Vườn ươm Đạt Chuẩn</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Ngày gieo hạt / Ngày trồng:</span>
              <span className="text-slate-700">10/01/2026 $\rightarrow$ Xuống giống: {season?.start_date || '15/02/2026'}</span>
            </div>

            {/* Bảng Kiểm tra nghiệm thu cây giống */}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-2">Biên bản nghiệm thu cây con xuất vườn:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Tuổi cây: 30 - 35 ngày</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Chiều cao: 15 - 18 cm</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Số lá thật: 5 - 6 lá</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Rễ trắng khỏe, không thối</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thẻ 4: Kế hoạch Sản lượng, Trần PUC Quota & Bao Tiêu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">4. Kế Hoạch Sản Lượng & Đơn Vị Thu Mua</h4>
              <p className="text-xs text-slate-500">Giám sát trần sản lượng tránh trà trộn ngoài vùng</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Thời gian mùa vụ:</span>
              <span className="font-medium text-slate-800">
                {season?.start_date || '15/02/2026'} $\rightarrow$ {season?.expected_end_date || '15/10/2026'} (8 tháng)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Năng suất thiết kế:</span>
              <span className="font-medium text-slate-700">12.5 kg/m² $\rightarrow$ Dự kiến: 25.000 kg (25 tấn)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Trần sản lượng PUC Quota:</span>
              <div className="text-right">
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs border border-indigo-200">
                  {season?.puc_quota_kg ? `${season.puc_quota_kg.toLocaleString()} kg` : '26.250 kg (105% Max)'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Khóa cân nếu vượt quá trần</p>
              </div>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Đơn vị bao tiêu thu mua:</span>
              <span className="font-semibold text-slate-800">Hệ thống Siêu thị WinCommerce & Xuất khẩu</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Mã cơ sở đóng gói (Mã PHC):</span>
              <span className="font-mono text-slate-700">VN-LDO-PHC-0089</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
