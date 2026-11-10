import React, { useRef } from 'react';
import { Printer, FileText, CheckCircle2 } from 'lucide-react';
import { StockReceipt } from '@/types/inventory';
import { useTenantContextStore } from '@/stores/tenantContextStore';

interface StockReceiptTabVoucherProps {
  receipt: StockReceipt;
}

const num = (n: number) => n.toLocaleString('vi-VN');
const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export const StockReceiptTabVoucher: React.FC<StockReceiptTabVoucherProps> = ({ receipt }) => {
  const { activeCooperative } = useTenantContextStore();
  const isIn = receipt.type === 'IN';
  const totalValue = receipt.qty * (receipt.unitPrice || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Print action bar */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div>
          <p className="text-xs font-bold text-slate-800">
            Xem trước Phiếu {isIn ? 'Nhập kho (Mẫu 01-VT)' : 'Xuất kho (Mẫu 02-VT)'}
          </p>
          <p className="text-[11px] text-slate-400">
            Chuẩn biểu mẫu kế toán áp dụng cho HTX Nông nghiệp (TT 88/2021/TT-BTC).
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          In chứng từ
        </button>
      </div>

      {/* Printable Voucher Paper Mockup */}
      <div className="p-6 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-900 font-serif space-y-4 print:border-none print:shadow-none print:p-0">
        {/* Voucher Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-3 font-sans">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN'}
            </div>
            <div className="text-[11px] text-slate-500">
              Mã số thuế: {activeCooperative?.tax_code || '5801234567'}
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <div className="font-bold">Mẫu số: {isIn ? '01-VT' : '02-VT'}</div>
            <div>(Ban hành theo TT số 88/2021/TT-BTC)</div>
          </div>
        </div>

        {/* Voucher Title */}
        <div className="text-center font-sans py-2">
          <h3 className="text-base font-black tracking-tight uppercase text-slate-900">
            {isIn ? 'PHIẾU NHẬP KHO VẬT TƯ' : 'PHIẾU XUẤT KHO CẤP PHÁT VẬT TƯ'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Số: <strong>{receipt.id}</strong> — Ngày: {receipt.date || new Date().toISOString().slice(0, 10)}
          </p>
        </div>

        {/* Voucher Info */}
        <div className="text-xs space-y-1.5 font-sans">
          <div className="flex justify-between">
            <span className="text-slate-600">
              {isIn ? 'Đơn vị giao hàng / NCC:' : 'Họ và tên người nhận hàng:'}
            </span>
            <span className="font-bold text-slate-900">
              {receipt.memberName || receipt.person || 'Cán bộ kỹ thuật HTX'}
            </span>
          </div>
          {receipt.seasonName && (
            <div className="flex justify-between">
              <span className="text-slate-600">Mùa vụ áp dụng:</span>
              <span className="font-semibold text-slate-800">{receipt.seasonName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Lý do xuất / nhập kho:</span>
            <span className="text-slate-800 italic">{receipt.note || 'Cấp phát phục vụ mùa vụ'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Địa điểm kho:</span>
            <span className="text-slate-800">Kho Trung tâm HTX Tân Tiến</span>
          </div>
        </div>

        {/* Item Table */}
        <table className="w-full text-left text-xs border border-slate-300 font-sans mt-3">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
            <tr>
              <th className="py-2 px-3 border-r border-slate-300 text-center w-10">STT</th>
              <th className="py-2 px-3 border-r border-slate-300">Tên danh mục vật tư</th>
              <th className="py-2 px-3 border-r border-slate-300 text-center w-16">ĐVT</th>
              <th className="py-2 px-3 border-r border-slate-300 text-right w-20">Số lượng</th>
              <th className="py-2 px-3 border-r border-slate-300 text-right w-24">Đơn giá</th>
              <th className="py-2 px-3 text-right w-28">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">1</td>
              <td className="py-2 px-3 border-r border-slate-300 font-semibold">{receipt.itemName}</td>
              <td className="py-2 px-3 text-center border-r border-slate-300">{receipt.unit}</td>
              <td className="py-2 px-3 text-right font-mono font-bold border-r border-slate-300">
                {num(receipt.qty)}
              </td>
              <td className="py-2 px-3 text-right font-mono border-r border-slate-300">
                {receipt.unitPrice ? money(receipt.unitPrice) : '—'}
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                {totalValue > 0 ? money(totalValue) : '—'}
              </td>
            </tr>
          </tbody>
          <tfoot className="border-t border-slate-300 bg-slate-50 font-bold">
            <tr>
              <td colSpan={5} className="py-2 px-3 text-right border-r border-slate-300">
                Tổng cộng:
              </td>
              <td className="py-2 px-3 text-right font-mono text-emerald-800">
                {totalValue > 0 ? money(totalValue) : '—'}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* 4 Signatures */}
        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-sans pt-6">
          <div>
            <div className="font-bold text-slate-800">Người lập phiếu</div>
            <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
            <div className="mt-8 font-semibold text-slate-700">{receipt.person || 'Thủ kho'}</div>
          </div>
          <div>
            <div className="font-bold text-slate-800">{isIn ? 'Người giao' : 'Người nhận'}</div>
            <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
            <div className="mt-8 font-semibold text-slate-700">
              {receipt.memberName || 'Đại diện bên nhận'}
            </div>
          </div>
          <div>
            <div className="font-bold text-slate-800">Thủ kho</div>
            <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
            <div className="mt-8 font-semibold text-slate-700">Thủ kho HTX</div>
          </div>
          <div>
            <div className="font-bold text-slate-800">Giám đốc HTX</div>
            <div className="text-[10px] text-slate-400 italic">(Ký, đóng dấu)</div>
            <div className="mt-8 font-semibold text-slate-700">Ban Giám Đốc</div>
          </div>
        </div>
      </div>
    </div>
  );
};
