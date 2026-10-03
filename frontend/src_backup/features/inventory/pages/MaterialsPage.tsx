import React, { useState } from 'react';
import { Warehouse, Plus, Search, AlertTriangle, ArrowDownRight, ArrowUpRight, PackageCheck } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  category: string;
  stockQty: number;
  unit: string;
  minSafetyStock: number;
  unitPrice: number;
  status: 'NORMAL' | 'LOW_STOCK';
}

const mockMaterials: Material[] = [
  {
    id: 'VT001',
    name: 'Phân bón NPK 16-16-8 Đầu Trâu',
    category: 'Phân bón',
    stockQty: 150,
    unit: 'kg',
    minSafetyStock: 300,
    unitPrice: 18000,
    status: 'LOW_STOCK',
  },
  {
    id: 'VT002',
    name: 'Chế phẩm sinh học Trichoderma',
    category: 'Thuốc BVTV Sinh học',
    stockQty: 45,
    unit: 'chai (1L)',
    minSafetyStock: 20,
    unitPrice: 120000,
    status: 'NORMAL',
  },
  {
    id: 'VT003',
    name: 'Bao bì túi zip nhôm OCOP 500g',
    category: 'Vật tư đóng gói',
    stockQty: 850,
    unit: 'cái',
    minSafetyStock: 1000,
    unitPrice: 4500,
    status: 'LOW_STOCK',
  },
  {
    id: 'VT004',
    name: 'Phân hữu cơ vi sinh Sông Gianh',
    category: 'Phân bón',
    stockQty: 1200,
    unit: 'kg',
    minSafetyStock: 500,
    unitPrice: 9500,
    status: 'NORMAL',
  },
];

export const MaterialsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'receipts'>('inventory');
  const [search, setSearch] = useState('');

  const filteredMaterials = mockMaterials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Kho vật tư & Nông cụ
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Theo dõi tồn kho phân bón, thuốc BVTV sinh học, vật tư đóng gói và quản lý phiếu nhập/xuất kho.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[12.5px] transition-all">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            Tạo phiếu Nhập kho
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.5px] transition-all">
            <ArrowUpRight className="w-4 h-4 text-white" />
            Tạo phiếu Xuất kho
          </button>
        </div>
      </div>

      {/* Low Stock Alert Header */}
      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-center justify-between text-[12.8px]">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>
            Có <strong>2 vật tư đang dưới ngưỡng tồn kho an toàn</strong>. Cần lên kế hoạch nhập hàng bổ sung.
          </span>
        </div>
        <span className="pill-badge pill-red">Cảnh báo tồn kho</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e7e9ec] bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-2.5 px-4 text-[13px] font-bold border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Danh mục Tồn kho vật tư
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`py-2.5 px-4 text-[13px] font-bold border-b-2 transition-all ${
            activeTab === 'receipts'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Lịch sử Nhập / Xuất kho
        </button>
      </div>

      {/* Main Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
          <div className="p-3.5 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm vật tư theo tên, danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <table className="w-full text-left border-collapse text-[12.9px]">
            <thead>
              <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                <th className="py-3 px-4">Mã VT</th>
                <th className="py-3 px-4">Tên Vật tư - Nông cụ</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Số lượng tồn</th>
                <th className="py-3 px-4">Ngưỡng an toàn</th>
                <th className="py-3 px-4">Đơn giá tham chiếu</th>
                <th className="py-3 px-4">Trạng thái kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-600 text-[12px]">{m.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                  <td className="py-3 px-4 text-slate-600">{m.category}</td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    {m.stockQty.toLocaleString('vi-VN')} {m.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {m.minSafetyStock.toLocaleString('vi-VN')} {m.unit}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {m.unitPrice.toLocaleString('vi-VN')} ₫ / {m.unit}
                  </td>
                  <td className="py-3 px-4">
                    {m.status === 'LOW_STOCK' ? (
                      <span className="pill-badge pill-red">Cảnh báo thiếu</span>
                    ) : (
                      <span className="pill-badge pill-green">Đủ số lượng</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="bg-white border border-[#e7e9ec] rounded-xl p-6 shadow-subtle text-slate-600 text-[13px]">
          Lịch sử các giao dịch nhập xuất vật tư gần đây sẽ được liệt kê tại đây.
        </div>
      )}
    </div>
  );
};
