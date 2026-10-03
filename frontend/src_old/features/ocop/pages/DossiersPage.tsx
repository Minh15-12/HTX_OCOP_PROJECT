import React, { useState } from 'react';
import { Award, Plus, Search, Star, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OcopDossier {
  id: string;
  code: string;
  productName: string;
  targetStar: 3 | 4 | 5;
  submittedBy: string;
  progressPercent: number;
  status: 'DRAFT' | 'PENDING_EVIDENCE' | 'IN_EVALUATION' | 'APPROVED' | 'CERTIFIED';
  statusLabel: string;
  year: number;
}

const mockDossiers: OcopDossier[] = [
  {
    id: 'DOS-2026-001',
    code: 'HS-OCOP-2026-01',
    productName: 'Trà Oolong Cầu Đất Thượng Hạng',
    targetStar: 4,
    submittedBy: 'HTX Nông nghiệp Xanh Phú Thịnh',
    progressPercent: 85,
    status: 'IN_EVALUATION',
    statusLabel: 'Đang chấm điểm Hội đồng',
    year: 2026,
  },
  {
    id: 'DOS-2026-002',
    code: 'HS-OCOP-2026-02',
    productName: 'Cà phê Arabica Cầu Đất Nguyên Chất',
    targetStar: 4,
    submittedBy: 'HTX Nông nghiệp Xanh Phú Thịnh',
    progressPercent: 40,
    status: 'PENDING_EVIDENCE',
    statusLabel: 'Chờ nộp thêm minh chứng',
    year: 2026,
  },
  {
    id: 'DOS-2026-003',
    code: 'HS-OCOP-2026-03',
    productName: 'Sầu Riêng Ri6 Thọ Lâm Đóng Khay',
    targetStar: 5,
    submittedBy: 'HTX Nông nghiệp Xanh Phú Thịnh',
    progressPercent: 100,
    status: 'CERTIFIED',
    statusLabel: 'Đã chứng nhận 5 sao',
    year: 2026,
  },
  {
    id: 'DOS-2026-004',
    code: 'HS-OCOP-2026-04',
    productName: 'Dâu Tây Đà Lạt Sấy Dẻo',
    targetStar: 3,
    submittedBy: 'HTX Nông nghiệp Xanh Phú Thịnh',
    progressPercent: 20,
    status: 'DRAFT',
    statusLabel: 'Nháp soạn thảo',
    year: 2026,
  },
];

export const DossiersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = mockDossiers.filter((d) =>
    d.productName.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Số hóa Hồ sơ Đánh giá Phân hạng OCOP
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Quản lý quá trình lập hồ sơ, đính kèm minh chứng số, chấm điểm tiêu chí và theo dõi phê duyệt.
          </p>
        </div>
        <button
          onClick={() => navigate('/ocop/dossiers/DOS-2026-001')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tạo Hồ sơ OCOP mới
        </button>
      </div>

      {/* Control Filter Bar */}
      <div className="p-3.5 bg-white border border-[#e7e9ec] rounded-xl shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm hồ sơ OCOP theo tên sản phẩm, mã hồ sơ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-700 font-medium focus:outline-none">
            <option>Đợt đánh giá 2026</option>
            <option>Đợt đánh giá 2025</option>
          </select>
        </div>
      </div>

      {/* Table of Dossiers */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
        <table className="w-full text-left border-collapse text-[12.9px]">
          <thead>
            <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
              <th className="py-3 px-4">Mã Hồ Sơ</th>
              <th className="py-3 px-4">Tên Sản phẩm OCOP</th>
              <th className="py-3 px-4">Mục tiêu Sao</th>
              <th className="py-3 px-4 w-[30%]">Tiến độ hoàn thiện</th>
              <th className="py-3 px-4">Trạng thái Hồ sơ</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => (
              <tr
                key={d.id}
                onClick={() => navigate(`/ocop/dossiers/${d.id}`)}
                className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-slate-600 text-[12px]">{d.code}</td>
                <td className="py-3.5 px-4">
                  <div className="font-extrabold text-slate-900">{d.productName}</div>
                  <div className="text-[11.2px] text-slate-500">{d.submittedBy}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-900">{d.targetStar} sao</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          d.progressPercent === 100
                            ? 'bg-emerald-600'
                            : d.progressPercent > 50
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${d.progressPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[11.8px] font-bold text-slate-700 min-w-[36px]">
                      {d.progressPercent}%
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  {d.status === 'CERTIFIED' && <span className="pill-badge pill-green">{d.statusLabel}</span>}
                  {d.status === 'IN_EVALUATION' && <span className="pill-badge pill-blue">{d.statusLabel}</span>}
                  {d.status === 'PENDING_EVIDENCE' && <span className="pill-badge pill-amber">{d.statusLabel}</span>}
                  {d.status === 'DRAFT' && <span className="pill-badge pill-gray">{d.statusLabel}</span>}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1">
                    Mở workspace <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
