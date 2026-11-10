import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface DossierOverviewTabProps {
  calculation: {
    partAScore: number;
    partBScore: number;
    partCScore: number;
    totalScore: number;
    starLabel: string;
  };
  onGoToSelfEval: () => void;
}

export const DossierOverviewTab: React.FC<DossierOverviewTabProps> = ({
  calculation,
  onGoToSelfEval,
}) => {
  const radarData = [
    {
      subject: 'Phần A (Sản phẩm)',
      fullName: 'Phần A: Sản phẩm & Cộng đồng',
      'Điểm tối đa': 40.0,
      'Điểm đạt được': calculation.partAScore,
    },
    {
      subject: 'Phần B (Tiếp thị)',
      fullName: 'Phần B: Khả năng Tiếp thị',
      'Điểm tối đa': 25.0,
      'Điểm đạt được': calculation.partBScore,
    },
    {
      subject: 'Phần C (Chất lượng)',
      fullName: 'Phần C: Chất lượng Sản phẩm',
      'Điểm tối đa': 35.0,
      'Điểm đạt được': calculation.partCScore,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-6">
      <div className="flex justify-between items-center border-b pb-3 border-slate-200">
        <div>
          <h3 className="font-black text-slate-900 text-sm">
            Kết quả tự đánh giá theo Bộ tiêu chí OCOP 100 điểm (QĐ 148/QĐ-TTg)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân bổ: Phần A (40.0đ) + Phần B (25.0đ) + Phần C (35.0đ) = 100.0đ
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToSelfEval}
          className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          Chỉnh sửa điểm tiêu chí &rsaquo;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left 3 cols: Table */}
        <div className="lg:col-span-3 overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Nhóm tiêu chí QĐ 148</th>
                <th className="py-3 px-4 text-center">Tối đa</th>
                <th className="py-3 px-4 text-center">Đạt được</th>
                <th className="py-3 px-4 text-center">Tỉ lệ (%)</th>
                <th className="py-3 px-4 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800">
                  Phần A: Sản phẩm & sức mạnh cộng đồng
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700">40.0</td>
                <td className="py-3 px-4 text-center font-black text-emerald-800 font-mono">
                  {calculation.partAScore.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">
                  {((calculation.partAScore / 40.0) * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt xuất sắc</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800">
                  Phần B: Khả năng tiếp thị
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700">25.0</td>
                <td className="py-3 px-4 text-center font-black text-blue-800 font-mono">
                  {calculation.partBScore.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">
                  {((calculation.partBScore / 25.0) * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center font-bold text-blue-700">Đạt xuất sắc</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800">
                  Phần C: Chất lượng sản phẩm
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700">35.0</td>
                <td className="py-3 px-4 text-center font-black text-purple-800 font-mono">
                  {calculation.partCScore.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">
                  {((calculation.partCScore / 35.0) * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center font-bold text-purple-700">Đạt xuất sắc</td>
              </tr>
              <tr className="bg-emerald-50/80 font-black text-slate-900 border-t-2 border-emerald-300">
                <td className="py-3 px-4 uppercase text-emerald-950">TỔNG CỘNG HOÀN THÀNH</td>
                <td className="py-3 px-4 text-center font-mono">100.0</td>
                <td className="py-3 px-4 text-center text-emerald-950 text-sm font-mono font-black">
                  {calculation.totalScore.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-center text-emerald-950 text-sm font-mono">
                  {((calculation.totalScore / 100.0) * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center text-emerald-900 font-extrabold uppercase">
                  {calculation.starLabel}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right 2 cols: Radar Chart */}
        <div className="lg:col-span-2 border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-emerald-50/40 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <h4 className="font-extrabold text-slate-900 text-xs">Biểu đồ Ra-đa 3 Nhóm Tiêu chí</h4>
            <span className="pill-badge pill-green text-[10px]">{calculation.starLabel}</span>
          </div>

          <div className="h-60 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 40]} tick={{ fontSize: 9 }} />
                <Radar name="Điểm tối đa" dataKey="Điểm tối đa" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.3} />
                <Radar name="Điểm đạt được" dataKey="Điểm đạt được" stroke="#059669" fill="#10b981" fillOpacity={0.65} />
                <RechartsTooltip formatter={(val: any) => [`${val} điểm`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-[11px] font-bold border-t border-slate-200/80 pt-2 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-300 rounded-full" /> Điểm tối đa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Thực đạt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
