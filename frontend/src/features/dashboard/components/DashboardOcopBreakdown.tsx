import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardOcopBreakdownProps {
  ocopApplications: any[];
  ocopDraftCount: number;
  ocopEvaluatingCount: number;
  ocopCertifiedCount: number;
  ocopTotal: number;
}

export const DashboardOcopBreakdown: React.FC<DashboardOcopBreakdownProps> = ({
  ocopApplications,
  ocopDraftCount,
  ocopEvaluatingCount,
  ocopCertifiedCount,
  ocopTotal,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e7e9ec] bg-slate-50/50">
        <div>
          <h3 className="font-bold text-[14.5px] text-slate-900">
            Tiến độ hồ sơ OCOP theo trạng thái
          </h3>
          <p className="text-[11.8px] text-slate-500">Đợt đánh giá phân hạng QĐ 148</p>
        </div>
        <button
          onClick={() => navigate('/ocop/dossiers')}
          className="text-emerald-700 hover:text-emerald-800 text-[12.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4">
        <table className="w-full text-left border-collapse text-[12.9px]">
          <thead>
            <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/80">
              <th className="py-2.5 px-3">Trạng thái</th>
              <th className="py-2.5 px-3">Số hồ sơ</th>
              <th className="py-2.5 px-3 w-[45%]">Tỉ lệ hoàn thành</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-3">
                <span className="pill-badge pill-amber">Chờ nộp minh chứng</span>
              </td>
              <td className="py-3 px-3 font-bold text-slate-800">
                {`${ocopDraftCount} hồ sơ`}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.round((ocopDraftCount / (ocopTotal || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11.5px] font-bold text-slate-600">
                    {Math.round((ocopDraftCount / (ocopTotal || 1)) * 100)}%
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="py-3 px-3">
                <span className="pill-badge pill-blue">Đang chấm điểm</span>
              </td>
              <td className="py-3 px-3 font-bold text-slate-800">
                {`${ocopEvaluatingCount} hồ sơ`}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.round((ocopEvaluatingCount / (ocopTotal || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11.5px] font-bold text-slate-600">
                    {Math.round((ocopEvaluatingCount / (ocopTotal || 1)) * 100)}%
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="py-3 px-3">
                <span className="pill-badge pill-green">Đã chứng nhận OCOP</span>
              </td>
              <td className="py-3 px-3 font-bold text-slate-800">
                {`${ocopCertifiedCount} hồ sơ`}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.round((ocopCertifiedCount / (ocopTotal || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11.5px] font-bold text-slate-600">
                    {Math.round((ocopCertifiedCount / (ocopTotal || 1)) * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
