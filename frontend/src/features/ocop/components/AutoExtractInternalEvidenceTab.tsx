import React, { useState } from 'react';
import { 
  Sparkles, 
  FileCheck, 
  Boxes, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Database,
  MapPin,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { ALL_INDICATORS } from '../data/ocopQd148Data';

interface AutoExtractInternalEvidenceTabProps {
  onAttachEvidence: (evidence: {
    indicatorCode: string;
    title: string;
    sourceType: string;
    sourceRef: string;
    summary: string;
    productionUnitId?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AutoExtractInternalEvidenceTab: React.FC<AutoExtractInternalEvidenceTabProps> = ({
  onAttachEvidence,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedSource, setSelectedSource] = useState<
    'FARM_PLOT' | 'LOCAL_LABOR' | 'MEMBER_CHAIN' | 'VIETGAP_LOG' | 'KCS_LAB' | 'GS1_LOT'
  >('FARM_PLOT');

  const [targetIndicator, setTargetIndicator] = useState<string>('TC-A.1.1');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>(
    'Báo cáo số hóa vùng trồng & Bản đồ danh mục thửa đất (Mẫu 01-PUC)'
  );

  // Fetch genuine production units from database
  const { data: productionUnits = [], isLoading: loadingUnits } = useQuery({
    queryKey: ['production-units-for-extract'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/production-units');
        return res.data?.data || res.data || [];
      } catch (err) {
        console.warn('Cannot fetch production units for auto extract:', err);
        return [];
      }
    },
  });

  const handleSourceChange = (src: 'FARM_PLOT' | 'LOCAL_LABOR' | 'MEMBER_CHAIN' | 'VIETGAP_LOG' | 'KCS_LAB' | 'GS1_LOT') => {
    setSelectedSource(src);
    if (src === 'FARM_PLOT') {
      setTargetIndicator('TC-A.1.1');
      if (selectedUnitId) {
        const found = (productionUnits as any[]).find((u) => u.id === selectedUnitId);
        if (found) {
          setCustomTitle(`Báo cáo số hóa vùng trồng ${found.name} (${found.unit_code}) - ${found.area} ha & thửa đất (Mẫu 01-PUC)`);
          return;
        }
      }
      setCustomTitle('Báo cáo số hóa vùng trồng & Bản đồ danh mục thửa đất (Mẫu 01-PUC)');
    } else if (src === 'LOCAL_LABOR') {
      setTargetIndicator('TC-A.2.1');
      setCustomTitle('Báo cáo số hóa sử dụng lao động địa phương & danh bạ xã viên toàn HTX');
    } else if (src === 'MEMBER_CHAIN') {
      setTargetIndicator('TC-A.3.1');
      if (selectedUnitId) {
        const found = (productionUnits as any[]).find((u) => u.id === selectedUnitId);
        if (found) {
          setCustomTitle(`Danh bạ hộ nông dân liên kết chuỗi giá trị & cam kết bao tiêu ${found.name} (${found.unit_code})`);
          return;
        }
      }
      setCustomTitle('Danh bạ hộ nông dân liên kết chuỗi giá trị & cam kết bao tiêu sản phẩm');
    } else if (src === 'VIETGAP_LOG') {
      setTargetIndicator('TC-C.2.2');
      setCustomTitle('Sổ nhật ký canh tác điện tử VietGAP & Báo cáo kiểm soát cách ly PHI');
    } else if (src === 'KCS_LAB') {
      setTargetIndicator('TC-C.1.1');
      setCustomTitle('Phiếu kiểm nghiệm KCS & An toàn chất lượng dinh dưỡng độ Brix');
    } else if (src === 'GS1_LOT') {
      setTargetIndicator('TC-B.1.2');
      setCustomTitle('Hồ sơ mã số mã vạch GS1 Traceability & Tem QR truy xuất nguồn gốc');
    }
  };

  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    if (!unitId) {
      if (selectedSource === 'FARM_PLOT') {
        setCustomTitle('Báo cáo số hóa vùng trồng & Bản đồ danh mục thửa đất (Mẫu 01-PUC)');
      } else if (selectedSource === 'MEMBER_CHAIN') {
        setCustomTitle('Danh bạ hộ nông dân liên kết chuỗi giá trị & cam kết bao tiêu sản phẩm');
      }
      return;
    }
    const found = (productionUnits as any[]).find((u) => u.id === unitId);
    if (found) {
      if (selectedSource === 'FARM_PLOT') {
        setCustomTitle(`Báo cáo số hóa vùng trồng ${found.name} (${found.unit_code}) - ${found.area} ha & thửa đất (Mẫu 01-PUC)`);
      } else if (selectedSource === 'MEMBER_CHAIN') {
        setCustomTitle(`Danh bạ hộ nông dân liên kết chuỗi giá trị & cam kết bao tiêu ${found.name} (${found.unit_code})`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAttachEvidence({
      indicatorCode: targetIndicator,
      title: customTitle,
      sourceType: selectedSource,
      sourceRef: `AUTO-EXTRACT-${Date.now().toString().slice(-6)}`,
      summary: `Trích xuất tự động từ hệ thống HTX với tính toán băm bảo mật SHA-256`,
      productionUnitId: selectedUnitId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
        <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-950 text-xs">
            Trích xuất minh chứng tự động (Evidence Cross-Reference)
          </p>
          <p className="text-[11.5px] text-emerald-800 mt-0.5">
            Dữ liệu canh tác, kiểm nghiệm lab, mã GS1 và sổ xã viên sẵn có trong HTX sẽ được tổng hợp thành tệp minh chứng số hóa có kèm mã băm SHA-256 tamper-evident.
          </p>
        </div>
      </div>

      {/* Select Source */}
      <div>
        <label className="block text-slate-700 font-bold mb-2">
          1. Chọn nguồn dữ liệu HTX trích xuất *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            onClick={() => handleSourceChange('FARM_PLOT')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedSource === 'FARM_PLOT'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Vùng trồng & Thửa đất (Mẫu 01-PUC)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Bản đồ số GIS, tọa độ GPS, số tờ/số thửa và định mức năng suất (TC-A.1.1).
            </p>
          </div>

          <div
            onClick={() => handleSourceChange('VIETGAP_LOG')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedSource === 'VIETGAP_LOG'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Nhật ký VietGAP (TCVN 11892)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Nhật ký làm đất, bón phân, tưới tiêu và cách ly PHI.
            </p>
          </div>

          <div
            onClick={() => handleSourceChange('KCS_LAB')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedSource === 'KCS_LAB'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Nghiệm thu KCS & Test Lab</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Kit test nhanh dư lượng, độ ngọt Brix, an toàn PHI.
            </p>
          </div>

          <div
            onClick={() => handleSourceChange('GS1_LOT')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedSource === 'GS1_LOT'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Boxes className="w-4 h-4 text-amber-700" />
              <span>Lô hàng GS1 Traceability</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Mã truy xuất nguồn gốc quốc gia & tem nhãn QR.
            </p>
          </div>

          <div
            onClick={() => handleSourceChange('LOCAL_LABOR')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedSource === 'LOCAL_LABOR'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Users className="w-4 h-4 text-indigo-700" />
              <span>Lao động địa phương (TC-A.2.1)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Báo cáo tỷ lệ thường trú địa phương toàn HTX đạt chuẩn ≥ 80% (QĐ 148).
            </p>
          </div>

          <div
            onClick={() => handleSourceChange('MEMBER_CHAIN')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedSource === 'MEMBER_CHAIN'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Boxes className="w-4 h-4 text-purple-700" />
              <span>Liên kết chuỗi nông hộ (TC-A.3.1)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Danh bạ hộ nông dân trực tiếp canh tác và cam kết bao tiêu theo vùng trồng.
            </p>
          </div>
        </div>
      </div>

      {/* Specific Production Unit selector if FARM_PLOT or MEMBER_CHAIN is selected */}
      {(selectedSource === 'FARM_PLOT' || selectedSource === 'MEMBER_CHAIN') && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <label className="block text-slate-700 font-bold">
            {selectedSource === 'FARM_PLOT' ? '2. Vùng sản xuất trích xuất (Mẫu 01-PUC) *' : '2. Vùng sản xuất liên kết chuỗi nông hộ *'}
          </label>
          <select
            value={selectedUnitId}
            onChange={(e) => handleUnitChange(e.target.value)}
            disabled={loadingUnits}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">-- Tự động khớp theo giống cây của sản phẩm OCOP --</option>
            {(productionUnits as any[]).map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} [{u.unit_code}] — {u.crop || 'Đa canh'} ({u.area} ha)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            {selectedSource === 'FARM_PLOT'
              ? 'Trích xuất chính xác tọa độ GPS, danh mục thửa đất của vùng được chọn, tránh gom nhầm các vùng trồng nông sản khác của HTX.'
              : 'Trích xuất chính xác các hộ xã viên trực tiếp canh tác và ký cam kết bao tiêu tại vùng sản xuất của sản phẩm OCOP này.'}
          </p>
        </div>
      )}

      {/* Target OCOP Indicator */}
      <div>
        <label className="block text-slate-700 font-bold mb-1">
          {(selectedSource === 'FARM_PLOT' || selectedSource === 'MEMBER_CHAIN') ? '3.' : '2.'} Chỉ tiêu OCOP đích (QĐ 148/QĐ-TTg) *
        </label>
        <select
          value={targetIndicator}
          onChange={(e) => setTargetIndicator(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
        >
          {ALL_INDICATORS.map((ind) => (
            <option key={ind.code} value={ind.code}>
              {ind.code} - {ind.criterionName}
            </option>
          ))}
        </select>
      </div>

      {/* Document Title */}
      <div>
        <label className="block text-slate-700 font-bold mb-1">
          {selectedSource === 'FARM_PLOT' ? '4.' : '3.'} Tên tài liệu trích xuất hiển thị trong hồ sơ *
        </label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
          required
        />
      </div>

      {/* Audit Hash Info Box */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5 text-slate-700 font-bold">
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          Mã băm SHA-256 tamper-evident:
        </span>
        <span className="text-slate-400">Tự động tính băm từ dữ liệu thật</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang trích xuất & tạo băm SHA-256...</span>
            </>
          ) : (
            <>
              <span>Trích xuất & Đính kèm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
