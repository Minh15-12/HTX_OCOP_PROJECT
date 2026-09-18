import React from 'react';
import { Users, Sprout, Warehouse, Coins, ArrowRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-1 max-w-2xl">
            Tình hình xã viên, vùng trồng, kho vật tư, tài chính và tiến độ số hóa hồ sơ OCOP.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-slate-500">Mùa vụ hiện tại:</span>
          <span className="pill-badge pill-green text-[12px] px-3 py-1">Đông Xuân 2025–2026</span>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Members */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-medium">Xã viên hoạt động</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">128</div>
            <div className="text-[11.3px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              4 xã viên chờ duyệt
            </div>
          </div>
        </div>

        {/* Card 2: Zones */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Sprout className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-medium">Diện tích vùng trồng</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">86,4 ha</div>
            <div className="text-[11.3px] text-emerald-600 font-bold mt-0.5">
              14 vùng / 5 loại cây
            </div>
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Warehouse className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-medium">Vật tư dưới ngưỡng tồn</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">2</div>
            <div className="text-[11.3px] text-amber-700 font-bold mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Cần nhập bổ sung
            </div>
          </div>
        </div>

        {/* Card 4: Receivables/Debt */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Coins className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-medium">Công nợ xã viên</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">12,500,000 ₫</div>
            <div className="text-[11.3px] text-purple-700 font-bold mt-0.5">
              Chưa thu hồi
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Panel: OCOP Status Breakdown */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e7e9ec] bg-slate-50/50">
            <div>
              <h3 className="font-bold text-[14.5px] text-slate-900">Tiến độ hồ sơ OCOP theo trạng thái</h3>
              <p className="text-[11.8px] text-slate-500">Đợt đánh giá phân hạng 2026</p>
            </div>
            <button
              onClick={() => navigate('/ocop/dossiers')}
              className="text-emerald-700 hover:text-emerald-800 text-[12.5px] font-bold inline-flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-4">
            <table className="w-full text-left border-collapse text-[12.9px]">
              <thead>
                <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/80">
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Số hồ sơ</th>
                  <th className="py-2.5 px-3 w-[45%]">Tỉ lệ hoán thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <span className="pill-badge pill-amber">Chờ nộp minh chứng</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">2 hồ sơ</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-[11.5px] font-bold text-slate-600">40%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">
                    <span className="pill-badge pill-blue">Đang chấm điểm</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">1 hồ sơ</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-[11.5px] font-bold text-slate-600">75%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">
                    <span className="pill-badge pill-green">Đã chứng nhận OCOP</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">2 hồ sơ</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-[11.5px] font-bold text-slate-600">100%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Trung tâm Nhắc việc & Thao tác Tập trung (Actionable Task Hub) */}
        <div id="task-hub" className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[15px] text-slate-900">Trung tâm Nhắc việc & Thao tác</h3>
                <span className="pill-badge pill-red text-[10.5px]">5 việc cần xử lý</span>
              </div>
              <p className="text-[11.8px] text-slate-500 mt-0.5">Kế hoạch phê duyệt, hoàn vốn, nhập kho & bổ sung hồ sơ</p>
            </div>
          </div>

          <div className="p-4 space-y-4 flex-1">
            <ul className="space-y-3">
              {/* Task Item 1: Hoàn tiền từ chối kết nạp */}
              <li className="p-3 bg-amber-50/60 border border-amber-200/90 rounded-xl space-y-2 hover:border-amber-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="pill-badge pill-red text-[10px]">Cần chi trả</span>
                    <strong className="text-[13px] text-slate-900 font-extrabold">
                      Hoàn tiền vốn nộp lại cho xã viên Võ Văn G (TV008)
                    </strong>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0 font-medium">10 phút trước</span>
                </div>
                <p className="text-[12px] text-slate-600">
                  Hồ sơ bị từ chối kết nạp. Kế toán cần lập Phiếu Chi hoàn trả số tiền tạm thu: <strong className="text-rose-700 font-mono font-bold">10.000.000 ₫</strong>.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                  <span className="text-[11px] text-amber-800 font-semibold">📍 Phân hệ: Quản lý Xã viên & Vốn</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/members')}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      Lập phiếu chi hoàn tiền &rarr;
                    </button>
                  </div>
                </div>
              </li>

              {/* Task Item 2: Duyệt xã viên mới */}
              <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="pill-badge pill-amber text-[10px]">Chờ duyệt</span>
                    <strong className="text-[13px] text-slate-900 font-extrabold">
                      Duyệt đơn gia nhập xã viên Nguyễn Thành Đạt (TV007)
                    </strong>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0 font-medium">Hôm nay</span>
                </div>
                <p className="text-[12px] text-slate-600">
                  Đã hoàn thành hồ sơ đăng ký chính thức & cam kết nộp <strong className="font-mono text-emerald-800">10.000.000 ₫</strong> tiền góp vốn.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-semibold">📍 Người phụ trách: Ban Giám đốc / HĐQT</span>
                  <button
                    onClick={() => navigate('/members')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Xem & Phê duyệt &rarr;
                  </button>
                </div>
              </li>

              {/* Task Item 3: Cảnh báo kho */}
              <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="pill-badge pill-amber text-[10px]">Cảnh báo kho</span>
                    <strong className="text-[13px] text-amber-900 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Phân bón NPK 16-16-8 dưới ngưỡng tồn kho
                    </strong>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0 font-medium">Hôm qua</span>
                </div>
                <p className="text-[12px] text-slate-600">
                  Tồn kho hiện tại còn 150 kg (ngưỡng an toàn tối thiểu là 300 kg). Cần lập phiếu mua bổ sung cho mùa vụ.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-semibold">📍 Phân hệ: Quản lý Kho vật tư</span>
                  <button
                    onClick={() => navigate('/inventory/materials')}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Tạo phiếu nhập kho &rarr;
                  </button>
                </div>
              </li>

              {/* Task Item 5: Cảnh báo Hạn sử dụng Vật tư Sinh học (Luồng mở rộng) */}
              <li className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 hover:border-rose-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="pill-badge pill-red text-[10px]">Cảnh báo HSD</span>
                    <strong className="text-[13px] text-rose-950 font-extrabold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      Chế phẩm Trichoderma Bio-VT sắp hết hạn (15/10/2026)
                    </strong>
                  </div>
                  <span className="text-[10.5px] text-rose-400 shrink-0 font-medium">Mới</span>
                </div>
                <p className="text-[12px] text-slate-600">
                  Còn 45 chai Trichoderma có HSD đến tháng 10/2026. Ưu tiên tạo phiếu xuất cấp cho Vụ Đông Xuân để xử lý rơm rạ & mùn đất.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-rose-200/80">
                  <span className="text-[11px] text-rose-800 font-semibold">📍 Phân hệ: Kho Vật tư & Mùa vụ</span>
                  <button
                    onClick={() => navigate('/inventory/materials')}
                    className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Cấp phát mùa vụ &rarr;
                  </button>
                </div>
              </li>

              {/* Task Item 4: Minh chứng OCOP */}
              <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="pill-badge pill-blue text-[10px]">Hồ sơ OCOP</span>
                    <strong className="text-[13px] text-slate-900 font-extrabold">
                      Bổ sung minh chứng OCOP Trà Oolong Mê Linh
                    </strong>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0 font-medium">2 ngày trước</span>
                </div>
                <p className="text-[12px] text-slate-600">
                  Cần tải bổ sung Giấy chứng nhận ATVSTP & Phiếu xét nghiệm mẫu nước trước ngày 15/09/2026.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-semibold">📍 Phân hệ: Quản lý Hồ sơ OCOP</span>
                  <button
                    onClick={() => navigate('/ocop/dossiers/DOS-2026-001')}
                    className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Tải lên minh chứng &rarr;
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

