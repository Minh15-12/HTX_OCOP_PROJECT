import React, { useState } from 'react';
import { X, MapPin, CheckCircle, AlertCircle, Loader2, Coins } from 'lucide-react';
import { landContributionService, CreateLandContributionPayload } from '@/services/landContributionService';
import { Member } from '@/types/memberTypes';

interface LandContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  defaultMemberId?: string;
  onSuccess: () => void;
}

export const LandContributionModal: React.FC<LandContributionModalProps> = ({
  isOpen,
  onClose,
  members,
  defaultMemberId,
  onSuccess,
}) => {
  const [memberId, setMemberId] = useState(defaultMemberId || members[0]?.id || '');
  const [landCertificateNo, setLandCertificateNo] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [mapSheetNumber, setMapSheetNumber] = useState('');
  const [landAreaSqm, setLandAreaSqm] = useState<number | ''>('');
  const [landUseType, setLandUseType] = useState('');
  const [appraisedUnitPrice, setAppraisedUnitPrice] = useState<number | ''>('');
  const [cadastralStatus, setCadastralStatus] = useState<'PENDING' | 'NOTARIZED' | 'REGISTERED_CHANGE'>('PENDING');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMemberId(defaultMemberId || members[0]?.id || '');
      setLandCertificateNo('');
      setPlotNumber('');
      setMapSheetNumber('');
      setLandAreaSqm('');
      setLandUseType('');
      setAppraisedUnitPrice('');
      setCadastralStatus('PENDING');
      setErrorMsg(null);
    }
  }, [isOpen, defaultMemberId, members]);

  if (!isOpen) return null;

  const totalValue = Math.round((Number(landAreaSqm) || 0) * (Number(appraisedUnitPrice) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!memberId) {
      setErrorMsg('Vui lòng chọn xã viên góp vốn');
      return;
    }
    if (!landCertificateNo.trim()) {
      setErrorMsg('Số Giấy chứng nhận QSDĐ (sổ đỏ) là bắt buộc');
      return;
    }
    if (!plotNumber.trim() || !mapSheetNumber.trim()) {
      setErrorMsg('Số thửa đất và số tờ bản đồ là bắt buộc');
      return;
    }
    if (!landAreaSqm || Number(landAreaSqm) <= 0) {
      setErrorMsg('Diện tích đất góp phải lớn hơn 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateLandContributionPayload = {
        land_certificate_no: landCertificateNo.trim().toUpperCase(),
        plot_number: plotNumber.trim(),
        map_sheet_number: mapSheetNumber.trim(),
        land_area_sqm: Number(landAreaSqm),
        land_use_type: landUseType,
        appraised_unit_price: Number(appraisedUnitPrice),
        total_land_value: totalValue,
        cadastral_status: cadastralStatus,
      };

      await landContributionService.createLandContribution(memberId, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi ghi nhận góp vốn bằng quyền sử dụng đất');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Góp Vốn Quyền Sử Dụng Đất (QSDĐ)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận vào Sổ vốn điều lệ &amp; Tài sản tích tụ HTX
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Member select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Xã viên đứng tên góp đất <span className="text-rose-500">*</span>
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              disabled={Boolean(defaultMemberId)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.member_code} - {m.full_name} ({m.phone || 'Không có SĐT'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số sổ đỏ (GCN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={landCertificateNo}
                onChange={(e) => setLandCertificateNo(e.target.value)}
                placeholder="VD: BD 123456"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số thửa đất <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value)}
                placeholder="VD: 105"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số tờ bản đồ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mapSheetNumber}
                onChange={(e) => setMapSheetNumber(e.target.value)}
                placeholder="VD: 12"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diện tích đất góp (m²) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={landAreaSqm}
                onChange={(e) => setLandAreaSqm(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại đất
              </label>
              <select
                value={landUseType}
                onChange={(e) => setLandUseType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Đất trồng lúa">Đất chuyên trồng lúa</option>
                <option value="Đất trồng cây hàng năm">Đất trồng cây hàng năm khác</option>
                <option value="Đất trồng cây lâu năm">Đất trồng cây lâu năm</option>
                <option value="Đất rừng sản xuất">Đất rừng sản xuất</option>
                <option value="Đất nuôi trồng thủy sản">Đất nuôi trồng thủy sản</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn giá thẩm định (VNĐ/m²) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                required
                value={appraisedUnitPrice}
                onChange={(e) => setAppraisedUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái pháp lý địa chính
              </label>
              <select
                value={cadastralStatus}
                onChange={(e: any) => setCadastralStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="PENDING">Chờ công chứng HĐ góp vốn</option>
                <option value="NOTARIZED">Đã công chứng chứng thực</option>
                <option value="REGISTERED_CHANGE">Đã đăng ký biến động sang HTX</option>
              </select>
            </div>
          </div>

          {/* Total Value Summary Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Giá trị vốn góp quy đổi:</span>
            </div>
            <div className="text-sm font-mono font-black text-emerald-900">
              {totalValue.toLocaleString('vi-VN')} ₫
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Xác nhận góp vốn đất
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
