import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { DataFieldRow } from '../common/DataFieldRow';
import { formatDate } from '@/utils/formatters';
import {
  Printer,
  Award,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Coins,
  FileCheck2,
  Plus,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface MemberTabCapitalProps {
  member: Member;
  transactions?: CapitalTransaction[];
  onPrintVoucher?: (m: Member, tx?: CapitalTransaction) => void;
  onPrintCertificate?: (m: Member, issueCount?: number) => void;
  onRecordCapital?: (m: Member) => void;
}

export const MemberTabCapital: React.FC<MemberTabCapitalProps> = ({
  member,
  transactions = [],
  onPrintVoucher,
  onPrintCertificate,
  onRecordCapital,
}) => {
  const navigate = useNavigate();

  const creditLimit = member.credit_limit ?? 0;
  const isOverCreditLimit = creditLimit > 0 && member.current_debt > creditLimit;

  // Lọc và sắp xếp các đợt nộp vốn của thành viên theo thời gian tăng dần
  const memberTransactions = transactions.filter(
    (t) => t.member_id === member.id || t.member_code === member.member_code
  );

  const sortedTxs = [...memberTransactions].sort((a, b) => {
    const dateA = a.contribution_date?.includes('/')
      ? a.contribution_date.split('/').reverse().join('-')
      : (a.contribution_date || a.recorded_date || '');
    const dateB = b.contribution_date?.includes('/')
      ? b.contribution_date.split('/').reverse().join('-')
      : (b.contribution_date || b.recorded_date || '');
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  const committed = member.committed_capital || 0;
  const contributed = member.contributed_capital || 0;
  const remaining = member.remaining_capital || Math.max(0, committed - contributed);
  const pct = committed > 0 ? Math.min(100, Math.round((contributed / committed) * 100)) : 100;
  const isFullyPaid = member.capital_status === 'DU_VON' || (committed > 0 && contributed >= committed);

  return (
    <div className="space-y-4">
      {/* KHỐI 1: TỔNG QUAN NGHĨA VỤ VỐN & TIẾN ĐỘ CAM KẾT (LUẬT HTX 2023) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Vốn góp &amp; Cổ phần điều lệ</span>
          </h3>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
              isFullyPaid
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {isFullyPaid ? 'Đã đủ vốn cam kết' : 'Còn thiếu vốn'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Vốn cam kết góp"
            value={`${committed.toLocaleString('vi-VN')} ₫`}
            isMono
          />
          <DataFieldRow
            label="Vốn thực góp (Lũy kế)"
            value={`${contributed.toLocaleString('vi-VN')} ₫`}
            isMono
            highlight
          />

          <DataFieldRow
            label="Số vốn còn thiếu"
            value={
              remaining > 0
                ? `${remaining.toLocaleString('vi-VN')} ₫`
                : '0 ₫ (Hoàn tất 100%)'
            }
            isMono
          />
          <DataFieldRow
            label="Tỷ lệ sở hữu HTX"
            value={`${member.ownership_percentage || 0}%`}
            subtitle="Trần luật định: Tối đa 30% vốn điều lệ"
            highlight
          />

          <DataFieldRow
            label="Số cổ phần nắm giữ"
            value={`${(member.total_shares_held || 0).toLocaleString('vi-VN')} Cổ phần`}
            subtitle="Mệnh giá chuẩn: 100.000 ₫/CP"
            isMono
          />
          <DataFieldRow
            label="Hình thức góp vốn"
            value={member.capital_form === 'TIEN_MAT' ? 'Tiền mặt' : 'Hiện vật / Quyền SDĐ'}
          />
        </div>

        {/* Thanh tiến độ góp vốn trực quan */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <span>Tiến độ hoàn thành nghĩa vụ vốn cam kết:</span>
              <span className={isFullyPaid ? 'text-emerald-700 font-black' : 'text-amber-700 font-black'}>
                {pct}%
              </span>
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              {isFullyPaid ? (
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất 100%
                </span>
              ) : (
                'Thời hạn tối đa 06 tháng (Điều 74 Luật HTX 2023)'
              )}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isFullyPaid ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-emerald-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Nút hành động nhanh của Khối 1 */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">
            Chứng thực cổ phần theo Luật HTX 2023
          </span>
          <div className="flex items-center gap-2">
            {onRecordCapital && !isFullyPaid && (
              <button
                type="button"
                onClick={() => onRecordCapital(member)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Ghi nhận nộp vốn đợt tiếp theo cho xã viên này"
              >
                <Plus className="w-3.5 h-3.5" />
                Thu vốn đợt mới
              </button>
            )}
            {onPrintCertificate && (
              <button
                type="button"
                onClick={() => onPrintCertificate(member)}
                className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="In Giấy chứng nhận phần vốn góp mới nhất"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                In GCN vốn góp mới nhất (A4)
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(`/capital?member_id=${member.id}`)}
              className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              Mở Sổ vốn điều lệ <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KHỐI 2: LỊCH SỬ CÁC ĐỢT GÓP VỐN & GIẤY CHỨNG NHẬN TỪNG LẦN (TIMELINE) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Lịch sử các đợt nộp vốn &amp; Cấp GCN từng lần ({sortedTxs.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mỗi đợt nộp tiền được HTX cấp Phiếu thu và cập nhật Giấy chứng nhận phần vốn góp theo Điều 77 Luật HTX 2023.
            </p>
          </div>
          {onRecordCapital && !isFullyPaid && (
            <button
              type="button"
              onClick={() => onRecordCapital(member)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm đợt nộp
            </button>
          )}
        </div>

        {sortedTxs.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50/60 rounded-xl border border-slate-100 space-y-2">
            <p>Chưa có đợt nộp tiền nào được ghi nhận cho xã viên này.</p>
            {onRecordCapital && (
              <button
                type="button"
                onClick={() => onRecordCapital(member)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Ghi nhận đợt nộp vốn đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTxs.map((tx, index) => {
              const issueCount = index + 1;
              const cumulativeAmount = sortedTxs
                .slice(0, issueCount)
                .reduce((sum, t) => sum + t.amount, 0);
              const cumulativePct =
                committed > 0 ? Math.min(100, Math.round((cumulativeAmount / committed) * 100)) : 100;

              return (
                <div
                  key={tx.id || `tx-${index}`}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-emerald-50/20 transition-all space-y-2.5"
                >
                  {/* Top row: Đợt & Số tiền */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ĐỢT {issueCount}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Cấp GCN lần thứ {issueCount}
                      </span>
                      {tx.status === 'APPROVED' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Đã ghi sổ
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Chờ duyệt
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        +{tx.amount.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>

                  {/* Middle row: Thông tin chi tiết đợt */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11.5px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Ngày nộp tiền</span>
                      <span className="font-mono font-medium text-slate-800">
                        {formatDate(tx.contribution_date || tx.recorded_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Hình thức</span>
                      <span className="font-medium text-slate-800">
                        {tx.payment_method === 'CASH'
                          ? 'Tiền mặt'
                          : tx.payment_method === 'BANK_TRANSFER'
                          ? 'Chuyển khoản'
                          : tx.payment_method === 'LAND'
                          ? 'Đất đai (QSDĐ)'
                          : 'Hiện vật / Tài sản'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Số phiếu thu</span>
                      <span className="font-mono font-bold text-slate-700">
                        {tx.receipt_number || tx.transaction_code || `PT-${issueCount}`}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-1.5 border-t border-slate-50 flex flex-wrap items-center justify-between text-[11px] gap-1">
                      <span className="text-slate-500">
                        Lũy kế sau đợt này:{' '}
                        <strong className="font-mono text-slate-900">
                          {cumulativeAmount.toLocaleString('vi-VN')} ₫
                        </strong>{' '}
                        <span className="text-emerald-700 font-bold">({cumulativePct}% cam kết)</span>
                      </span>
                      {tx.notes && (
                        <span className="text-slate-400 italic truncate max-w-[220px]" title={tx.notes}>
                          {tx.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons row: BỘ ĐÔI CHỨNG TỪ (Phiếu thu + Giấy chứng nhận đợt đó) */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-0.5">
                    {onPrintVoucher && (
                      <button
                        type="button"
                        onClick={() => onPrintVoucher(member, tx)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title={`In phiếu thu đợt ${issueCount}`}
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>In Phiếu thu ({tx.receipt_number || `PT-${issueCount}`})</span>
                      </button>
                    )}
                    {onPrintCertificate && (
                      <button
                        type="button"
                        onClick={() => onPrintCertificate(member, issueCount)}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title={`Xem & In Giấy chứng nhận phần vốn góp cấp lần thứ ${issueCount}`}
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>In GCN Cấp Lần {issueCount} (A4)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KHỐI 3: RUỘNG ĐẤT GÓP VỐN (NẾU CÓ) */}
      {member.land_contributions && member.land_contributions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Ruộng đất &amp; QSDĐ góp vốn ({member.land_contributions.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Công chứng &amp; Định giá theo Luật Đất đai &amp; Luật HTX 2023
            </span>
          </div>

          <div className="space-y-2">
            {member.land_contributions.map((land, idx) => (
              <div
                key={land.id || idx}
                className="p-3 bg-slate-50/50 rounded-lg border border-slate-200/80 text-xs space-y-1"
              >
                <div className="flex justify-between items-start font-bold text-slate-800">
                  <span>Thửa đất số: {land.plot_number || 'N/A'} (Tờ bản đồ số: {land.map_sheet_number || 'N/A'})</span>
                  <span className="font-mono text-emerald-700">{(land.total_land_value || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  <span>Diện tích: {(land.land_area_sqm || 0).toLocaleString('vi-VN')} m²</span>
                  {land.land_certificate_no && (
                    <span className="ml-3">Sổ đỏ số: <strong className="text-slate-700">{land.land_certificate_no}</strong></span>
                  )}
                  {land.land_use_type && (
                    <span className="ml-3">Loại đất: <span className="text-slate-700">{land.land_use_type}</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KHỐI 4: THÔNG TIN DƯ NỢ VẬT TƯ (TINH GỌN) */}
      {member.current_debt > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isOverCreditLimit ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">Dư nợ vật tư đầu vụ: </span>
              <span className="font-mono font-bold text-rose-700">
                {member.current_debt.toLocaleString('vi-VN')} ₫
              </span>
              <span className="text-[11px] text-amber-700 ml-1.5">
                (Hạn mức nợ tối đa cho phép: {creditLimit.toLocaleString('vi-VN')} ₫)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/finance')}
            className="text-[11.5px] font-bold text-amber-900 hover:underline shrink-0 cursor-pointer"
          >
            Xem sổ công nợ &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberTabCapital;
