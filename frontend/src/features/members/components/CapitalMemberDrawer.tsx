import React, { useState } from 'react';
import { X, MapPin, Eye, QrCode, FileText } from 'lucide-react';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { formatDate } from '@/utils/formatters';

interface CapitalMemberDrawerProps {
  member: Member | null;
  onClose: () => void;
  transactions: CapitalTransaction[];
  onOpenCertificate: (member: Member, targetIssueCount?: number) => void;
  onViewVoucher: (tx: CapitalTransaction) => void;
}

export const CapitalMemberDrawer: React.FC<CapitalMemberDrawerProps> = ({
  member,
  onClose,
  transactions,
  onOpenCertificate,
  onViewVoucher,
}) => {
  const [tab, setTab] = useState<'history' | 'land' | 'certificate'>('history');

  if (!member) return null;

  const memberTxs = transactions.filter(
    (tx) => tx.member_id === member.id || tx.member_code === member.member_code
  );

  const approvedTxs = memberTxs
    .filter((tx) => tx.status === 'APPROVED')
    .sort((a, b) => {
      const dateA = a.contribution_date.includes('/') ? a.contribution_date.split('/').reverse().join('-') : a.contribution_date;
      const dateB = b.contribution_date.includes('/') ? b.contribution_date.split('/').reverse().join('-') : b.contribution_date;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

  const contributed = member.contributed_capital ?? member.total_capital_contributed ?? 0;
  const committed = member.committed_capital ?? member.total_capital_contributed ?? 30000000;
  const pct = committed > 0 ? Math.min(100, Math.round((contributed / committed) * 100)) : 100;

  return (
    <div
      id="capital-drawer-panel"
      className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 space-y-4 animate-fade-in sticky top-16 z-20 max-h-[calc(100vh-140px)] overflow-y-auto"
    >
      <div className="flex items-start justify-between border-b border-[#e7e9ec] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
            {member.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-[15px] text-slate-900">{member.full_name}</h3>
              {contributed >= committed ? (
                <span className="pill-badge pill-green text-[10.5px]">Đã góp đủ</span>
              ) : (
                <span className="pill-badge pill-amber text-[10.5px]">Còn thiếu</span>
              )}
            </div>
            <p className="text-[11.8px] text-slate-500">Mã xã viên: {member.member_code} &bull; Tham gia: {member.join_date}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[11.5px] font-bold text-slate-500">Tổng vốn thực góp:</span>
          <span className="text-lg font-black text-emerald-800">
            {contributed.toLocaleString('vi-VN')} ₫
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 text-[11.8px] border-t border-emerald-200/60">
          <div><span className="text-slate-500">Vốn cam kết:</span> <strong className="text-slate-900">{committed.toLocaleString('vi-VN')} ₫</strong></div>
          <div><span className="text-slate-500">Tỷ lệ sở hữu:</span> <strong className="text-emerald-700">{member.ownership_percentage || 0}%</strong></div>
        </div>
      </div>

      <div className="border-b border-[#e7e9ec] flex gap-3 text-[12px] font-bold overflow-x-auto">
        <button
          onClick={() => setTab('history')}
          className={`pb-2 border-b-2 whitespace-nowrap cursor-pointer ${tab === 'history' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}
        >
          Lịch sử góp vốn ({memberTxs.length})
        </button>
        <button
          onClick={() => setTab('land')}
          className={`pb-2 border-b-2 whitespace-nowrap cursor-pointer ${tab === 'land' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}
        >
          Ruộng đất góp vốn
        </button>
        <button
          onClick={() => setTab('certificate')}
          className={`pb-2 border-b-2 whitespace-nowrap cursor-pointer ${tab === 'certificate' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}
        >
          Giấy chứng nhận
        </button>
      </div>

      {tab === 'history' && (
        <div className="space-y-3">
          {memberTxs.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-4">Chưa có giao dịch góp vốn nào.</div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-[11.8px]">
                <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="py-2 px-2.5">Ngày</th>
                    <th className="py-2 px-2.5">Số tiền</th>
                    <th className="py-2 px-2.5">Hình thức</th>
                    <th className="py-2 px-2.5">Chứng từ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberTxs.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2 px-2.5 text-slate-600">{formatDate(tx.contribution_date)}</td>
                      <td className="py-2 px-2.5 font-bold text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</td>
                      <td className="py-2 px-2.5 text-slate-600">
                        {tx.payment_method === 'CASH' ? 'Tiền mặt' : tx.payment_method === 'LAND' ? 'Ruộng đất (QSDĐ)' : 'Chuyển khoản'}
                      </td>
                      <td className="py-2 px-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewVoucher(tx);
                          }}
                          className="font-mono text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                          title="Nhấn để xem / in file chứng từ"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          {tx.receipt_number || tx.transaction_code || 'PT0001'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'land' && (
        <div className="space-y-3">
          {member.land_contributions && member.land_contributions.length > 0 ? (
            member.land_contributions.map((land, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-[12.8px]">
                  <MapPin className="w-4 h-4" /> Thửa đất số #{idx + 1}
                </div>
                <div className="text-[12px] space-y-1 text-slate-700">
                  <div>Số seri Sổ đỏ: <strong className="font-mono text-slate-900">{land.land_certificate_no}</strong></div>
                  <div>Số thửa: <strong>{land.plot_number}</strong> &bull; Số tờ bản đồ: <strong>{land.map_sheet_number}</strong></div>
                  <div>Diện tích: <strong className="text-emerald-700">{land.land_area_sqm.toLocaleString('vi-VN')} m²</strong> ({land.land_use_type || 'Đất nông nghiệp'})</div>
                  <div>Giá trị định giá: <strong className="text-slate-900">{land.total_land_value.toLocaleString('vi-VN')} ₫</strong> ({land.appraised_unit_price.toLocaleString('vi-VN')} đ/m²)</div>
                  <div className="pt-1"><span className="pill-badge pill-green text-[10px]">Đã đăng ký biến động đất đai sang tên HTX</span></div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-[12.8px]">
                <MapPin className="w-4 h-4" /> Thửa đất nông nghiệp mẫu (QSDĐ)
              </div>
              <div className="text-[12px] space-y-1 text-slate-700">
                <div>Số seri Sổ đỏ: <strong className="font-mono text-slate-900">BD 123456</strong></div>
                <div>Số thửa: <strong>12</strong> &bull; Số tờ bản đồ: <strong>04</strong></div>
                <div>Diện tích đóng góp: <strong className="text-emerald-700">1.500 m²</strong> (Đất trồng trọt OCOP)</div>
                <div>Giá trị định giá HTX: <strong className="text-slate-900">30.000.000 ₫</strong> (20.000 đ/m²)</div>
                <div className="pt-1"><span className="pill-badge pill-green text-[10px]">Đã đăng ký biến động sang tên HTX</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'certificate' && (
        <div className="space-y-3 text-[12px]">
          <div className="text-[11.5px] font-bold text-slate-500 flex justify-between items-center">
            <span>DANH SÁCH GIẤY CHỨNG NHẬN ĐÃ CẤP</span>
            <span className="pill-badge pill-green text-[10px]">Luật HTX 2023</span>
          </div>

          {approvedTxs.length === 0 ? (
            <div className="p-3 border border-emerald-200 bg-emerald-50/40 rounded-xl text-center space-y-2">
              <QrCode className="w-10 h-10 text-emerald-700 mx-auto" />
              <div className="font-extrabold text-slate-900 text-sm">Giấy chứng nhận phần vốn góp điện tử (Lần 1)</div>
              <div className="font-mono text-xs text-emerald-800 font-bold">Số: 01/2025/GCN-HTX</div>
              <button
                onClick={() => onOpenCertificate(member, 1)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Eye className="w-4 h-4" /> Xem trước & In Giấy chứng nhận
              </button>
            </div>
          ) : (
            approvedTxs.map((tx, idx) => {
              const issueNum = idx + 1;
              const isLatest = issueNum === approvedTxs.length;
              const cumulativeAmt = approvedTxs.slice(0, issueNum).reduce((sum, t) => sum + t.amount, 0);

              return (
                <div
                  key={tx.id}
                  className={`p-3 border rounded-xl space-y-2 transition-all ${
                    isLatest ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-[13px]">Giấy chứng nhận Vốn (Lần {issueNum})</span>
                        {isLatest && <span className="pill-badge pill-green text-[9.5px]">Mới nhất</span>}
                      </div>
                      <div className="font-mono text-[11px] text-emerald-800 font-bold">Số: {String(issueNum).padStart(2, '0')}/2025/GCN-HTX</div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">{tx.contribution_date}</span>
                  </div>
                  <div className="text-[11.8px] space-y-0.5 text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-100">
                    <div>Đợt nộp: <strong className="text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</strong> ({tx.payment_method === 'CASH' ? 'Tiền mặt' : tx.payment_method === 'LAND' ? 'Ruộng đất (QSDĐ)' : 'Chuyển khoản'})</div>
                    <div>Tổng lũy kế vốn đã góp: <strong className="text-slate-900">{cumulativeAmt.toLocaleString('vi-VN')} ₫</strong></div>
                  </div>
                  <button
                    onClick={() => onOpenCertificate(member, issueNum)}
                    className={`w-full py-1.5 font-bold text-xs rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      isLatest ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem trước & In GCN Lần {issueNum}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
