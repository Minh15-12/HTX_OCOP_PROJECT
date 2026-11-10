import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  ShieldCheck,
  FlaskConical,
  Scale,
} from 'lucide-react';
import { FarmPlot } from '@/services/farmPlotApi';
import type { QualityGrade, QuickLabResult } from '@/types/agriculture';

interface KcsHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  plots: FarmPlot[];
  onSubmit: (payload: any) => Promise<void>;
  isSubmitting?: boolean;
}

export const KcsHarvestModal: React.FC<KcsHarvestModalProps> = ({
  isOpen,
  onClose,
  plots,
  onSubmit,
  isSubmitting = false,
}) => {
  const [plotId, setPlotId] = useState(plots[0]?.id || '');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantityKg, setQuantityKg] = useState('');
  const [gradeAKg, setGradeAKg] = useState('');
  const [gradeBKg, setGradeBKg] = useState('');
  const [rejectKg, setRejectKg] = useState('0');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('GRADE_A');
  const [brixLevel, setBrixLevel] = useState('');
  const [uniformityRate, setUniformityRate] = useState('');

  // Quick Lab Form
  const [quickLabResult, setQuickLabResult] = useState<QuickLabResult>('LAB_PASSED');
  const [labKitCode, setLabKitCode] = useState('');
  const [residuePpm, setResiduePpm] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setPlotId(plots[0]?.id || '');
      setHarvestDate(new Date().toISOString().split('T')[0]);
      setQuantityKg('');
      setGradeAKg('');
      setGradeBKg('');
      setRejectKg('0');
      setQualityGrade('GRADE_A');
      setBrixLevel('');
      setUniformityRate('');
      setQuickLabResult('LAB_PASSED');
      setLabKitCode('');
      setResiduePpm('');
    }
  }, [isOpen, plots]);

  const selectedPlot = plots.find((p) => p.id === plotId || p.plot_code === plotId) || plots[0];
  const effectiveSafeDate = (selectedPlot as any)?.safe_harvest_date || (selectedPlot as any)?.quarantine_until;

  // Real-time Gate Check PHI verification
  const isPhiViolated = Boolean(
    effectiveSafeDate &&
      new Date(harvestDate) < new Date(effectiveSafeDate)
  );


  const handleSubmit = async () => {
    await onSubmit({
      plot_id: selectedPlot?.id || plotId,
      crop_season_id: (selectedPlot as any)?.active_season_id || (selectedPlot as any)?.crop_season_id || 'season-palermo-01',
      harvest_date: harvestDate,
      quantity_kg: parseFloat(quantityKg) || 0,
      grade_a_kg: parseFloat(gradeAKg) || 0,
      grade_b_kg: parseFloat(gradeBKg) || 0,
      reject_kg: parseFloat(rejectKg) || 0,
      brix_level: parseFloat(brixLevel) || 8.0,
      uniformity_rate: parseFloat(uniformityRate) || 90.0,
      quality_grade: qualityGrade,
      kcs_status: quickLabResult === 'LAB_PASSED' ? 'PASSED' : 'REJECTED',
      kcs_gate_check: {
        passed: !isPhiViolated,
        phi_checked: true,
        safe_harvest_date: selectedPlot?.safe_harvest_date || harvestDate,
        harvest_date: harvestDate,
        note: isPhiViolated ? 'Vi phạm ngày an toàn PHI' : 'Đối soát cổng hợp lệ',
      },
      kcs_quick_lab: {
        test_result: quickLabResult,
        kit_code: labKitCode,
        residue_ppm: parseFloat(residuePpm) || 0,
        tested_at: new Date().toISOString(),
        tester_name: 'Tổ KCS HTX',
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ghi Nhận Thu Hoạch & Kiểm Soát KCS 3 Cấp"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={isPhiViolated || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Xác Nhận Thu Hoạch & Sinh Mã Lô GS1
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
        {/* HARD PHI BLOCK ALERT IF VIOLATED */}
        {isPhiViolated ? (
          <div className="p-4 bg-rose-100 border-2 border-rose-500 rounded-2xl text-rose-950 text-xs shadow-md animate-pulse">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-rose-900 uppercase">
                  🛑 Khóa an toàn PHI: Chặn thu hoạch hoàn toàn (ERR_HARVEST_PHI_VIOLATION)
                </h4>
                <p className="mt-1 leading-relaxed text-rose-900 font-semibold">
                  Thửa đất <strong>[{selectedPlot?.plot_code}]</strong> đang trong thời gian cách ly thuốc BVTV an toàn đến hết ngày{' '}
                  <span className="underline font-bold text-rose-950">{effectiveSafeDate}</span>.
                  Lệnh thu hoạch vào ngày <span className="underline font-bold">{harvestDate}</span> vi phạm quy tắc an toàn BR-FARM-001.
                </p>
                <p className="mt-1.5 font-bold text-rose-800">
                  Hệ thống đã khóa nút Xác nhận. Vui lòng dời ngày thu hoạch sau khi hết thời hạn cách ly!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Cấp 1 - Gate Check Hợp Lệ:</strong> Thửa đất đã vượt qua thời hạn cách ly an toàn PHI (hoặc không dùng thuốc BVTV có cách ly).
            </span>
          </div>
        )}

        {/* Plot & Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn Thửa Đất Canh Tác <span className="text-rose-500">*</span>
            </label>
            <select
              value={plotId}
              onChange={(e) => setPlotId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
            >
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plot_code} - {p.unit_name || 'Nhà kính Sweet Palermo'} {p.safe_harvest_date ? `(Cách ly đến ${p.safe_harvest_date})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ngày Thu Hoạch <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Tier 2: Quick Lab Test */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
              >
                <option value="LAB_PASSED">ÂM TÍNH (Pass - An toàn)</option>
                <option value="LAB_REJECTED">DƯƠNG TÍNH (Reject - Có chất cấm)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mã Kit Test Nhanh
              </label>
              <input
                type="text"
                value={labKitCode}
                onChange={(e) => setLabKitCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Chỉ số dư lượng (ppm)
              </label>
              <input
                type="number"
                step="0.001"
                value={residuePpm}
                onChange={(e) => setResiduePpm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Tier 3: Grading & Quality */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" />
            Cấp 3 - Grading: Phân Loại Phẩm Cấp Nông Sản
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tổng SL (kg) <span className="text-rose-500">*</span>
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
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-amber-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Độ Brix (≥ 7.0°)
              </label>
              <input
                type="number"
                step="0.1"
                value={brixLevel}
                onChange={(e) => setBrixLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Độ đồng đều quả (≥ 90%)
              </label>
              <input
                type="number"
                step="0.5"
                value={uniformityRate}
                onChange={(e) => setUniformityRate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Xếp Hạng Phẩm Cấp KCS
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-800"
              >
                <option value="GRADE_A">GRADE A (Thượng hạng: Brix ≥ 7°, Đồng đều ≥ 90%)</option>
                <option value="GRADE_B">GRADE B (Tiêu chuẩn an toàn)</option>
                <option value="REJECT">REJECT (Không đạt an toàn/Dư lượng)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
