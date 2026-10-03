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

        {/* Right Panel: Actionable To-do / Timeline */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e7e9ec] bg-slate-50/50">
            <h3 className="font-bold text-[14.5px] text-slate-900">Việc cần xử lý ngay</h3>
            <span className="pill-badge pill-red text-[11px]">4 nhắc nhở</span>
          </div>
          <div className="p-4">
            <ul className="space-y-3.5">
              <li className="timeline-item">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900">Duyệt đơn gia nhập xã viên mới</span>
                  <span className="text-[10.8px] text-slate-400">Hôm nay</span>
                </div>
                <p className="text-slate-600 mt-0.5">Xã viên Nguyễn Văn B (Thôn 3) vừa gửi yêu cầu tham gia HTX.</p>
                <button
                  onClick={() => navigate('/members')}
                  className="mt-1 text-[11.5px] text-emerald-700 hover:underline font-bold"
                >
                  Xem đơn gia nhập &rarr;
                </button>
              </li>

              <li className="timeline-item">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Cảnh báo tồn kho Phân bón NPK 16-16-8
                  </span>
                  <span className="text-[10.8px] text-slate-400">Hôm qua</span>
                </div>
                <p className="text-slate-600 mt-0.5">Số lượng còn 150 kg (dưới ngưỡng tối thiểu 300 kg).</p>
                <button
                  onClick={() => navigate('/inventory/materials')}
                  className="mt-1 text-[11.5px] text-emerald-700 hover:underline font-bold"
                >
                  Tạo phiếu nhập kho &rarr;
                </button>
              </li>

              <li className="timeline-item">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900">Bổ sung minh chứng OCOP Trà Oolong</span>
                  <span className="text-[10.8px] text-slate-400">2 ngày trước</span>
                </div>
                <p className="text-slate-600 mt-0.5">Cần tải lên Giấy chứng nhận ATVSTP trước ngày 15/09/2026.</p>
                <button
                  onClick={() => navigate('/ocop/dossiers/DOS-2026-001')}
                  className="mt-1 text-[11.5px] text-emerald-700 hover:underline font-bold"
                >
                  Cập nhật minh chứng &rarr;
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
