import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { OcopDossierItem } from '../../../services/ocopService';

interface DossiersStatsChartsProps {
  dossiers: OcopDossierItem[];
}

export const DossiersStatsCharts: React.FC<DossiersStatsChartsProps> = ({ dossiers }) => {
  const total = dossiers.length;

  // 1. Doughnut: Tiến độ hoàn thiện
  const completedCount = dossiers.filter(
    (d) => d.progressPercent === 100 || d.status === 'CERTIFIED' || d.status === 'APPROVED'
  ).length;
  const inProgressCount = dossiers.filter(
    (d) => d.progressPercent > 0 && d.progressPercent < 100 && d.status !== 'CERTIFIED' && d.status !== 'APPROVED'
  ).length;
  const pendingCount = total - completedCount - inProgressCount;

  const doughnutData = [
    { name: 'Đã hoàn thành', value: completedCount, color: '#059669' },
    { name: 'Đang thực hiện', value: inProgressCount, color: '#0284c7' },
    { name: 'Chưa hoàn thiện', value: pendingCount > 0 ? pendingCount : 0, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  const avgProgress = total > 0
    ? Math.round(dossiers.reduce((acc, cur) => acc + (cur.progressPercent || 0), 0) / total)
    : 0;

  // 2. Bar: Phân hạng sao mục tiêu
  const star3Count = dossiers.filter((d) => d.targetStar === 3).length;
  const star4Count = dossiers.filter((d) => d.targetStar === 4).length;
  const star5Count = dossiers.filter((d) => d.targetStar === 5).length;

  const barDataStar = [
    { star: '3 sao', count: star3Count, fill: '#0284c7' },
    { star: '4 sao', count: star4Count, fill: '#059669' },
    { star: '5 sao', count: star5Count, fill: '#7c3aed' },
  ];

  // 3. Category Pie Chart
  const categoryMap: Record<string, number> = {};
  dossiers.forEach((d) => {
    let cat = 'Khác';
    if (d.productCategory.includes('Thực phẩm')) cat = 'Thực phẩm';
    else if (d.productCategory.includes('Đồ uống')) cat = 'Đồ uống';
    else if (d.productCategory.includes('Thảo dược')) cat = 'Thảo dược';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const catColors: Record<string, string> = {
    'Thực phẩm': '#059669',
    'Đồ uống': '#0284c7',
    'Thảo dược': '#d97706',
    'Khác': '#64748b',
  };

  const categoryPieData = Object.keys(categoryMap).map((key) => {
    const count = categoryMap[key];
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      name: key,
      value: count,
      percentage: pct,
      color: catColors[key] || '#64748b',
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Donut Chart: Tiến độ hoàn thiện */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="font-extrabold text-slate-900 text-xs border-b pb-2">
          Tiến độ hoàn thiện hồ sơ
        </h4>
        <div className="h-44 relative flex items-center justify-center">
          {doughnutData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doughnutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {doughnutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400 font-medium">Chưa có dữ liệu</div>
          )}
          <div className="absolute text-center">
            <div className="text-xl font-black text-slate-900">{avgProgress}%</div>
            <div className="text-[10px] text-slate-400 font-bold">Trung bình</div>
          </div>
        </div>
      </div>

      {/* Bar Chart: Số lượng SP theo sao */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="font-extrabold text-slate-900 text-xs border-b pb-2">
          Số lượng sản phẩm theo hạng sao
        </h4>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barDataStar}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="star" tick={{ fontSize: 10, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barDataStar.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Nhóm ngành */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="font-extrabold text-slate-900 text-xs border-b pb-2">
          Nhóm ngành sản phẩm
        </h4>
        <div className="h-44 flex items-center">
          {categoryPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie data={categoryPieData} cx="50%" cy="50%" outerRadius={50} dataKey="value">
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-[11px] font-bold text-slate-600 pl-2">
                {categoryPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}: {item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="w-full text-center text-xs text-slate-400 font-medium">Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};
