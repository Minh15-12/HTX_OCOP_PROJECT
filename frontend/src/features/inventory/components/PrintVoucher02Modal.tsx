import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Printer, Download, FileSpreadsheet, X, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Voucher02Data } from '../../../types/inventory';
import { exportPdfFromElement } from '../../../utils/pdfExportUtils';
import { useTenantContextStore } from '@/stores/tenantContextStore';

interface PrintVoucher02ModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherData: Voucher02Data | null;
  isLoading?: boolean;
}

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const PrintVoucher02Modal: React.FC<PrintVoucher02ModalProps> = ({
  isOpen,
  onClose,
  voucherData,
  isLoading = false,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Chuẩn hóa dữ liệu tương thích linh hoạt giữa Backend & Frontend
  const vNumber = voucherData?.voucher_number || (voucherData as any)?.issue_number || 'PXK-02';
  const coopName =
    activeCooperative?.display_name ||
    activeCooperative?.legal_name ||
    voucherData?.cooperative?.name ||
    (voucherData?.cooperative as any)?.legal_name ||
    'HỢP TÁC XÃ NÔNG NGHIỆP';
  const coopAddress =
    activeCooperative?.address ||
    voucherData?.cooperative?.address ||
    (voucherData?.cooperative as any)?.address ||
    'Lâm Đồng, Việt Nam';
  const coopTax =
    activeCooperative?.tax_code ||
    voucherData?.cooperative?.tax_code ||
    (voucherData?.cooperative as any)?.tax_code ||
    '—';
  const recipientName = voucherData?.recipient?.member_name || (voucherData?.recipient as any)?.full_name || 'Hộ Xã viên';
  const recipientCode = voucherData?.recipient?.member_code || (voucherData?.recipient as any)?.member_code || '';
  const recipientPlot = voucherData?.recipient?.farm_plot_name || (voucherData?.recipient as any)?.address || 'Vùng chuyên canh nông nghiệp công nghệ cao';
  const warehouseName = voucherData?.warehouse?.name || (voucherData as any)?.export_warehouse || 'Kho Vật tư Trung tâm HTX';
  const issueDate = voucherData?.issue_date || new Date().toISOString().slice(0, 10);
  const isCredit = Boolean(voucherData?.is_credit);
  const note = voucherData?.note || (voucherData as any)?.purpose || '';

  const rawItems: any[] = voucherData?.items || (voucherData as any)?.lines || [];
  const normalizedItems = rawItems.map((it: any) => ({
    name: it.material_name || it.name || 'Vật tư nông nghiệp',
    code: it.material_code || it.sku || 'VT-01',
    account_code: it.account_code || '1521',
    unit: it.unit || 'kg',
    quantity: Number(it.quantity || it.quantity_issued || 0),
    unit_price: Number(it.unit_price || 0),
    amount: Number(it.amount || it.line_amount || 0),
    is_durable_tool: Boolean(it.is_durable_tool || it.account_code === '1525' || it.account_code === '005'),
  }));

  const totalAmount = Number(voucherData?.total_amount || normalizedItems.reduce((s, it) => s + it.amount, 0));
  const totalInWords = voucherData?.total_amount_in_words || `${totalAmount.toLocaleString('vi-VN')} đồng chẵn`;
  const signers = voucherData?.signers || {};

  // 1. Thao tác In trực tiếp qua Print Dialog của Trình duyệt (hỗ trợ in ra máy in hoặc Save as PDF)
  const handlePrint = () => {
    window.print();
  };

  // 2. Thao tác Tải file Excel (.xlsx format) cho người dùng làm việc trên laptop
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const headers = [
      'STT',
      'Tên nhãn hiệu quy cách vật tư',
      'Mã số',
      'TK Kế toán',
      'ĐVT',
      'Số lượng',
      'Đơn giá (VNĐ)',
      'Thành tiền (VNĐ)',
      'Loại nông cụ',
    ];

    const rows = normalizedItems.map((item, index) => [
      index + 1,
      item.name,
      item.code,
      item.account_code,
      item.unit,
      item.quantity,
      item.unit_price,
      item.amount,
      item.is_durable_tool ? 'CCDC lâu bền (TK 005)' : 'Tiêu hao (TK 152)',
    ]);

    rows.push([
      '',
      'CỘNG TỔNG GIÁ TRỊ VẬT TƯ',
      '',
      '',
      '',
      '',
      '',
      totalAmount,
      '',
    ]);

    const titleRows = [
      ['MẪU SỐ 02 - VT: PHIẾU XUẤT KHO KIÊM SỔ CHIA VẬT TƯ TẬP TRUNG'],
      ['(Ban hành theo Thông tư số 71/2024/TT-BTC ngày 07/10/2024 của Bộ Tài chính)'],
      [`Hợp tác xã: ${coopName} | MST: ${coopTax}`],
      [`Địa chỉ: ${coopAddress}`],
      [`Số phiếu: ${vNumber} | Ngày xuất: ${issueDate}`],
      [`Người nhận hàng: ${recipientName} (${recipientCode || '—'}) | Vùng trồng: ${recipientPlot}`],
      [`Hình thức: ${isCredit ? 'Ứng nợ đầu vụ (Credit Advance)' : 'Bán vật tư'} | Kho xuất: ${warehouseName}`],
      [`Lý do: ${note || 'Cấp phát vật tư nông nghiệp'}`],
      [''],
      headers,
      ...rows,
      [''],
      [`Số tiền viết bằng chữ: ${totalInWords}`],
    ];

    const ws = XLSX.utils.aoa_to_sheet(titleRows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 32 },
      { wch: 14 },
      { wch: 14 },
      { wch: 10 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_02_VT');
    XLSX.writeFile(wb, `Mau_02_VT_${vNumber}_${issueDate.replace(/[\/\\]/g, '-')}.xlsx`);
  };

  // 3. Tải PDF: Kích hoạt xuất tệp PDF thực sự (.pdf)
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      setIsExportingPdf(true);
      await exportPdfFromElement(
        printRef.current,
        `Mau_02_VT_${vNumber}_${issueDate.replace(/[\/\\]/g, '-')}.pdf`,
        {
          format: 'a4',
          orientation: 'portrait',
          scale: 2,
        }
      );
    } catch (err: any) {
      console.error('Lỗi khi xuất PDF:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      {/* Container modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Header hành động (Ẩn khi in ấn) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              02
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Chứng Từ Mẫu 02-VT — Phiếu Xuất Kho Kiêm Sổ Chia Vật Tư
              </h2>
              <p className="text-[11px] text-slate-500">
                Tuân thủ Chế độ Kế toán Hợp tác xã theo Thông tư số 71/2024/TT-BTC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút In trực tiếp */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
              title="In trực tiếp ra máy in hoặc Lưu dưới dạng PDF (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu</span>
            </button>

            {/* Nút Tải file PDF */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              title="Lưu trữ tài liệu dưới dạng file PDF tải về máy"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải file PDF'}</span>
            </button>

            {/* Nút Tải file Excel cho người dùng sử dụng laptop */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
              title="Xuất bảng kê phân bổ chia vật tư chi tiết ra file Excel (.csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tải Excel</span>
            </button>

            {/* Nút Đóng */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung Mẫu số 02-VT (Phù hợp in ấn khổ giấy A4) */}
        <div ref={printRef} data-pdf-container="true" className="p-8 sm:p-12 text-slate-900 bg-white print:p-4 text-xs font-serif leading-relaxed">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 font-sans">
              Đang kết xuất chứng từ Mẫu 02-VT...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tiêu đề & Căn cứ Thông tư 71 */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="font-bold uppercase text-[12px]">{coopName}</p>
                  <p className="text-[11px] text-slate-600">Địa chỉ: {coopAddress}</p>
                  <p className="text-[11px] text-slate-600">Mã số thuế: {coopTax}</p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-bold text-[11px]">Mẫu số 02 - VT</p>
                  <p className="text-[10px] text-slate-600 italic max-w-[260px]">
                    (Ban hành theo Thông tư số 71/2024/TT-BTC ngày 07/10/2024 của Bộ Tài chính)
                  </p>
                  <p className="text-[11px] font-mono font-bold text-emerald-800">Số: {vNumber}</p>
                </div>
              </div>

              {/* Tên chứng từ */}
              <div className="text-center pt-2">
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-950 font-sans">
                  PHIẾU XUẤT KHO
                </h1>
                <p className="text-xs italic font-serif text-slate-700 mt-0.5">
                  (Kiêm Sổ chia vật tư tập trung cho hộ xã viên)
                </p>
                <p className="text-xs italic text-slate-600 mt-1">
                  Ngày xuất: {issueDate}
                </p>
              </div>

              {/* Thông tin đối tượng nhận vật tư */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs border-y border-slate-300 py-3 font-sans">
                <div>
                  <span className="font-semibold text-slate-700">Họ và tên người nhận hàng: </span>
                  <span className="font-bold text-slate-950">{recipientName}</span>
                  {recipientCode && (
                    <span className="text-slate-500 font-mono text-[11px]"> ({recipientCode})</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Hình thức xuất: </span>
                  <span className="font-bold text-emerald-900">
                    {isCredit ? '⚡ Cấp ứng nợ đầu vụ (Credit Advance)' : '💵 Bán thanh toán ngay'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Vùng trồng / Nhà màng: </span>
                  <span className="font-medium text-slate-900">{recipientPlot}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Xuất tại kho: </span>
                  <span className="font-medium text-slate-900">{warehouseName}</span>
                </div>
                {note && (
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-700">Lý do xuất kho: </span>
                    <span className="italic text-slate-800">{note}</span>
                  </div>
                )}
              </div>

              {/* Bảng danh sách vật tư chi tiết */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-800 text-center text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900">
                      <th className="border border-slate-800 p-2 w-10">STT</th>
                      <th className="border border-slate-800 p-2 text-left">Tên, nhãn hiệu, quy cách vật tư</th>
                      <th className="border border-slate-800 p-2 w-24">Mã số</th>
                      <th className="border border-slate-800 p-2 w-20">TK Kế toán</th>
                      <th className="border border-slate-800 p-2 w-16">ĐVT</th>
                      <th className="border border-slate-800 p-2 w-20">Số lượng</th>
                      <th className="border border-slate-800 p-2 w-28 text-right">Đơn giá</th>
                      <th className="border border-slate-800 p-2 w-32 text-right">Thành tiền</th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] text-slate-600 italic">
                      <td className="border border-slate-800 p-1">A</td>
                      <td className="border border-slate-800 p-1">B</td>
                      <td className="border border-slate-800 p-1">C</td>
                      <td className="border border-slate-800 p-1">D</td>
                      <td className="border border-slate-800 p-1">E</td>
                      <td className="border border-slate-800 p-1">1</td>
                      <td className="border border-slate-800 p-1">2</td>
                      <td className="border border-slate-800 p-1">3 = 1 x 2</td>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedItems.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-800 p-2">{idx + 1}</td>
                        <td className="border border-slate-800 p-2 text-left font-sans">
                          <div className="font-semibold text-slate-900">{it.name}</div>
                          {it.is_durable_tool && (
                            <div className="text-[10px] text-blue-700 italic flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3 h-3" /> Nông cụ lâu bền theo dõi ngoài bảng TK 005
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-800 p-2 font-mono text-[11px]">{it.code}</td>
                        <td className="border border-slate-800 p-2 font-mono font-bold text-emerald-800">{it.account_code}</td>
                        <td className="border border-slate-800 p-2">{it.unit}</td>
                        <td className="border border-slate-800 p-2 font-bold font-mono text-slate-900">{it.quantity.toLocaleString('vi-VN')}</td>
                        <td className="border border-slate-800 p-2 text-right font-mono">{it.unit_price.toLocaleString('vi-VN')}</td>
                        <td className="border border-slate-800 p-2 text-right font-mono font-bold text-slate-950">{it.amount.toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                    {/* Hàng tổng cộng */}
                    <tr className="font-bold bg-slate-50">
                      <td colSpan={7} className="border border-slate-800 p-2 text-right uppercase font-sans">
                        Cộng tổng giá trị:
                      </td>
                      <td className="border border-slate-800 p-2 text-right font-mono text-sm text-emerald-950 font-extrabold">
                        {money(totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Số tiền viết bằng chữ */}
              <div className="text-xs italic text-slate-800">
                <span className="font-bold not-italic">Số tiền viết bằng chữ: </span>
                <span>{totalInWords}</span>
              </div>

              {/* Chữ ký 4 bên theo TT 71/2024/TT-BTC */}
              <div className="grid grid-cols-4 gap-4 text-center text-xs font-sans pt-6">
                <div>
                  <p className="font-bold uppercase text-slate-900">Người lập phiếu</p>
                  <p className="italic text-[10px] text-slate-500">(Ký, họ tên)</p>
                  <div className="h-20" />
                  <p className="font-semibold text-slate-900">{(signers as any).creator || signers.receiver || 'Cán bộ kỹ thuật'}</p>
                </div>

                <div>
                  <p className="font-bold uppercase text-slate-900">Người nhận hàng</p>
                  <p className="italic text-[10px] text-slate-500">(Ký, họ tên xã viên)</p>
                  <div className="h-20" />
                  <p className="font-semibold text-slate-900">{recipientName}</p>
                </div>

                <div>
                  <p className="font-bold uppercase text-slate-900">Thủ kho</p>
                  <p className="italic text-[10px] text-slate-500">(Ký, họ tên)</p>
                  <div className="h-20" />
                  <p className="font-semibold text-slate-900">{signers.storekeeper || 'Thủ kho HTX'}</p>
                </div>

                <div>
                  <p className="font-bold uppercase text-slate-900">Giám đốc HTX</p>
                  <p className="italic text-[10px] text-slate-500">(Ký, họ tên, đóng dấu)</p>
                  <div className="h-20" />
                  <p className="font-semibold text-slate-900">{signers.director || activeCooperative?.director_name || 'Giám đốc HTX'}</p>
                </div>
              </div>

              {/* Cam kết thu hồi vỏ bao bì BVTV & trả nợ quyết toán */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1 font-sans print:border-slate-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Quy định bắt buộc đối với Xã viên nhận cấp nợ vật tư đầu vụ:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                  <li>Xã viên cam kết thu hồi 100% vỏ bao bì, chai thuốc BVTV sau sử dụng đã súc rửa 3 lần nộp về bể chứa HTX (theo TTLT 05/2016/TTLT-BNNPTNT-BTNMT).</li>
                  <li>Giá trị vật tư cấp ứng nợ đầu vụ được đối soát bù trừ trực tiếp vào tiền bao tiêu nông sản khi thanh lý hợp đồng cuối mùa vụ.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Actions (Ẩn khi in ấn) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-200 print:hidden shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Chứng từ Mẫu 02-VT theo Thông tư 71/2024/TT-BTC &bull; Tuân thủ R-SYS-011
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>In Phiếu</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải file PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tải Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
