import React from 'react';
import { Building2, ShieldCheck, Users, FileText, CheckCircle2, MapPin, Phone, Mail, Award } from 'lucide-react';

export const CoopProfilePage: React.FC = () => {
  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-5 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hồ sơ Hợp tác xã Nông nghiệp</h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Thông tin pháp lý, Giấy phép đăng ký kinh doanh &amp; Cơ cấu Ban Quản trị HTX
          </p>
        </div>
        <span className="pill-badge pill-green">Đang hoạt động &bull; Đạt chuẩn OCOP</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info Box */}
        <div className="lg:col-span-2 bg-white border border-[#e7e9ec] rounded-xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center border border-emerald-200">
              HTX
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">HỢP TÁC XÃ NÔNG NGHIỆP TỔNG HỢP</h2>
              <p className="text-[12px] text-slate-500">Giấy phép đăng ký HTX số: 5801234567 do Sở KH&amp;ĐT cấp ngày 15/03/2018</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[12.8px]">
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="font-bold text-slate-800 text-[12px] uppercase">Địa chỉ &amp; Trụ sở</div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thôn 2, Xã Mê Linh, Huyện Lâm Hà, Tỉnh Lâm Đồng</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>02633.888.999 &bull; Hotline: 0987.654.321</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>contact@htxnongnghiep.vn</span>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="font-bold text-slate-800 text-[12px] uppercase">Thông tin vốn &amp; Xã viên</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vốn điều lệ đăng ký:</span>
                <strong className="text-slate-900">2.450.000.000 ₫</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng số xã viên:</span>
                <strong className="text-emerald-800">125 thành viên</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diện tích vùng trồng:</span>
                <strong className="text-slate-900">45,8 Hécta</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Board Members */}
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-5 shadow-subtle space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Ban Quản trị &amp; Ban Kiểm soát
          </h3>
          <div className="space-y-2 text-[12.5px]">
            <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Lê Thị B</div>
                <div className="text-[11px] text-emerald-700 font-semibold">Chủ tịch Hội đồng Quản trị</div>
              </div>
              <span className="pill-badge pill-green text-[10px]">Đại diện pháp luật</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Nguyễn Văn A</div>
                <div className="text-[11px] text-blue-700 font-semibold">Giám đốc Kế toán &amp; Tài chính</div>
              </div>
              <span className="pill-badge pill-blue text-[10px]">Quản trị</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Trần Văn C</div>
                <div className="text-[11px] text-purple-700 font-semibold">Trưởng Ban Kiểm soát</div>
              </div>
              <span className="pill-badge pill-purple text-[10px]">Kiểm soát</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
