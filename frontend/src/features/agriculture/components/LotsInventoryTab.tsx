import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Download, 
  QrCode, 
  ExternalLink, 
  Boxes, 
  PackageCheck, 
  Truck, 
  AlertCircle, 
  Copy, 
  Check, 
  X, 
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import type { Gs1LotItem, LotLifecycleStatus } from '@/types/agriculture';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/ToastNotification';
import { exportToExcel } from '@/utils/exportUtils';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import { QrCodeSvg } from './QrCodeSvg';

interface LotsInventoryTabProps {
  lots: Gs1LotItem[];
  isLoading: boolean;
  onUpdateStatus: (id: string, newStatus: LotLifecycleStatus) => void;
}

const statusBadgeConfig: Record<LotLifecycleStatus, { label: string; className: string }> = {
  AVAILABLE: { label: 'Sẵn sàng xuất', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  PACKED: { label: 'Đã đóng gói', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  DISTRIBUTED: { label: 'Đã phân phối', className: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  EXPIRED: { label: 'Hết hạn sử dụng', className: 'bg-rose-50 text-rose-800 border-rose-200' },
  REJECTED: { label: 'Loại thải', className: 'bg-slate-100 text-slate-700 border-slate-300' },
};

export const LotsInventoryTab: React.FC<LotsInventoryTabProps> = ({
  lots,
  isLoading,
  onUpdateStatus,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedLot, setCopiedLot] = useState<string | null>(null);
  const [selectedLotForQr, setSelectedLotForQr] = useState<Gs1LotItem | null>(null);
  const qrCardRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLotForQr) {
        setSelectedLotForQr(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLotForQr]);

  // Filter
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        lot.lot_code.toLowerCase().includes(q) ||
        (lot.plot_code && lot.plot_code.toLowerCase().includes(q)) ||
        (lot.season_name && lot.season_name.toLowerCase().includes(q)) ||
        (lot.crop_name && lot.crop_name.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || lot.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [lots, search, statusFilter]);

  // KPIs
  const stats = useMemo(() => {
    const totalLots = lots.length;
    const availableKg = lots
      .filter((l) => l.status === 'AVAILABLE')
      .reduce((sum, l) => sum + (l.remaining_quantity ?? l.quantity), 0);
    const packedKg = lots
      .filter((l) => l.status === 'PACKED')
      .reduce((sum, l) => sum + (l.remaining_quantity ?? l.quantity), 0);
    const distributedKg = lots
      .filter((l) => l.status === 'DISTRIBUTED')
      .reduce((sum, l) => sum + l.quantity, 0);

    return { totalLots, availableKg, packedKg, distributedKg };
  }, [lots]);

  const totalPages = Math.ceil(filteredLots.length / pageSize) || 1;
  const pagedLots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLots.slice(start, start + pageSize);
  }, [filteredLots, currentPage, pageSize]);

  const handleCopyLotCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedLot(code);
    showToast(`Đã sao chép mã lô GS1: ${code}`, 'success');
    setTimeout(() => setCopiedLot(null), 2000);
  };

  const handleExportExcel = () => {
    if (filteredLots.length === 0) {
      showToast('Không có dữ liệu lô hàng để xuất!', 'warning');
      return;
    }
    const data = filteredLots.map((l, idx) => ({
      STT: idx + 1,
      'Mã lô GS1': l.lot_code,
      'Ngày thu hoạch': l.harvest_date,
      'Mùa vụ canh tác': l.season_name || '',
      'Mã thửa đất': l.plot_code || '',
      'Sản lượng ban đầu (kg)': l.quantity,
      'Sản lượng còn lại (kg)': l.remaining_quantity ?? l.quantity,
      'Trạng thái vòng đời': statusBadgeConfig[l.status]?.label || l.status,
      'Thông tin nguồn gốc': l.source_information || '',
      'Link truy xuất': `${window.location.origin}/trace/${l.lot_code}`,
    }));
    exportToExcel(data, `Danh_Sach_Lo_Hang_GS1_${new Date().toISOString().slice(0, 10)}`, 'LoHangGS1');
    showToast('Xuất danh sách lô hàng GS1 thành công!');
  };

  return (
    <div className="space-y-4">
      {/* 4 Mini KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Tổng số Lô GS1</p>
              <p className="text-lg font-black text-slate-900">{stats.totalLots} <span className="text-xs font-normal text-slate-500">lô</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Sẵn sàng xuất (Kho)</p>
              <p className="text-lg font-black text-emerald-700">
                {stats.availableKg.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">kg</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Đã đóng gói OCOP</p>
              <p className="text-lg font-black text-blue-700">
                {stats.packedKg.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">kg</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Đã phân phối chuỗi</p>
              <p className="text-lg font-black text-indigo-700">
                {stats.distributedKg.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">kg</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm mã lô GS1, thửa đất, vụ mùa..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái vòng đời</option>
              <option value="AVAILABLE">Sẵn sàng xuất</option>
              <option value="PACKED">Đã đóng gói OCOP</option>
              <option value="DISTRIBUTED">Đã phân phối chuỗi</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel (.xlsx)
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Mã lô GS1 Traceability</th>
                <th className="py-3 px-4">Ngày thu hoạch</th>
                <th className="py-3 px-4">Vụ mùa & Thửa đất</th>
                <th className="py-3 px-4 text-right">Ban đầu (kg)</th>
                <th className="py-3 px-4 text-right">Còn lại (kg)</th>
                <th className="py-3 px-4 text-center">Trạng thái vòng đời</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách lô hàng GS1...
                  </td>
                </tr>
              ) : pagedLots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="w-8 h-8 text-slate-300" />
                      <p className="font-bold text-slate-600">Không tìm thấy lô hàng GS1 nào</p>
                      <p className="text-[11.5px] text-slate-400">
                        Các lô hàng sẽ tự động sinh mã GS1 chuẩn khi bạn ghi nhận lệnh thu hoạch qua KCS.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedLots.map((lot) => {
                  const cfg = statusBadgeConfig[lot.status] || {
                    label: lot.status,
                    className: 'bg-slate-100 text-slate-700 border-slate-200',
                  };
                  return (
                    <tr key={lot.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50/60 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {lot.lot_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLotCode(lot.lot_code)}
                            title="Sao chép mã lô"
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded"
                          >
                            {copiedLot === lot.lot_code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{lot.harvest_date}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{lot.season_name || 'Vụ Canh Tác'}</div>
                        <div className="text-[11px] font-mono text-slate-500">{lot.plot_code || 'Thửa đất HTX'}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {lot.quantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                        {(lot.remaining_quantity ?? lot.quantity).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLotForQr(lot)}
                            title="Xem mã QR & In tem GS1"
                            className="inline-flex items-center gap-1 px-2 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 font-semibold cursor-pointer text-[11px]"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            Tem QR
                          </button>

                          <select
                            value={lot.status}
                            onChange={(e) => onUpdateStatus(lot.id, e.target.value as LotLifecycleStatus)}
                            className="px-1.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 cursor-pointer focus:ring-1 focus:ring-emerald-500"
                            title="Chuyển trạng thái vòng đời"
                          >
                            <option value="AVAILABLE">Sẵn sàng</option>
                            <option value="PACKED">Đóng gói</option>
                            <option value="DISTRIBUTED">Phân phối</option>
                            <option value="EXPIRED">Hết hạn</option>
                          </select>

                          <a
                            href={`/trace/${encodeURIComponent(lot.lot_code)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Mở cổng truy xuất công khai"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLots.length > pageSize && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong>–
              <strong>{Math.min(currentPage * pageSize, filteredLots.length)}</strong> trên tổng số{' '}
              <strong>{filteredLots.length}</strong> lô hàng
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredLots.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* QR Code & Label Print Modal */}
      {selectedLotForQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-[13px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedLotForQr(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-700" />
                Tem Nhãn QR Truy Xuất GS1 Digital Link
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLotForQr(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              ref={qrCardRef}
              data-pdf-container="true"
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3"
            >
              <div className="inline-block p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <QrCodeSvg value={`${window.location.origin}/trace/${selectedLotForQr.lot_code}`} size={160} />
              </div>

              <div>
                <p className="font-mono font-black text-slate-900 text-sm break-words">{selectedLotForQr.lot_code}</p>
                <p className="text-xs text-slate-500 mt-0.5 break-words">{selectedLotForQr.season_name} • {selectedLotForQr.plot_code}</p>
                <p className="text-xs text-emerald-700 font-bold mt-1">
                  Khối lượng: {(selectedLotForQr.remaining_quantity ?? selectedLotForQr.quantity).toLocaleString('vi-VN')} kg
                </p>
              </div>

              <div className="text-[11px] text-slate-500 font-mono break-all bg-white p-2 rounded-lg border border-slate-200">
                {`${window.location.origin}/trace/${selectedLotForQr.lot_code}`}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-2 border-t border-slate-100 gap-2">
              <a
                href={`/trace/${encodeURIComponent(selectedLotForQr.lot_code)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold"
              >
                Xem trang công khai <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedLotForQr(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  title="In tem nhãn QR trực tiếp"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In tem</span>
                </button>
                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={async () => {
                    if (!qrCardRef.current || !selectedLotForQr) return;
                    try {
                      setIsExportingPdf(true);
                      await exportPdfFromElement(
                        qrCardRef.current,
                        `Tem_QR_${selectedLotForQr.lot_code}.pdf`,
                        { format: 'a4', orientation: 'portrait' }
                      );
                    } finally {
                      setIsExportingPdf(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                  title="Tải tem nhãn QR dạng PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedLotForQr) return;
                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.aoa_to_sheet([
                      ['MÃ LÔ GS1', 'MÙA VỤ', 'THỬA ĐẤT', 'KHỐI LƯỢNG (KG)', 'TRẠNG THÁI', 'LINK TRUY XUẤT'],
                      [
                        selectedLotForQr.lot_code,
                        selectedLotForQr.season_name || '',
                        selectedLotForQr.plot_code || '',
                        selectedLotForQr.remaining_quantity ?? selectedLotForQr.quantity,
                        selectedLotForQr.status,
                        `${window.location.origin}/trace/${selectedLotForQr.lot_code}`,
                      ],
                    ]);
                    XLSX.utils.book_append_sheet(wb, ws, 'Lot_QR');
                    XLSX.writeFile(wb, `Lot_${selectedLotForQr.lot_code}.xlsx`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  title="Tải bảng kê thông tin lô ra Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tải Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
