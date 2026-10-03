import React, { useState } from 'react';
import { Package, Plus, Search, Star, Award, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  starRating: 3 | 4 | 5;
  price: number;
  unit: string;
  certDate: string;
  status: 'CERTIFIED' | 'IN_REVIEW';
}

const mockProducts: Product[] = [
  {
    id: 'SP001',
    name: 'Trà Oolong Cầu Đất Thượng Hạng',
    code: 'SP-OCOP-01',
    category: 'Trà & Đồ uống',
    starRating: 4,
    price: 350000,
    unit: 'Hộp 250g',
    certDate: '15/12/2024',
    status: 'CERTIFIED',
  },
  {
    id: 'SP002',
    name: 'Cà phê Arabica Cầu Đất Nguyên Chất',
    code: 'SP-OCOP-02',
    category: 'Cà phê',
    starRating: 4,
    price: 220000,
    unit: 'Túi 500g',
    certDate: '20/10/2024',
    status: 'CERTIFIED',
  },
  {
    id: 'SP003',
    name: 'Dâu Tây Đà Lạt Sấy Dẻo',
    code: 'SP-OCOP-03',
    category: 'Hoa quả sấy',
    starRating: 3,
    price: 180000,
    unit: 'Hộp 300g',
    certDate: '05/01/2025',
    status: 'CERTIFIED',
  },
  {
    id: 'SP004',
    name: 'Sầu Riêng Ri6 Thọ Lâm Đóng Khay',
    code: 'SP-OCOP-04',
    category: 'Trái cây tươi',
    starRating: 5,
    price: 280000,
    unit: 'Khay 500g',
    certDate: 'Đang đánh giá 2026',
    status: 'IN_REVIEW',
  },
];

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Sản phẩm HTX & Phân hạng OCOP
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Danh mục sản phẩm thương mại, sản phẩm đạt chứng nhận OCOP 3 sao, 4 sao và 5 sao.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] shadow-sm transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle hover:shadow-panel transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-400">{p.code}</span>
                {p.status === 'CERTIFIED' ? (
                  <span className="pill-badge pill-green">Đã chứng nhận</span>
                ) : (
                  <span className="pill-badge pill-blue">Đang đánh giá</span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="font-extrabold text-[14px] text-slate-900 leading-snug">{p.name}</h3>
                <p className="text-[11.8px] text-slate-500 mt-0.5">{p.category}</p>
              </div>

              {/* Star Rating Display */}
              <div className="mt-3 p-2 bg-amber-50/80 border border-amber-100 rounded-lg flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-amber-900">Phân hạng OCOP:</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: p.starRating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[12px] font-black text-amber-800 ml-1">{p.starRating} sao</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[12.8px]">
              <div>
                <div className="text-[11px] text-slate-400">Giá bán tham chiếu:</div>
                <div className="font-black text-emerald-700">{p.price.toLocaleString('vi-VN')} ₫</div>
              </div>
              <span className="text-[11.5px] font-medium text-slate-500">{p.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
