import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Star,
  Award,
  CheckCircle2,
  Sparkles,
  Wheat,
  QrCode,
  Tag,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Link as LinkIcon,
  FileSpreadsheet,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productApi,
  ProductItem,
  CreateProductPayload,
  AttachProductLotPayload,
} from '@/services/productApi';
import { fetchHarvests } from '@/services/harvestApi';
import type { HarvestItem } from '@/types/agriculture';
import { exportToExcel } from '@/utils/exportUtils';

const money = (n?: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'ALL'>('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Queries
  const { data: products = [], isLoading: loadingProducts } = useQuery<ProductItem[]>({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts(),
  });

  const { data: harvests = [] } = useQuery<HarvestItem[]>({
    queryKey: ['harvests'],
    queryFn: () => fetchHarvests(),
  });

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProductPayload>({
    product_code: `PRD-${Date.now().toString().slice(-4)}`,
    product_name: '',
    category: 'Rau củ quả tươi cao cấp',
    specification: 'Túi 500g đạt chuẩn KCS',
    brand: 'HTX Nông nghiệp Tân Tiến',
    star_rating: 4,
    price: 65000,
    unit: 'Túi 500g',
  });

  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [attachQuantity, setAttachQuantity] = useState<number>(500);

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => productApi.createProduct(payload),
    onSuccess: (newProd) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCreateModalOpen(false);
      showToast(`Đã thêm sản phẩm OCOP "${newProd.product_name}" thành công!`);
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi tạo sản phẩm', 'danger');
    },
  });

  const attachLotMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: AttachProductLotPayload }) =>
      productApi.attachLotToProduct(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setAttachModalOpen(false);
      showToast('Đã liên kết Lô thu hoạch GS1 vào sản phẩm OCOP thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi liên kết lô thu hoạch', 'danger');
    },
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.product_code.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchStar = starFilter === 'ALL' || (p.star_rating || p.quality_information?.star_rating) === starFilter;
    return matchSearch && matchStar;
  });

  const totalStar5 = products.filter((p) => (p.star_rating || p.quality_information?.star_rating) === 5).length;
  const totalStar4 = products.filter((p) => (p.star_rating || p.quality_information?.star_rating) === 4).length;
  const totalStar3 = products.filter((p) => (p.star_rating || p.quality_information?.star_rating) === 3).length;
  const totalLotsLinked = products.reduce((sum, p) => sum + (p.lots_count || 0), 0);

  const handleOpenAttachLot = (productId?: string) => {
    if (productId) {
      setSelectedProductId(productId);
    } else if (products.length > 0) {
      setSelectedProductId(products[0].id);
    }
    if (harvests.length > 0) {
      setSelectedLotId(harvests[0].lot_id || harvests[0].id);
    }
    setAttachModalOpen(true);
  };

  const handleExportProductsExcel = () => {
    if (!products || products.length === 0) {
      showToast('Không có sản phẩm nào để xuất Excel!', 'danger');
      return;
    }

    const exportRows = products.map((p, index) => {
      const star = p.star_rating || p.quality_information?.star_rating || 4;
      return {
        'STT': index + 1,
        'Mã sản phẩm': p.product_code,
        'Tên sản phẩm OCOP': p.product_name,
        'Phân hạng OCOP': `${star} sao`,
        'Danh mục': p.category,
        'Thương hiệu': p.brand || 'HTX Nông nghiệp Tân Tiến',
        'Quy cách đóng gói': p.specification || '',
        'Giá bán tham chiếu': p.price ? `${p.price.toLocaleString('vi-VN')} đ` : '-',
        'Đơn vị tính': p.unit || 'Kg',
        'Trạng thái': p.status === 'ACTIVE' ? 'Đang lưu hành' : 'Tạm ngưng',
      };
    });

    exportToExcel(exportRows, 'Danh_Muc_San_Pham_OCOP_HTX_Tan_Tien', 'SanPhamOCOP');
    showToast('Xuất danh mục sản phẩm OCOP sang file Excel (.xlsx) thành công!');
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-subtle">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Award className="w-4 h-4 text-emerald-600" /> Chu trình Đánh giá & Phân hạng OCOP (QĐ 148/QĐ-TTg)
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Danh Mục Sản Phẩm OCOP & Liên Kết Lô GS1
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Quản lý nhãn hiệu, số quyết định cấp sao UBND và liên kết lô tem truy xuất nguồn gốc GS1 từ ruộng đất.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportProductsExcel()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[12.5px] border border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Xuất Excel Sản Phẩm
          </button>
          <button
            onClick={() => handleOpenAttachLot()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[12.5px] border border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            <LinkIcon className="w-4 h-4 text-emerald-700" />
            Liên kết Lô tem GS1
          </button>
          <button
            onClick={() => {
              setCreateForm({
                product_code: `PRD-${Date.now().toString().slice(-4)}`,
                product_name: '',
                category: 'Rau củ quả tươi cao cấp',
                specification: 'Túi 500g đạt chuẩn KCS',
                brand: 'HTX Nông nghiệp Tân Tiến',
                star_rating: 4,
                price: 65000,
                unit: 'Túi 500g',
              });
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[12.5px] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" /> Tổng Sản Phẩm OCOP
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
              HTX TÂN TIẾN
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{products.length} sản phẩm</div>
          <div className="text-[11px] text-slate-400 mt-1">Đã được chứng nhận hoặc đang đánh giá</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Sản Phẩm 4 Sao OCOP
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black">
              CẤP TỈNH
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{totalStar4} sản phẩm</div>
          <div className="text-[11px] text-slate-500 mt-1">UBND Tỉnh Lâm Đồng công nhận</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-sky-500 text-sky-500" /> Sản Phẩm 3 Sao OCOP
            </span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-black">
              CẤP HUYỆN
            </span>
          </div>
          <div className="text-2xl font-black text-sky-700 mt-2">{totalStar3} sản phẩm</div>
          <div className="text-[11px] text-slate-500 mt-1">UBND Huyện Lạc Dương công nhận</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-600" /> Lô Tem GS1 Đã Gán
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
              TRUY XUẤT
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{totalLotsLinked} lô hàng</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">Tích hợp mã QR GS1-128 chuẩn quốc gia</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, mã OCOP, danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Phân hạng OCOP:</span>
          <select
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-bold text-slate-700"
          >
            <option value="ALL">Tất cả phân hạng</option>
            <option value={5}>5 sao (Cấp Quốc gia)</option>
            <option value={4}>4 sao (Cấp Tỉnh)</option>
            <option value={3}>3 sao (Cấp Huyện)</option>
          </select>
        </div>
      </div>

      {/* Grid of Product Cards */}
      {loadingProducts ? (
        <div className="text-center py-12 text-slate-400 text-xs font-medium">Đang nạp danh mục sản phẩm OCOP...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs font-medium">
          Không tìm thấy sản phẩm nào phù hợp điều kiện tìm kiếm.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const star = p.star_rating || p.quality_information?.star_rating || 4;
            const certNum = p.quality_information?.ocop_cert_number || 'QĐ-UBND-2026-089';
            return (
              <div
                key={p.id}
                className="bg-white border border-[#e7e9ec] rounded-2xl p-4.5 shadow-subtle hover:shadow-panel transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {p.product_code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Đạt OCOP {star} Sao
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-black text-[15px] text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {p.product_name}
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">{p.category}</p>
                    {p.specification && (
                      <p className="text-[11.5px] text-slate-400 italic mt-0.5 truncate">
                        {typeof p.specification === 'string'
                          ? p.specification
                          : ((p.specification as any)?.package || (p.specification as any)?.packaging || JSON.stringify(p.specification))}
                      </p>
                    )}
                  </div>

                  {/* Star Rating Badge Box */}
                  <div className="mt-3.5 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider">
                        Quyết Định Công Nhận:
                      </div>
                      <div className="text-[11.5px] font-extrabold text-slate-800 font-mono">{certNum}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-amber-200 shadow-2xs">
                      {Array.from({ length: star }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[12px] font-black text-amber-800 ml-1">{star} sao</span>
                    </div>
                  </div>

                  {/* Linked GS1 Lots status */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="text-[10.5px] font-bold text-slate-500 uppercase">Lô tem GS1 liên kết:</div>
                        <div className="text-[12px] font-black text-slate-900">
                          {p.lots_count || 1} lô thu hoạch đang lưu hành
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenAttachLot(p.id)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg shadow-2xs transition-colors"
                    >
                      + Gán thêm lô
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[12.8px]">
                  <div>
                    <div className="text-[10.5px] text-slate-400 font-bold">Giá bán tham chiếu:</div>
                    <div className="font-black text-emerald-700 text-base">{money(p.price)}</div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {p.unit || 'Kg'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: THÊM SẢN PHẨM MỚI */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-modal border border-slate-100">
            <div className="flex items-center gap-2 text-emerald-800">
              <Package className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-extrabold text-slate-900">Thêm Sản Phẩm OCOP Mới</h3>
            </div>
            <p className="text-xs text-slate-500">
              Đăng ký sản phẩm thương mại và định danh hồ sơ OCOP theo quy định Luật HTX 2023.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProductMutation.mutate(createForm);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã sản phẩm *</label>
                  <input
                    type="text"
                    value={createForm.product_code}
                    onChange={(e) => setCreateForm({ ...createForm, product_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân hạng OCOP dự kiến</label>
                  <select
                    value={createForm.star_rating}
                    onChange={(e) => setCreateForm({ ...createForm, star_rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-amber-800"
                  >
                    <option value={3}>3 sao (Cấp Huyện)</option>
                    <option value={4}>4 sao (Cấp Tỉnh)</option>
                    <option value={5}>5 sao (Cấp Quốc gia)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên sản phẩm OCOP *</label>
                <input
                  type="text"
                  value={createForm.product_name}
                  onChange={(e) => setCreateForm({ ...createForm, product_name: e.target.value })}
                  placeholder="Ví dụ: Ớt Chuông Sweet Palermo Đỏ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh mục nông sản</label>
                  <input
                    type="text"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thương hiệu / Xuất xứ</label>
                  <input
                    type="text"
                    value={createForm.brand}
                    onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quy cách đóng gói & Bảo quản</label>
                <input
                  type="text"
                  value={createForm.specification}
                  onChange={(e) => setCreateForm({ ...createForm, specification: e.target.value })}
                  placeholder="Ví dụ: Túi hút chân không 500g, bảo quản 8-12°C"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá bán tham chiếu (đ)</label>
                  <input
                    type="number"
                    step="1000"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-emerald-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={createForm.unit}
                    onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                    placeholder="Túi 500g, Hộp 1kg, Kg..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-extrabold hover:bg-emerald-800 shadow-md"
                >
                  {createProductMutation.isPending ? 'Đang tạo...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LIÊN KẾT LÔ THU HOẠCH GS1 VÀO SẢN PHẨM OCOP */}
      {/* ========================================================================= */}
      {attachModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-modal border border-slate-100">
            <div className="flex items-center gap-2 text-emerald-800">
              <LinkIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-extrabold text-slate-900">Liên Kết Lô Thu Hoạch Vào Sản Phẩm OCOP</h3>
            </div>
            <p className="text-xs text-slate-500">
              Gán lô nông sản đạt KCS Grade A từ nhật ký thu hoạch vào mã sản phẩm OCOP để in tem GS1-128 chuẩn quốc gia.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedProductId || !selectedLotId) {
                  showToast('Vui lòng chọn đầy đủ sản phẩm và lô thu hoạch!', 'danger');
                  return;
                }
                attachLotMutation.mutate({
                  productId: selectedProductId,
                  payload: {
                    lot_id: selectedLotId,
                    quantity: attachQuantity,
                  },
                });
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Sản phẩm OCOP *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} ({p.product_code}) - {p.star_rating || 4} Sao
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Lô Thu Hoạch Đạt KCS *</label>
                <select
                  value={selectedLotId}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-emerald-800 font-bold"
                  required
                >
                  {harvests.map((h) => (
                    <option key={h.id} value={h.lot_id || h.id}>
                      {h.lot_code || h.harvest_code} - {h.plot_name} ({h.grade_a_kg} kg Loại A, Brix {h.brix_level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số lượng phân bổ tem GS1 (Gói / Hộp)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={attachQuantity}
                  onChange={(e) => setAttachQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Số lượng bao bì thành phẩm dự kiến dán tem truy xuất nguồn gốc của lô này.
                </span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Chuỗi truy xuất khép kín:</strong> Người tiêu dùng quét mã QR trên bao bì sản phẩm OCOP này sẽ
                  xem được trọn vẹn nhật ký canh tác của thửa đất, kết quả kiểm nghiệm Quick Lab và giấy chứng nhận OCOP
                  hợp lệ.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAttachModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={attachLotMutation.isPending}
                  className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-extrabold hover:bg-emerald-800 shadow-md flex items-center gap-1.5"
                >
                  {attachLotMutation.isPending ? 'Đang liên kết...' : 'Xác nhận liên kết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
