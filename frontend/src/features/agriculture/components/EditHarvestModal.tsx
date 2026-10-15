import React, { useState, useEffect } from 'react';
import {
  X,
  Wheat,
  FlaskConical,
  Scale,
  Save,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type { HarvestItem, QualityGrade, QuickLabResult } from '@/types/agriculture';
import { updateHarvest } from '@/services/harvestApi';
import { useToast } from '@/components/ui/ToastNotification';

interface EditHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  harvest: HarvestItem | null;
  onSuccess: () => void;
}

export const EditHarvestModal: React.FC<EditHarvestModalProps> = ({
  isOpen,
  onClose,
  harvest,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [harvestDate, setHarvestDate] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [gradeAKg, setGradeAKg] = useState('');
  const [gradeBKg, setGradeBKg] = useState('');
  const [rejectKg, setRejectKg] = useState('0');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('GRADE_A');
  const [brixLevel, setBrixLevel] = useState('8.0');
  const [uniformityRate, setUniformityRate] = useState('90.0');

  // Quick Lab Form
  const [quickLabResult, setQuickLabResult] = useState<QuickLabResult>('LAB_PASSED');
  const [labKitCode, setLabKitCode] = useState('');
  const [residuePpm, setResiduePpm] = useState('0.0');

  useEffect(() => {
    if (harvest) {
      setHarvestDate(harvest.harvest_date);
      setQuantityKg(String(harvest.quantity_kg));
      setGradeAKg(String(harvest.grade_a_kg || 0));
      setGradeBKg(String(harvest.grade_b_kg || 0));
      setRejectKg(String(harvest.reject_kg || 0));
      setQualityGrade(harvest.quality_grade);
      setBrixLevel(String(harvest.brix_level ?? 7.5));
      setUniformityRate(String(harvest.uniformity_rate ?? 90));

      if (harvest.kcs_quick_lab) {
        setQuickLabResult(harvest.kcs_quick_lab.test_result);
        setLabKitCode(harvest.kcs_quick_lab.kit_code || '');
        setResiduePpm(String(harvest.kcs_quick_lab.residue_ppm ?? 0));
      }
    }
  }, [harvest]);

  if (!isOpen || !harvest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const total = parseFloat(quantityKg) || 0;
      const gA = parseFloat(gradeAKg) || 0;
      const gB = parseFloat(gradeBKg) || 0;
      const rej = parseFloat(rejectKg) || 0;
      const brix = parseFloat(brixLevel) || 7.5;
      const uniformity = parseFloat(uniformityRate) || 90;

      await updateHarvest(harvest.id, {
        harvest_date: harvestDate,
        quantity_kg: total,
        grade_a_kg: gA,
        grade_b_kg: gB,
        reject_kg: rej,
        quality_grade: qualityGrade,
        brix_level: brix,
        uniformity_rate: uniformity,
        kcs_status: quickLabResult === 'LAB_PASSED' ? 'PASSED' : 'REJECTED',
        kcs_quick_lab: {
          test_result: quickLabResult,
          kit_code: labKitCode || 'KIT-RAPID-PEST',
          residue_ppm: parseFloat(residuePpm) || 0,
          active_substances_tested: harvest.kcs_quick_lab?.active_substances_tested || ['Chlorpyrifos', 'Imidacloprid'],
          tested_at: new Date().toISOString(),
          tester_name: harvest.kcs_quick_lab?.tester_name || 'Tổ KCS HTX Tân Tiến',
        },
      });

      showToast(`Cập nhật thông tin thu hoạch [${harvest.harvest_code}] thành công!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Cập nhật thu hoạch thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-sm animate-fade-in text-[13px]">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              Cập Nhật KCS Thu Hoạch ({harvest.harvest_code})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã Lô GS1: <strong className="text-slate-800 font-mono">{harvest.lot_code}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày thu hoạch <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thửa đất thu hoạch
              </label>
              <input
                type="text"
                disabled
                value={`${harvest.plot_code} - ${harvest.plot_name}`}
                className={`${inputCls} bg-slate-100 text-slate-500 cursor-not-allowed`}
              />
            </div>
          </div>

          {/* Quick Lab Test */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              Cấp 2 - Quick Lab: Kiểm Nghiệm Dư Lượng Nhanh
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kết quả test kit
                </label>
                <select
                  value={quickLabResult}
                  onChange={(e) => {
                    const res = e.target.value as QuickLabResult;
                    setQuickLabResult(res);
                    if (res === 'LAB_REJECTED') {
                      setQualityGrade('REJECT');
                    }
                  }}
                  className={inputCls}
                >
                  <option value="LAB_PASSED">ÂM TÍNH (Pass)</option>
                  <option value="LAB_REJECTED">DƯƠNG TÍNH (Reject)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mã Kit Test
                </label>
                <input
                  type="text"
                  value={labKitCode}
                  onChange={(e) => setLabKitCode(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Dư lượng (ppm)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={residuePpm}
                  onChange={(e) => setResiduePpm(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Grading & Volume */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-emerald-600" />
              Cấp 3 - Grading: Phân Loại Sản Lượng & Phẩm Cấp
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tổng SL (kg)
                </label>
                <input
                  type="number"
                  value={quantityKg}
                  onChange={(e) => {
                    const total = parseFloat(e.target.value) || 0;
                    setQuantityKg(e.target.value);
                    setGradeAKg(String(Math.round(total * 0.85)));
                    setGradeBKg(String(Math.round(total * 0.15)));
                  }}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Grade A (kg)
                </label>
                <input
                  type="number"
                  value={gradeAKg}
                  onChange={(e) => setGradeAKg(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Grade B (kg)
                </label>
                <input
                  type="number"
                  value={gradeBKg}
                  onChange={(e) => setGradeBKg(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Hàng loại (kg)
                </label>
                <input
                  type="number"
                  value={rejectKg}
                  onChange={(e) => setRejectKg(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Độ Brix (≥ 7.0°)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={brixLevel}
                  onChange={(e) => setBrixLevel(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Độ đồng đều (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={uniformityRate}
                  onChange={(e) => setUniformityRate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Xếp hạng phẩm cấp
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                  className={inputCls}
                >
                  <option value="GRADE_A">GRADE A (Thượng hạng)</option>
                  <option value="GRADE_B">GRADE B (Tiêu chuẩn)</option>
                  <option value="REJECT">REJECT (Không đạt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Đang lưu...' : 'Lưu Thay Đổi KCS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
