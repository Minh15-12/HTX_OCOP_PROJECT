import React from 'react';
import { Member } from '@/types/memberTypes';
import { DataFieldRow } from '../common/DataFieldRow';
import { formatDate } from '@/utils/formatters';
import { MEMBER_TYPE_LABELS } from '@/features/members/constants';
import {
  Coins,
  AlertTriangle,
  ShieldCheck,
  User,
  CreditCard,
  Building2,
  MapPin,
  Sprout,
  FileText,
} from 'lucide-react';

interface MemberTabPersonalProps {
  member: Member;
}

export const MemberTabPersonal: React.FC<MemberTabPersonalProps> = ({ member }) => {
  const creditLimit = member.credit_limit ?? 0;
  const isOverLimit = creditLimit > 0 && member.current_debt > creditLimit;

  // Formatting administrative address if structured fields exist
  const structuredAddress = [member.detail_address, member.ward, member.district, member.province]
    .filter(Boolean)
    .join(', ');
  const displayAddress = member.address || structuredAddress || 'Chưa cập nhật địa chỉ';

  return (
    <div className="space-y-4">
      {/* 3 THẺ TÓM TẮT NHANH (QUICK SUMMARY CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              Vốn thực góp
            </span>
            <span className="text-[11px] font-mono font-bold bg-white px-1.5 py-0.5 rounded text-emerald-700 border border-emerald-200">
              {member.ownership_percentage || 0}% HTX
            </span>
          </div>
          <div className="text-lg font-black text-emerald-950 font-mono tracking-tight">
            {(member.contributed_capital || 0).toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Cam kết: {(member.committed_capital || 0).toLocaleString('vi-VN')} ₫
          </div>
        </div>

        <div
          className={`rounded-xl p-3.5 border flex flex-col justify-between ${
            isOverLimit
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : 'bg-blue-50/70 border-blue-200/80 text-blue-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              {isOverLimit ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              )}
              Dư nợ vật tư
            </span>
            <span
              className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded ${
                isOverLimit ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {isOverLimit ? 'Vượt hạn mức' : 'Trong hạn mức'}
            </span>
          </div>
          <div className="text-lg font-black font-mono tracking-tight">
            {(member.current_debt || 0).toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Hạn mức: {(creditLimit || 0).toLocaleString('vi-VN')} ₫
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Tư cách thành viên
            </span>
          </div>
          <div className="text-sm font-black text-slate-900">
            {MEMBER_TYPE_LABELS[member.member_type] || member.member_type}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gia nhập: {formatDate(member.join_date)}
          </div>
        </div>
      </div>

      {/* CARD 1: THÔNG TIN NHÂN THÂN & CĂN CƯỚC ĐỊNH DANH */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Thông tin nhân thân &amp; Căn cước định danh</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Mã định danh: {member.member_code}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow label="Họ và tên xã viên" value={member.full_name} highlight />
          <DataFieldRow label="Số CCCD / CMND" value={member.cccd} isMono highlight />

          <DataFieldRow
            label="Ngày cấp CCCD"
            value={member.cccd_issue_date ? formatDate(member.cccd_issue_date) : 'Chưa cập nhật'}
            isMono
          />
          <DataFieldRow label="Ngày sinh" value={formatDate(member.dob)} isMono />

          <div className="md:col-span-2">
            <DataFieldRow
              label="Nơi cấp CCCD"
              value={member.cccd_issue_place || 'Cục Cảnh sát QLHC về TTXH'}
            />
          </div>

          <DataFieldRow label="Giới tính" value={member.gender || 'Nam'} />
          <DataFieldRow label="Dân tộc" value={member.ethnicity || 'Kinh'} />

          <DataFieldRow label="Trình độ văn hóa" value={member.education_level || 'THPT'} />
          <DataFieldRow label="Nghề nghiệp chính" value={member.occupation || 'Nông nghiệp'} />

          <div className="md:col-span-2">
            <DataFieldRow
              label="Phân loại quốc tịch"
              value={
                member.is_foreign_investor ? (
                  <span className="text-amber-700 font-semibold">Cá nhân nước ngoài (Trần 30% vốn theo Điều 74 Luật HTX 2023)</span>
                ) : (
                  'Việt Nam'
                )
              }
            />
          </div>
        </div>
      </div>

      {/* CARD 2: TƯ CÁCH THÀNH VIÊN & QUẢN TRỊ HTX (LUẬT HTX 2023) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Tư cách thành viên &amp; Quản trị HTX (Luật HTX 2023)</span>
          </span>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {MEMBER_TYPE_LABELS[member.member_type] || member.member_type}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow label="Mã số xã viên" value={member.member_code} isMono highlight />
          <DataFieldRow
            label="Hợp tác xã trực thuộc"
            value={member.cooperative_name || 'Hợp tác xã Nông nghiệp Tân Tiến'}
          />

          <DataFieldRow
            label="Ngày chính thức gia nhập"
            value={formatDate(member.join_date)}
            isMono
            highlight
          />
          <DataFieldRow
            label="Hạn hoàn thành góp vốn"
            value={
              member.commitment_deadline
                ? formatDate(member.commitment_deadline)
                : 'Đã hoàn thành 100% cam kết'
            }
            isMono
          />

          <DataFieldRow
            label="Hình thức góp vốn ban đầu"
            value={
              member.capital_form === 'TIEN_MAT'
                ? 'Tiền mặt / Chuyển khoản'
                : member.capital_form === 'QUYEN_SU_DUNG_DAT'
                ? 'Quyền sử dụng đất'
                : 'Hiện vật / Máy móc'
            }
          />
          <DataFieldRow
            label="Trạng thái tư cách xã viên"
            value={
              member.status === 'ACTIVE' ? (
                <span className="text-emerald-700 font-bold">Đang hoạt động chính thức</span>
              ) : member.status === 'PENDING' ? (
                <span className="text-amber-700 font-bold">Chờ Đại hội phê chuẩn</span>
              ) : member.status === 'SUSPENDED' ? (
                <span className="text-orange-700 font-bold">Tạm đình chỉ quyền lợi</span>
              ) : (
                <span className="text-slate-600 font-bold">Đã chấm dứt tư cách</span>
              )
            }
          />

          <div className="md:col-span-2">
            <DataFieldRow
              label="Quyền biểu quyết tại Đại hội"
              value={
                member.member_type === 'CHINH_THUC' || member.member_type === 'OFFICIAL'
                  ? '1 phiếu biểu quyết ngang nhau (Điều 21 Luật HTX 2023)'
                  : 'Biểu quyết theo tỷ lệ vốn góp (Xã viên liên kết)'
              }
            />
          </div>

          <div className="md:col-span-2">
            <DataFieldRow
              label="Tỷ lệ chia thặng dư nội bộ"
              value={
                member.profit_share_rate
                  ? `${member.profit_share_rate}% thặng dư theo mức độ sử dụng dịch vụ`
                  : 'Theo tỷ lệ sử dụng dịch vụ nội bộ (tối thiểu 51% theo Luật HTX 2023)'
              }
            />
          </div>
        </div>
      </div>

      {/* CARD 3: THÔNG TIN LIÊN HỆ & ĐỊA CHỈ CƯ TRÚ */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>Thông tin liên hệ &amp; Địa chỉ cư trú</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow label="Số điện thoại di động" value={member.phone} isMono highlight />
          <DataFieldRow
            label="Số Zalo liên hệ"
            value={member.zalo || member.phone || 'Chưa cập nhật'}
            isMono
          />

          <DataFieldRow label="Hộp thư điện tử (Email)" value={member.email || 'Chưa cập nhật'} />
          <DataFieldRow
            label="Kênh liên lạc khác"
            value={member.facebook || 'Không có'}
          />

          <div className="md:col-span-2">
            <DataFieldRow label="Địa chỉ thường trú đầy đủ" value={displayAddress} />
          </div>

          {member.detail_address && (
            <div className="md:col-span-2">
              <DataFieldRow label="Số nhà / Thôn / Ấp" value={member.detail_address} />
            </div>
          )}
          {member.ward && (
            <DataFieldRow label="Xã / Phường / Thị trấn" value={member.ward} />
          )}
          {member.district && (
            <DataFieldRow label="Quận / Huyện" value={member.district} />
          )}
          {member.province && (
            <div className="md:col-span-2">
              <DataFieldRow label="Tỉnh / Thành phố" value={member.province} />
            </div>
          )}
        </div>
      </div>

      {/* CARD 4: NĂNG LỰC SẢN XUẤT NÔNG NGHIỆP & CUNG ỨNG */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Năng lực sản xuất nông nghiệp &amp; Cung ứng</span>
          </span>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            VietGAP / OCOP
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <div className="md:col-span-2">
            <DataFieldRow
              label="Cây trồng / Nông sản chủ lực"
              value={member.main_product || 'Ớt chuông Sweet Palermo Đỏ Đà Lạt'}
              highlight
            />
          </div>

          <DataFieldRow
            label="Quy chuẩn canh tác áp dụng"
            value={member.farming_method || 'VietGAP (TCVN 11892-1:2017)'}
          />
          <DataFieldRow
            label="Kiểm soát an toàn PHI"
            value={
              member.phi_status ? (
                <span className="text-emerald-700 font-bold">{member.phi_status}</span>
              ) : (
                <span className="text-emerald-700 font-bold">Tuân thủ Gate Check PHI</span>
              )
            }
          />

          <div className="md:col-span-2">
            <DataFieldRow
              label="Sản lượng cung ứng cam kết / năm"
              value={
                (member.annual_product_output_kg || 0) > 0
                  ? `${(member.annual_product_output_kg || 0).toLocaleString('vi-VN')} kg nông sản OCOP/năm`
                  : 'Đang xây dựng kế hoạch mùa vụ'
              }
              isMono
              highlight
            />
          </div>

          <div className="md:col-span-2">
            <DataFieldRow
              label="Thửa đất canh tác ngoài đồng"
              value={
                member.member_type === 'LIEN_KET_GOP_VON' || member.member_type === 'LIEN_KET_KHONG_GOP_VON'
                  ? 'Không trực tiếp canh tác (Thành viên liên kết góp vốn / Dịch vụ)'
                  : 'Xem chi tiết giao khoán tại phân hệ Vùng trồng & Thửa đất'
              }
            />
          </div>
        </div>
      </div>

      {/* CARD 5: TÀI KHOẢN NGÂN HÀNG NHẬN CHI TRẢ THẶNG DƯ */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-teal-600" />
            <span>Tài khoản ngân hàng thụ hưởng thặng dư &amp; Cổ tức</span>
          </span>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {member.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <div className="md:col-span-2">
            <DataFieldRow label="Ngân hàng thụ hưởng" value={member.bank_name || 'Chưa cập nhật'} />
          </div>

          <DataFieldRow
            label="Số tài khoản ngân hàng"
            value={member.bank_account || 'Chưa cập nhật'}
            isMono={Boolean(member.bank_account)}
            highlight={Boolean(member.bank_account)}
          />
          <DataFieldRow
            label="Tên chủ tài khoản"
            value={member.account_holder || member.full_name}
          />

          <div className="md:col-span-2">
            <DataFieldRow
              label="Hình thức chi trả lợi nhuận"
              value={
                member.payout_method === 'BANK_TRANSFER'
                  ? 'Chuyển khoản trực tiếp vào tài khoản ngân hàng'
                  : 'Nhận tiền mặt tại quầy thủ quỹ HTX'
              }
            />
          </div>
        </div>
      </div>

      {/* CARD 6: GHI CHÚ HỒ SƠ & ĐƠN ĐĂNG KÝ */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Ghi chú hồ sơ &amp; Cam kết gia nhập</span>
        </h3>

        <p className="text-[13px] text-slate-700 leading-relaxed">
          {member.notes ||
            'Hồ sơ xã viên đầy đủ, cam kết tuân thủ Điều lệ Hợp tác xã, quy chế quản lý vốn điều lệ và phương án sản xuất kinh doanh theo Luật Hợp tác xã 2023.'}
        </p>
      </div>
    </div>
  );
};
