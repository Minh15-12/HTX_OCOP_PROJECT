import React, { useState } from 'react';
import { Sprout, MapPin, Plus, Search, Layers, User, Calendar } from 'lucide-react';

interface FarmPlot {
  id: string;
  name: string;
  code: string;
  areaHa: number;
  cropType: string;
  ownerName: string;
  location: string;
  status: 'ACTIVE' | 'FALLOW' | 'PREPARING';
  soilType: string;
}

const mockPlots: FarmPlot[] = [
  {
    id: 'VT001',
    name: 'Vùng trồng Trà Oolong Cầu Đất #1',
    code: 'VT-LAMHA-01',
    areaHa: 12.5,
    cropType: 'Trà Oolong',
    ownerName: 'Nguyễn Văn An',
    location: 'Thôn 2, Xã Liên Hà',
    status: 'ACTIVE',
    soilType: 'Đất đỏ Bazan',
  },
  {
    id: 'VT002',
    name: 'Vùng trồng Cà phê Arabica Cầu Đất',
    code: 'VT-LAMHA-02',
    areaHa: 25.0,
    cropType: 'Cà phê Arabica',
    ownerName: 'Trần Thị Bình',
    location: 'Thôn 1, Xã Tân Hà',
    status: 'ACTIVE',
    soilType: 'Đất đỏ Bazan',
  },
  {
    id: 'VT003',
    name: 'Vùng trồng Dâu Tây Đà Lạt VietGAP',
    code: 'VT-LAMHA-03',
    areaHa: 4.8,
    cropType: 'Dâu Tây New Zealand',
    ownerName: 'Lê Hoàng Cường',
    location: 'Thôn 4, Xã Đinh Văn',
    status: 'ACTIVE',
    soilType: 'Đất phù sa cổ',
  },
  {
    id: 'VT004',
    name: 'Vùng trồng Sầu Riêng Ri6 Thọ Lâm',
    code: 'VT-LAMHA-04',
    areaHa: 15.2,
    cropType: 'Sầu Riêng Ri6',
    ownerName: 'Phạm Thị Duyên',
    location: 'Thôn 3, Xã Liên Hà',
    status: 'PREPARING',
    soilType: 'Đất thịt nhẹ',
  },
];

export const FarmPlotsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');

  const filteredPlots = mockPlots.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Vùng trồng & Đơn vị sản xuất
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Quản lý mã số vùng trồng, diện tích, chủ sở hữu, loại cây trồng và theo dõi hiện trạng thổ nhưỡng.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] shadow-sm transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Khai báo vùng trồng mới
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-3.5 bg-white border border-[#e7e9ec] rounded-xl shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên vùng trồng, mã số, hộ quản lý..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-[12.5px] font-bold rounded-lg border transition-colors ${
              viewMode === 'grid'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dạng Lưới (Grid)
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-[12.5px] font-bold rounded-lg border transition-colors ${
              viewMode === 'table'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dạng Bảng (Table)
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlots.map((plot) => (
            <div
              key={plot.id}
              className="bg-white border border-[#e7e9ec] rounded-xl overflow-hidden shadow-subtle hover:shadow-panel transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Banner */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/60 border-b border-emerald-100 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-slate-900 leading-tight">{plot.name}</h3>
                      <p className="text-[11px] font-mono text-emerald-800 font-bold mt-0.5">{plot.code}</p>
                    </div>
                  </div>
                  {plot.status === 'ACTIVE' && <span className="pill-badge pill-green">Đang canh tác</span>}
                  {plot.status === 'PREPARING' && <span className="pill-badge pill-amber">Chuẩn bị đất</span>}
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-2.5 text-[12.6px]">
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" /> Diện tích:
                    </span>
                    <span className="font-extrabold text-slate-900">{plot.areaHa} ha</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-slate-400" /> Loại cây trồng:
                    </span>
                    <span className="font-bold text-emerald-700">{plot.cropType}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Hộ phụ trách:
                    </span>
                    <span className="font-semibold text-slate-900">{plot.ownerName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-dashed border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Vị trí:
                    </span>
                    <span className="font-medium text-slate-700">{plot.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-[#e7e9ec] flex items-center justify-between text-[12px]">
                <span className="text-slate-500 font-medium">Thổ nhưỡng: {plot.soilType}</span>
                <button className="text-emerald-700 hover:text-emerald-800 font-bold">
                  Chi tiết vùng &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
          <table className="w-full text-left border-collapse text-[12.9px]">
            <thead>
              <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                <th className="py-3 px-4">Mã Vùng</th>
                <th className="py-3 px-4">Tên Vùng trồng</th>
                <th className="py-3 px-4">Loại cây trồng</th>
                <th className="py-3 px-4">Diện tích</th>
                <th className="py-3 px-4">Hộ quản lý</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlots.map((plot) => (
                <tr key={plot.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-600 text-[12px]">{plot.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{plot.name}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">{plot.cropType}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{plot.areaHa} ha</td>
                  <td className="py-3 px-4 text-slate-800">{plot.ownerName}</td>
                  <td className="py-3 px-4">
                    {plot.status === 'ACTIVE' && <span className="pill-badge pill-green">Đang canh tác</span>}
                    {plot.status === 'PREPARING' && <span className="pill-badge pill-amber">Chuẩn bị đất</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
