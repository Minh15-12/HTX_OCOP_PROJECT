import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Award, CheckCircle2, AlertCircle, Link as LinkIcon, FileSpreadsheet } from 'lucide-react';
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
import { Pagination } from '@/components/ui/Pagination';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { ProductCard } from '../components/ProductCard';
import { CreateProductModal } from '../components/CreateProductModal';
import { AttachLotModal } from '../components/AttachLotModal';
import { ProductDrawer } from '../components/drawer/ProductDrawer';
import { ProductKpiCards } from '../components/ProductKpiCards';
import { FinishedWarehousesTab } from '../components/FinishedWarehousesTab';
import { Building2, Layers } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeCooperative } = useTenantContextStore();

  const [activeTab, setActiveTab] = useState<'products' | 'warehouses'>('products');
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

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
    specification: '',
    brand: activeCooperative?.legal_name || '',
    star_rating: 3,
    price: 0,
    unit: 'kg',
  });
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [attachQuantity, setAttachQuantity] = useState<number>(0);

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => productApi.createProduct(payload),
    onSuccess: (newProd) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCreateModalOpen(false);
      showToast(`Đã thêm sản phẩm OCOP "${newProd.product_name}" thành công!`);
    },
    onError: (err: any) => showToast(err?.message || 'Có lỗi khi tạo sản phẩm', 'danger'),
  });

  const attachLotMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: AttachProductLotPayload }) => productApi.attachLotToProduct(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setAttachModalOpen(false);
      showToast('Đã liên kết Lô thu hoạch GS1 vào sản phẩm OCOP thành công!');
    },
    onError: (err: any) => showToast(err?.message || 'Có lỗi khi liên kết lô thu hoạch', 'danger'),
  });

  const normalizeSearch = (s: string) =>
    (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const filteredProducts = products.filter((p) => {
    const term = normalizeSearch(search);
    const matchSearch =
      !term ||
      normalizeSearch(p.product_name).includes(term) ||
      normalizeSearch(p.product_code).includes(term) ||
      normalizeSearch(p.category).includes(term);
    const star = p.star_rating || p.quality_information?.star_rating || 0;
    const matchStar = starFilter === 'ALL' || star === starFilter;
    return matchSearch && matchStar;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, starFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const totalStar5 = products.filter(
    (p) => (p.star_rating || p.quality_information?.star_rating) === 5
  ).length;
  const totalStar4 = products.filter(
    (p) => (p.star_rating || p.quality_information?.star_rating) === 4
  ).length;
  const totalStar3 = products.filter(
    (p) => (p.star_rating || p.quality_information?.star_rating) === 3
  ).length;
  const totalLotsLinked = products.reduce((sum, p) => sum + (p.lots_count || 0), 0);

  const handleOpenAttachLot = (productId?: string) => {
    if (productId) setSelectedProductId(productId);
    else if (products.length > 0) setSelectedProductId(products[0].id);
    if (harvests.length > 0) setSelectedLotId(harvests[0].lot_id || harvests[0].id);
    setAttachModalOpen(true);
  };

  const handleExportProductsExcel = () => {
    if (!products || products.length === 0) {
      showToast('Không có sản phẩm nào để xuất Excel!', 'danger');
      return;
    }
    const exportRows = products.map((p, index) => {
      const rating = p.star_rating || p.quality_information?.star_rating;
      return {
        STT: index + 1,
        'Mã sản phẩm': p.product_code,
        'Tên sản phẩm OCOP': p.product_name,
        'Phân hạng OCOP': rating ? `${rating} sao` : 'Chưa phân hạng',
        'Danh mục': p.category,
        'Thương hiệu': p.brand || activeCooperative?.legal_name || 'Hợp tác xã',
        'Quy cách đóng gói': p.specification || '',
        'Giá bán tham chiếu': p.price ? `${p.price.toLocaleString('vi-VN')} đ` : '-',
        'Đơn vị tính': p.unit || 'Kg',
        'Trạng thái': p.status === 'ACTIVE' ? 'Đang lưu hành' : 'Tạm ngưng',
      };
    });
    exportToExcel(exportRows, 'Danh_Muc_San_Pham_OCOP', 'SanPhamOCOP');
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
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
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
                specification: '',
                brand: activeCooperative?.legal_name || '',
                star_rating: 3,
                price: 0,
                unit: 'kg',
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
      <ProductKpiCards
        totalProducts={products.length}
        totalStar5={totalStar5}
        totalStar4={totalStar4}
        totalStar3={totalStar3}
        totalLotsLinked={totalLotsLinked}
        cooperativeCode={activeCooperative?.short_name || activeCooperative?.cooperative_code || 'HTX'}
      />

      {/* 2-Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tab 1: Thành Phẩm OCOP &amp; Liên Kết Lô GS1 ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
            activeTab === 'warehouses'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tab 2: Kho Thành Phẩm &amp; Bảo Quản</span>
        </button>
      </div>

      {activeTab === 'warehouses' ? (
        <FinishedWarehousesTab />
      ) : (
        <>
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
            onChange={(e) =>
              setStarFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
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
        <div className="text-center py-12 text-slate-400 text-xs font-medium">
          Đang nạp danh mục sản phẩm OCOP...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs font-medium">
          Không tìm thấy sản phẩm nào phù hợp điều kiện tìm kiếm.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenAttachLot={(id) => handleOpenAttachLot(id)}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
                isSelected={selectedProduct?.id === p.id}
              />
            ))}
          </div>

          {filteredProducts.length > 0 && (
            <div className="bg-white border border-[#e7e9ec] rounded-2xl p-3 shadow-subtle">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 24]}
              />
            </div>
          )}
        </>
      )}
    </>
  )}

      {/* Modals */}
      <CreateProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={(e) => {
          e.preventDefault();
          createProductMutation.mutate(createForm);
        }}
        isPending={createProductMutation.isPending}
      />

      <AttachLotModal
        isOpen={attachModalOpen}
        onClose={() => setAttachModalOpen(false)}
        products={products}
        harvests={harvests}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        selectedLotId={selectedLotId}
        setSelectedLotId={setSelectedLotId}
        attachQuantity={attachQuantity}
        setAttachQuantity={setAttachQuantity}
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
        isPending={attachLotMutation.isPending}
      />

      {/* Product Detail Drawer */}
      <ProductDrawer
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenAttachLot={(id) => {
          setSelectedProduct(null);
          handleOpenAttachLot(id);
        }}
      />
    </div>
  );
};

export default ProductsPage;
