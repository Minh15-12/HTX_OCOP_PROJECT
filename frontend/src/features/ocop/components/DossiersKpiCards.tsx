import React from 'react';
import { Award, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { OcopDossierItem } from '../../../services/ocopService';

interface DossiersKpiCardsProps {
  dossiers: OcopDossierItem[];
}

export const DossiersKpiCards: React.FC<DossiersKpiCardsProps> = ({ dossiers }) => {
  const totalCount = dossiers.length;
  const selfEvaluatingCount = dossiers.filter(
    (d) => d.status === 'SELF_EVALUATING' || d.status === 'DRAFT'
  ).length;
  const inEvaluationCount = dossiers.filter((d) => d.status === 'IN_EVALUATION').length;
  const certifiedCount = dossiers.filter(
    (d) => d.status === 'CERTIFIED' || d.status === 'APPROVED'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Tổng hồ sơ đăng ký */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] text-slate-500 font-bold">Tổng sản phẩm đăng ký</div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
            <span>Dữ liệu thực tế</span>
            <span className="text-slate-400 font-normal">từ hồ sơ OCOP</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Đang tự đánh giá */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] text-slate-500 font-bold">Đang tự đánh giá</div>
          <div className="text-2xl font-black text-slate-900">{selfEvaluatingCount}</div>
          <div className="text-[10.5px] text-sky-600 font-bold flex items-center gap-1">
            <span>{totalCount > 0 ? Math.round((selfEvaluatingCount / totalCount) * 100) : 0}%</span>
            <span className="text-slate-400 font-normal">tổng hồ sơ</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-black">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Đang thẩm định */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] text-slate-500 font-bold">Đang thẩm định / Chờ duyệt</div>
          <div className="text-2xl font-black text-slate-900">{inEvaluationCount}</div>
          <div className="text-[10.5px] text-amber-600 font-bold flex items-center gap-1">
            <span>{totalCount > 0 ? Math.round((inEvaluationCount / totalCount) * 100) : 0}%</span>
            <span className="text-slate-400 font-normal">hội đồng chấm</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-black">
          <Award className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: Đã công nhận OCOP */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] text-slate-500 font-bold">Đã công nhận OCOP</div>
          <div className="text-2xl font-black text-slate-900">{certifiedCount}</div>
          <div className="text-[10.5px] text-purple-600 font-bold flex items-center gap-1">
            <span>{totalCount > 0 ? Math.round((certifiedCount / totalCount) * 100) : 0}%</span>
            <span className="text-slate-400 font-normal">đạt chuẩn</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-black">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
