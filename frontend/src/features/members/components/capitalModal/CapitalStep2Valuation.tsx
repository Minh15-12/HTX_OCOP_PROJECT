import React from 'react';
import { Upload, FileText, Eye, X } from 'lucide-react';
import { CapitalFormData } from '../CapitalRecordModal';

interface CapitalStep2ValuationProps {
  capitalForm: CapitalFormData;
  setCapitalForm: React.Dispatch<React.SetStateAction<CapitalFormData>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDropFile: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export const CapitalStep2Valuation: React.FC<CapitalStep2ValuationProps> = ({
  capitalForm,
  setCapitalForm,
  fileInputRef,
  handleFileSelect,
  handleDropFile,
  isDragging,
  setIsDragging,
  onBack,
  onNext,
}) => {
  return (
    <div className="space-y-4">
      {capitalForm.contribution_type === 'LAND' ? (
        <div className="space-y-3">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11.5px] font-bold">
            Đóng góp bằng Quyền sử dụng đất (Luật HTX 2023 &amp; Luật Đất đai 2024)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số seri Sổ đỏ *</label>
              <input
                type="text"
                required
                value={capitalForm.land_certificate_no}
                onChange={(e) =>
                  setCapitalForm({ ...capitalForm, land_certificate_no: e.target.value })
                }
                placeholder="BD 123456"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Số thửa &amp; Số tờ bản đồ
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Số Thửa"
                  value={capitalForm.plot_number}
                  onChange={(e) =>
                    setCapitalForm({ ...capitalForm, plot_number: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg font-bold"
                />
                <input
                  type="text"
                  placeholder="Số Tờ"
                  value={capitalForm.map_sheet_number}
                  onChange={(e) =>
                    setCapitalForm({ ...capitalForm, map_sheet_number: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Loại đất quy hoạch / sử dụng</label>
              <select
                value={capitalForm.land_use_type || 'Đất trồng lúa'}
                onChange={(e) =>
                  setCapitalForm({ ...capitalForm, land_use_type: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 text-[12px]"
              >
                <option value="Đất trồng lúa">Đất chuyên trồng lúa (LUC)</option>
                <option value="Đất trồng cây hàng năm khác">Đất trồng cây hàng năm khác (HNK)</option>
                <option value="Đất trồng cây lâu năm">Đất trồng cây lâu năm (CLN)</option>
                <option value="Đất nuôi trồng thủy sản">Đất nuôi trồng thủy sản (NTS)</option>
                <option value="Đất nông nghiệp khác">Đất nông nghiệp khác</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tình trạng pháp lý / Địa chính</label>
              <select
                value={capitalForm.cadastral_status || 'REGISTERED_CHANGE'}
                onChange={(e) =>
                  setCapitalForm({
                    ...capitalForm,
                    cadastral_status: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 text-[12px]"
              >
                <option value="PENDING">Chờ công chứng HĐ góp vốn</option>
                <option value="NOTARIZED">Đã công chứng VPCC</option>
                <option value="REGISTERED_CHANGE">Đã đăng ký biến động QSDĐ (Chi nhánh VPĐKĐĐ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Diện tích đóng góp (m²) *
              </label>
              <input
                type="number"
                required
                value={capitalForm.land_area_sqm}
                onChange={(e) =>
                  setCapitalForm({ ...capitalForm, land_area_sqm: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Đơn giá định giá (đ/m²) *
              </label>
              <input
                type="number"
                required
                value={capitalForm.appraised_unit_price}
                onChange={(e) =>
                  setCapitalForm({
                    ...capitalForm,
                    appraised_unit_price: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="p-2.5 bg-slate-100 rounded-lg flex justify-between font-extrabold text-slate-900">
            <span>Tổng giá trị góp đất quy đổi:</span>
            <span className="text-emerald-700">
              {(
                (capitalForm.land_area_sqm || 0) * (capitalForm.appraised_unit_price || 0)
              ).toLocaleString('vi-VN')}{' '}
              ₫
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số tiền góp (đ) *</label>
              <input
                type="number"
                step={1000000}
                required
                value={capitalForm.amount}
                onChange={(e) =>
                  setCapitalForm({ ...capitalForm, amount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Số chứng từ / Phiếu thu
              </label>
              <input
                type="text"
                value={capitalForm.receipt_number}
                onChange={(e) =>
                  setCapitalForm({ ...capitalForm, receipt_number: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày nộp *</label>
              <input
                type="date"
                required
                value={capitalForm.contribution_date}
                onChange={(e) =>
                  setCapitalForm({ ...capitalForm, contribution_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nội dung nộp</label>
              <input
                type="text"
                value={capitalForm.content}
                onChange={(e) => setCapitalForm({ ...capitalForm, content: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          File Biên bản định giá / Chứng từ scan
        </label>
        <input
          type="file"
          ref={fileInputRef as any}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
        />
        {!capitalForm.uploaded_file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDropFile}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50 scale-102'
                : 'border-emerald-400/80 hover:border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/50'
            }`}
          >
            <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1.5 animate-bounce" />
            <div className="text-slate-800 font-bold text-[12px]">
              Bấm vào đây để chọn file hoặc Kéo thả file vào đây
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5 font-medium">
              Tải lên Biên bản họp Đại hội thành viên / Hợp đồng công chứng / Sổ đỏ (PDF, DOCX, PNG,
              JPG)
            </div>
          </div>
        ) : (
          <div className="p-3 border border-emerald-300 bg-emerald-50/70 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-emerald-700 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900 text-xs truncate max-w-[240px]">
                  {capitalForm.uploaded_file.name}
                </div>
                <div className="text-[10.5px] text-emerald-800 font-bold">
                  {capitalForm.uploaded_file.size} &bull; Đã sẵn sàng đính kèm
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {capitalForm.uploaded_file.url && (
                <a
                  href={capitalForm.uploaded_file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem
                </a>
              )}
              <button
                type="button"
                onClick={() => setCapitalForm((prev) => ({ ...prev, uploaded_file: null }))}
                className="p-1.5 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold cursor-pointer"
                title="Xóa file đã chọn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-between gap-2 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
        >
          &larr; Quay lại
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
        >
          Kiểm tra ranh giới Luật &rarr;
        </button>
      </div>
    </div>
  );
};
