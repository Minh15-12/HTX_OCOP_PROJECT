import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, AlertTriangle, Lock, Star, ShieldAlert, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface EvaluationConsolidationTabProps {
  consolidationData: any;
  isConsolidatePending: boolean;
  onConsolidate: () => void;
}

export const EvaluationConsolidationTab: React.FC<EvaluationConsolidationTabProps> = ({
  consolidationData,
  isConsolidatePending,
  onConsolidate,
}) => {
  const navigate = useNavigate();
  const evaluatorCount = consolidationData?.evaluators?.length ?? 0;
  const isQuorumMet = evaluatorCount >= 3;

  return (
    <div className="space-y-6">
      {/* Action header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Tổng Hợp Đánh Giá Hội Đồng OCOP
            </span>
            {isQuorumMet ? (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                Túc số hợp lệ: {evaluatorCount}/3 Giám khảo
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-200">
                Chưa đạt túc số ({evaluatorCount}/3 tối thiểu)
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Sản phẩm: {consolidationData?.product_name}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Đơn vị: {consolidationData?.cooperative_name} | Mã hồ sơ:{' '}
            {consolidationData?.application_code}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          disabled={isConsolidatePending || !isQuorumMet}
          onClick={onConsolidate}
          title={!isQuorumMet ? 'Cần tối thiểu 3 thành viên Hội đồng nộp điểm để đạt túc số (Quorum)' : undefined}
        >
          <Calculator className="w-5 h-5 mr-2" />
          Tổng Hợp Điểm Trung Bình &amp; Khống Chế Sao
        </Button>
      </div>

      {/* Quorum Warning Flag if < 3 evaluators */}
      {!isQuorumMet && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl text-rose-900 space-y-1">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>CẢNH BÁO CHƯA ĐẠT TÚC SỐ HỘI ĐỒNG (QUORUM NOT MET)</span>
          </div>
          <p className="text-xs text-rose-800 pl-7">
            Quy định thẩm định OCOP yêu cầu Hội đồng đánh giá phải có tối thiểu <strong>3 thành viên</strong> tham gia chấm điểm độc lập và khóa phiếu điểm trước khi tổng hợp kết quả (hiện chỉ có <strong>{evaluatorCount} thành viên</strong>). Vui lòng phân công thêm thành viên Hội đồng.
          </p>
        </div>
      )}

      {/* Discrepancy Warning Flag (> 10.00 points) */}
      {consolidationData?.has_score_discrepancy && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-900 space-y-1">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>CẢNH BÁO LỆCH ĐIỂM GIỮA CÁC GIÁM KHẢO (&gt; 10.00 ĐIỂM)</span>
          </div>
          <p className="text-xs text-amber-800 pl-7">
            Khoảng lệch điểm lớn nhất giữa các Giám khảo là{' '}
            <strong className="font-semibold">
              {consolidationData.score_gap.toFixed(2)} điểm
            </strong>{' '}
            (vượt ngưỡng cho phép 10.00 điểm theo BR-CALC-003). Chủ tịch Hội đồng cần tổ chức
            thảo luận lại để đối chiếu trước khi chốt điểm.
          </p>
        </div>
      )}

      {/* Table of evaluators scores */}
      <Card title="Kết Quả Chấm Điểm Cá Nhân Từ Các Giám Khảo">
        <div className="divide-y divide-gray-200">
          {consolidationData?.evaluators.map((ev: any, idx: number) => (
            <div key={idx} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-900">{ev.name}</div>
                <div className="text-xs text-gray-500">{ev.role}</div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-emerald-800">
                  {ev.total_score.toFixed(1)} điểm
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center">
                  <Lock className="w-3 h-3 mr-1" /> Đã Khóa
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Proposed Classification result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-lg space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Điểm Trung Bình Hội Đồng
          </span>
          <div className="text-4xl font-black text-amber-400">
            {consolidationData?.average_score.toFixed(2)} / 100.0
          </div>
          <div className="text-xs text-emerald-100">
            Giá trị trung bình cộng điểm số từ 3 giám khảo độc lập.
          </div>
        </div>

        <div className="p-6 bg-white border border-emerald-200 rounded-2xl shadow-lg space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Phân Hạng Sao Đề Xuất (Proposed Star Classification)
          </span>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${
                  star <= (consolidationData?.proposed_stars || 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-2xl font-bold text-gray-900 ml-2">
              {consolidationData?.proposed_stars} SAO
            </span>
          </div>

          {consolidationData?.is_downgraded_by_mandatory && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
              <div className="font-bold flex items-center text-red-900">
                <ShieldAlert className="w-4 h-4 mr-1 text-red-600" />
                Áp dụng quy tắc Khống chế Hạ sao (BR-OCOP-012)
              </div>
              <div>{consolidationData.downgrade_reason}</div>
            </div>
          )}
        </div>
      </div>

      {/* Ready for Final Decision Call To Action Banner */}
      <div className="p-5 bg-white border border-emerald-300 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10.5px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              Sẵn sàng ban hành
            </span>
            <span className="text-xs text-slate-500 font-semibold">Quy chuẩn QĐ 148 &amp; 1489/QĐ-TTg</span>
          </div>
          <h4 className="text-base font-black text-slate-900 mt-1">
            Kết quả thẩm định đã sẵn sàng để trình Ban hành Quyết định công nhận sao
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Chuyển tiếp kết quả đã khống chế sao sang phân hệ Ban hành Quyết định &amp; Kết xuất Giấy chứng nhận OCOP 36 tháng.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/ocop/decisions')}
          className="cursor-pointer"
        >
          <Award className="w-5 h-5 mr-2" />
          Chuyển sang Ban Hành Quyết Định OCOP
        </Button>
      </div>
    </div>
  );
};
