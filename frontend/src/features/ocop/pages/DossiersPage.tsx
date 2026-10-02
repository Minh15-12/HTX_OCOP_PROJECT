import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Star, ArrowRight, CheckCircle2, Clock, AlertCircle, FileText, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ocopService, OcopDossier } from '../../../services/ocopService';

export const DossiersPage: React.FC = () => {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<OcopDossier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchDossiers = async () => {
      setLoading(true);
      const data = await ocopService.getDossiers();
      setDossiers(data);
      setLoading(false);
    };
    fetchDossiers();
  }, []);

  const filtered = dossiers.filter((d) => {
    const matchesSearch =
      d.productName.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.submittedBy.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && d.status === statusFilter;
  });

  const getStatusBadge = (status: OcopDossier['status'], label: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="pill-badge pill-gray">{label}</span>;
      case 'HTX_SUBMITTED':
      case 'COMMUNE_REVIEWING':
        return <span className="pill-badge pill-blue">{label}</span>;
      case 'COMMUNE_APPROVED':
      case 'IN_EVALUATION':
      case 'COUNCIL_SCORING':
        return <span className="pill-badge pill-amber">{label}</span>;
      case 'CONSOLIDATED':
      case 'CERTIFIED':
      case 'CERTIFIED_5STAR':
        return <span className="pill-badge pill-green">{label}</span>;
      case 'REJECTED':
      case 'EXPIRED':
      case 'REVOKED':
        return <span className="pill-badge pill-red">{label}</span>;
      default:
        return <span className="pill-badge pill-gray">{label}</span>;
    }
  };

  return (
    <div className="space-y-5 pb-16 animate-fade-in">
      {/* Header Banner for Farmers */}
      <div className="p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-[11.5px] font-extrabold uppercase tracking-wider mb-2 border border-emerald-600/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến &bull; QĐ 148/QĐ-TTg
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Quản lý & Số hóa Hồ sơ Đánh giá Phân hạng OCOP
          </h1>
          <p className="text-[12.8px] text-emerald-100/90 mt-1 max-w-2xl">
            Hướng dẫn nông dân lập hồ sơ OCOP trực quan: Đính kèm minh chứng VietGAP, tự chấm điểm 18 tiêu chí QĐ 148, nộp UBND Xã và theo dõi Hội đồng chấm điểm 4-5 sao.
          </p>
        </div>

        <button
          onClick={() => navigate('/ocop/dossiers/DOS-2026-001')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[13.5px] shadow-md transition-all shrink-0 active:scale-98"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Tạo Hồ sơ OCOP Mới
        </button>
      </div>

      {/* Control Filter Bar */}
      <div className="p-4 bg-white border border-[#e7e9ec] rounded-xl shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm hồ sơ theo tên sản phẩm (Ớt chuông, Trà Oolong...), mã hồ sơ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Trạng thái:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái (4 hồ sơ)</option>
            <option value="DRAFT">Nháp soạn thảo</option>
            <option value="HTX_SUBMITTED">Đã nộp UBND Xã</option>
            <option value="COUNCIL_SCORING">Hội đồng đang chấm điểm</option>
            <option value="CERTIFIED_5STAR">Đã công nhận 5 sao</option>
          </select>
        </div>
      </div>

      {/* Table of OCOP Dossiers */}
      <div className="bg-white border border-[#e7e9ec] rounded-2xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">Đang tải danh sách hồ sơ OCOP...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-extrabold text-slate-700">Không tìm thấy hồ sơ OCOP phù hợp</p>
            <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                <th className="py-3.5 px-4">Mã Hồ Sơ</th>
                <th className="py-3.5 px-4">Sản phẩm OCOP & Chủ thể</th>
                <th className="py-3.5 px-4 text-center">Mục tiêu Sao</th>
                <th className="py-3.5 px-4 w-[28%]">Tiến độ hoàn thiện (%)</th>
                <th className="py-3.5 px-4">Trạng thái Workflow</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => navigate(`/ocop/dossiers/${d.id}`)}
                  className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-4 px-4 font-mono font-bold text-slate-700 text-[12px]">{d.code}</td>

                  <td className="py-4 px-4">
                    <div className="font-black text-slate-900 group-hover:text-emerald-800 transition-colors text-[13.5px]">
                      {d.productName}
                    </div>
                    <div className="text-[11.5px] text-slate-500 font-medium">{d.submittedBy}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">{d.productCategory}</div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-black text-amber-900 text-xs">{d.targetStar} sao</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11.5px] font-bold text-slate-600">
                        <span>Hoàn thiện minh chứng</span>
                        <span className={d.progressPercent === 100 ? 'text-emerald-700 font-black' : 'text-slate-700'}>
                          {d.progressPercent}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            d.progressPercent >= 90
                              ? 'bg-emerald-600'
                              : d.progressPercent >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${d.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    {getStatusBadge(d.status, d.statusLabel)}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/ocop/dossiers/${d.id}`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white font-extrabold text-[12px] transition-all"
                    >
                      Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
