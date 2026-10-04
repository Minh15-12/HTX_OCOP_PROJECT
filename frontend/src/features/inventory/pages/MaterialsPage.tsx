import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import {
  Search, Plus, ArrowDownRight, ArrowUpRight, AlertTriangle, Pencil, Trash2, X,
  Package, Wallet, History, Download, ChevronDown, Check, Clock, Sprout,
  UserCheck, ShieldAlert, FileText, Calendar, Filter, Sparkles, Building2, Warehouse as WarehouseIcon
} from 'lucide-react';
import { Material, StockReceipt, MaterialCategory } from '../../../types/inventory';
import { SEED_MATERIALS, SEED_STOCK_RECEIPTS, MOCK_SEASONS, MOCK_MEMBERS_PLOTS } from '../data/inventoryMockData';

/* ---------------------------------- Constants & Utils ---------------------------------- */

const STORAGE_KEY = 'htx_ocop_inventory_v2';

const CATEGORIES: MaterialCategory[] = ['Phân bón', 'Thuốc BVTV Sinh học', 'Vật tư đóng gói', 'Nông cụ'];

const CAT_COLORS: Record<MaterialCategory, string> = {
  'Phân bón': '#2E6B47',
  'Thuốc BVTV Sinh học': '#D97706',
  'Vật tư đóng gói': '#2563EB',
  'Nông cụ': '#854D0E',
};

const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const num = (n: number) => n.toLocaleString('vi-VN');
const todayISO = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// Check expiry status: expired, warning (<= 30 days), normal
const getExpiryStatus = (expiryDate?: string): 'normal' | 'warning' | 'expired' => {
  if (!expiryDate) return 'normal';
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'expired';
  if (diffDays <= 30) return 'warning';
  return 'normal';
};

const getStockStatus = (item: Material): 'het' | 'canhbao' | 'du' => {
  if (item.stockQty <= 0) return 'het';
  if (item.stockQty < item.minSafetyStock) return 'canhbao';
  return 'du';
};

const STATUS_META = {
  du: { label: 'Đủ số lượng', fg: '#15803D', bg: '#DCFCE7' },
  canhbao: { label: 'Cảnh báo thiếu', fg: '#C2410C', bg: '#FFEDD5' },
  het: { label: 'Hết hàng', fg: '#B91C1C', bg: '#FEE2E2' },
};

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../../services/inventoryApi';

/* ---------------------------------- Main Page Component ---------------------------------- */

export const MaterialsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);

  const { data: apiItems } = useQuery({
    queryKey: ['materials'],
    queryFn: () => inventoryApi.getMaterials(),
  });

  const { data: apiHistory } = useQuery({
    queryKey: ['stockReceipts'],
    queryFn: () => inventoryApi.getStockReceipts(),
  });

  const [items, setItems] = useState<Material[]>(SEED_MATERIALS);
  const [history, setHistory] = useState<StockReceipt[]>(SEED_STOCK_RECEIPTS);

  useEffect(() => {
    if (apiItems && apiItems.length > 0) {
      setItems(apiItems);
    }
  }, [apiItems]);

  useEffect(() => {
    if (apiHistory && apiHistory.length > 0) {
      setHistory(apiHistory);
    }
  }, [apiHistory]);

  const [tab, setTab] = useState<'inventory' | 'receipts' | 'allocations' | 'stats'>('inventory');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<keyof Material | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [itemModal, setItemModal] = useState<{ mode: 'add' | 'edit'; data: Partial<Material> } | null>(null);
  const [stockModal, setStockModal] = useState<{ type: 'IN' | 'OUT' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* Derived Metrics */
  const lowStockItems = useMemo(() => items.filter((i) => getStockStatus(i) !== 'du'), [items]);
  const expiringItems = useMemo(() => items.filter((i) => getExpiryStatus(i.expiryDate) !== 'normal'), [items]);
  const totalValue = useMemo(() => items.reduce((s, i) => s + i.stockQty * i.unitPrice, 0), [items]);
  const txThisMonth = useMemo(() => {
    const ym = todayISO().slice(0, 7);
    return history.filter((h) => h.date.slice(0, 7) === ym).length;
  }, [history]);

  /* Filtered Items */
  const filtered = useMemo(() => {
    let list = items.filter((i) => {
      const q = search.trim().toLowerCase();
      const matchQ =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        (i.supplierName && i.supplierName.toLowerCase().includes(q));

      const matchCat = catFilter === 'all' || i.category === catFilter;
      const expSt = getExpiryStatus(i.expiryDate);
      
      let matchStatus = true;
      if (statusFilter === 'du' || statusFilter === 'canhbao' || statusFilter === 'het') {
        matchStatus = getStockStatus(i) === statusFilter;
      } else if (statusFilter === 'expiring') {
        matchStatus = expSt !== 'normal';
      }
      return matchQ && matchCat && matchStatus;
    });

    if (sortKey) {
      list = [...list].sort((a, b) => {
        let av: any = a[sortKey] ?? '';
        let bv: any = b[sortKey] ?? '';
        if (typeof av === 'string') {
          av = av.toLowerCase();
          bv = (bv as string).toLowerCase();
        }
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [items, search, catFilter, statusFilter, sortKey, sortDir]);

  /* Chart Data */
  const chartData = useMemo(() => {
    return CATEGORIES.map((c) => ({
      name: c,
      value: items.filter((i) => i.category === c).reduce((s, i) => s + i.stockQty * i.unitPrice, 0),
    })).filter((d) => d.value > 0);
  }, [items]);

  const urgentItems = useMemo(() => {
    return [...items]
      .filter((i) => getStockStatus(i) !== 'du')
      .sort((a, b) => a.stockQty / (a.minSafetyStock || 1) - b.stockQty / (b.minSafetyStock || 1))
      .slice(0, 5);
  }, [items]);

  /* Season Allocations Summary (Expanded Flow) */
  const seasonAllocations = useMemo(() => {
    const outReceipts = history.filter((h) => h.type === 'OUT' && h.seasonName);
    const groups: Record<string, { seasonName: string; memberName: string; materialName: string; totalQty: number; unit: string; totalCost: number; latestDate: string }> = {};

    outReceipts.forEach((r) => {
      const key = `${r.seasonName}_${r.memberName}_${r.itemName}`;
      const cost = (r.qty || 0) * (r.unitPrice || 0);
      if (!groups[key]) {
        groups[key] = {
          seasonName: r.seasonName || 'Vụ Đông Xuân',
          memberName: r.memberName || 'Xã viên HTX',
          materialName: r.itemName,
          totalQty: r.qty,
          unit: r.unit,
          totalCost: cost,
          latestDate: r.date,
        };
      } else {
        groups[key].totalQty += r.qty;
        groups[key].totalCost += cost;
        if (r.date > groups[key].latestDate) groups[key].latestDate = r.date;
      }
    });

    return Object.values(groups);
  }, [history]);

  const toggleSort = (key: keyof Material) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  /* CRUD Operations */
  const nextId = () => {
    const nums = items.map((i) => parseInt(i.id.replace(/\D/g, ''), 10) || 0);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return 'VT' + String(n).padStart(3, '0');
  };

  const saveItem = async (data: Partial<Material>) => {
    if (!itemModal) return;
    try {
      if (itemModal.mode === 'add') {
        const created = await inventoryApi.createMaterial(data).catch(() => null);
        if (created) {
          queryClient.invalidateQueries({ queryKey: ['materials'] });
          showToast(`Đã thêm mới vật tư "${created.name}"`);
        } else {
          const id = nextId();
          const newItem: Material = {
            id,
            code: id,
            name: data.name || 'Vật tư mới',
            category: (data.category as MaterialCategory) || 'Phân bón',
            stockQty: Number(data.stockQty) || 0,
            unit: data.unit || 'kg',
            minSafetyStock: Number(data.minSafetyStock) || 0,
            unitPrice: Number(data.unitPrice) || 0,
            supplierName: data.supplierName || 'Nhà cung cấp HTX',
            warehouseName: data.warehouseName || 'Kho vật tư chính',
            expiryDate: data.expiryDate || '',
            description: data.description || '',
            status: 'ACTIVE',
          };
          setItems((prev) => [...prev, newItem]);
          showToast(`Đã thêm mới vật tư "${newItem.name}" (${id})`);
        }
      } else if (data.id) {
        await inventoryApi.updateMaterial(data.id, data).catch(() => null);
        queryClient.invalidateQueries({ queryKey: ['materials'] });
        setItems((prev) => prev.map((i) => (i.id === data.id ? ({ ...i, ...data } as Material) : i)));
        showToast(`Đã cập nhật thông tin vật tư "${data.name}"`);
      }
    } catch (e) {
      console.warn('Error saving material via API:', e);
    }
    setItemModal(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    showToast(`Đã xóa vật tư "${deleteTarget.name}" khỏi danh mục`);
    setDeleteTarget(null);
  };

  const submitStockMove = async (payload: {
    itemId: string;
    qty: number;
    note: string;
    type: 'IN' | 'OUT';
    seasonName?: string;
    memberName?: string;
    farmPlotName?: string;
  }) => {
    const item = items.find((i) => i.id === payload.itemId);
    if (!item) return;

    try {
      if (payload.type === 'IN') {
        await inventoryApi.createStockReceipt({
          material_id: payload.itemId,
          quantity: payload.qty,
          unit_price: item.unitPrice,
          note: payload.note,
        }).catch(() => null);
      } else {
        await inventoryApi.createStockIssue({
          material_id: payload.itemId,
          quantity: payload.qty,
          season_name: payload.seasonName,
          member_name: payload.memberName,
          note: payload.note,
        }).catch(() => null);
      }
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['stockReceipts'] });
    } catch (e) {
      console.warn('Error creating stock movement via API:', e);
    }

    const delta = payload.type === 'IN' ? payload.qty : -payload.qty;
    setItems((prev) =>
      prev.map((i) => (i.id === payload.itemId ? { ...i, stockQty: Math.max(0, i.stockQty + delta) } : i))
    );

    const prefix = payload.type === 'IN' ? 'PN' : 'PX';
    const seq = history.filter((h) => h.type === payload.type).length + 1;
    const entry: StockReceipt = {
      id: `${prefix}-${String(seq).padStart(4, '0')}`,
      type: payload.type,
      itemId: payload.itemId,
      itemName: item.name,
      qty: payload.qty,
      unit: item.unit,
      unitPrice: item.unitPrice,
      date: todayISO(),
      note: payload.note || (payload.type === 'IN' ? 'Nhập bổ sung' : 'Cấp phát vật tư'),
      person: 'Ban Quản trị HTX',
      seasonName: payload.seasonName,
      memberName: payload.memberName,
      farmPlotName: payload.farmPlotName,
    };

    setHistory((prev) => [entry, ...prev]);
    showToast(
      payload.type === 'IN'
        ? `Đã tạo phiếu Nhập kho ${num(payload.qty)} ${item.unit} — ${item.name}`
        : `Đã tạo phiếu Xuất kho ${num(payload.qty)} ${item.unit} — ${item.name}`
    );
    setStockModal(null);
  };

  const exportCSV = () => {
    const header = [
      'Mã VT',
      'Tên vật tư',
      'Phân loại',
      'Tồn kho',
      'Đơn vị',
      'Ngưỡng an toàn',
      'Đơn giá tham chiếu (đ)',
      'Nhà cung cấp',
      'Tên kho',
      'Hạn sử dụng',
      'Trạng thái kho',
    ];
    const rows = filtered.map((i) => [
      i.id,
      i.name,
      i.category,
      i.stockQty,
      i.unit,
      i.minSafetyStock,
      i.unitPrice,
      i.supplierName || '',
      i.warehouseName || '',
      i.expiryDate || '',
      STATUS_META[getStockStatus(i)].label,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ton-kho-vat-tu-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất báo cáo CSV Tồn kho vật tư');
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản lý Kho Vật tư & Nông cụ HTX
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Nhánh: feature/material-management
            </span>
          </div>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Theo dõi tồn kho phân bón, thuốc BVTV sinh học, vật tư đóng gói OCOP, hạn sử dụng & quản lý phiếu nhập/xuất kho.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setStockModal({ type: 'IN' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[12.5px] shadow-2xs transition-all cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            Tạo phiếu Nhập kho
          </button>
          <button
            onClick={() => setStockModal({ type: 'OUT' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[12.5px] shadow-sm transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
            Tạo phiếu Xuất kho (Mùa vụ)
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPIItem
          icon={Package}
          label="Mặt hàng quản lý"
          value={num(items.length)}
          sub={`${CATEGORIES.length} nhóm phân loại`}
          accent="text-emerald-700 bg-emerald-50 border-emerald-200"
        />
        <KPIItem
          icon={Wallet}
          label="Giá trị tồn kho"
          value={money(totalValue)}
          sub="Giá trị tham chiếu"
          accent="text-amber-700 bg-amber-50 border-amber-200"
        />
        <KPIItem
          icon={AlertTriangle}
          label="Dưới ngưỡng an toàn"
          value={num(lowStockItems.length)}
          sub="Cần lên kế hoạch mua"
          accent="text-orange-700 bg-orange-50 border-orange-200"
        />
        <KPIItem
          icon={Clock}
          label="Cảnh báo hạn dùng"
          value={num(expiringItems.length)}
          sub="Sinh học / Phân bón"
          accent="text-rose-700 bg-rose-50 border-rose-200"
        />
        <KPIItem
          icon={History}
          label="Giao dịch tháng này"
          value={num(txThisMonth)}
          sub="Phiếu Nhập & Xuất"
          accent="text-blue-700 bg-blue-50 border-blue-200"
        />
      </div>

      {/* Alert Banners */}
      {lowStockItems.length > 0 && (
        <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-orange-950 flex flex-wrap items-center justify-between gap-3 text-[12.8px]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
            <span>
              Có <strong>{lowStockItems.length} vật tư đang dưới ngưỡng tồn kho an toàn</strong> ({lowStockItems.map((i) => i.name).join(', ')}). Cần lập kế hoạch bổ sung mua sỉ.
            </span>
          </div>
          <button
            onClick={() => {
              setTab('inventory');
              setStatusFilter('canhbao');
            }}
            className="px-3 py-1 bg-white hover:bg-orange-100 text-orange-800 font-bold text-[11.5px] rounded-lg border border-orange-300 transition-colors cursor-pointer shrink-0"
          >
            Lọc vật tư thiếu hụt
          </button>
        </div>
      )}

      {expiringItems.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 flex flex-wrap items-center justify-between gap-3 text-[12.8px]">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              Cảnh báo <strong>{expiringItems.length} thuốc BVTV/Phân bón sinh học sắp hết hạn</strong> ({expiringItems.map((i) => `${i.name} - HSD: ${fmtDate(i.expiryDate)}`).join('; ')}). Cần ưu tiên cấp phát cho mùa vụ.
            </span>
          </div>
          <button
            onClick={() => {
              setTab('inventory');
              setStatusFilter('expiring');
            }}
            className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 font-bold text-[11.5px] rounded-lg border border-rose-300 transition-colors cursor-pointer shrink-0"
          >
            Lọc vật tư sắp hết hạn
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab('inventory')}
          className={`py-2.5 px-4 text-[13px] font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            tab === 'inventory'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Danh mục Tồn kho ({filtered.length})
        </button>
        <button
          onClick={() => setTab('receipts')}
          className={`py-2.5 px-4 text-[13px] font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            tab === 'receipts'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Lịch sử Nhập / Xuất kho ({history.length})
        </button>
        <button
          onClick={() => setTab('allocations')}
          className={`py-2.5 px-4 text-[13px] font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            tab === 'allocations'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          Cấp phát Mùa vụ & Xã viên
        </button>
        <button
          onClick={() => setTab('stats')}
          className={`py-2.5 px-4 text-[13px] font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            tab === 'stats'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Thống kê & Biểu đồ
        </button>
      </div>

      {/* TAB 1: Inventory List */}
      {tab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-b-xl shadow-subtle overflow-hidden space-y-0">
          {/* Controls Bar */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm vật tư theo tên, mã VT, nhà cung cấp..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[12.8px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả phân loại ({CATEGORIES.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái kho</option>
              <option value="du">Đủ số lượng</option>
              <option value="canhbao">Cảnh báo thiếu</option>
              <option value="het">Hết hàng</option>
              <option value="expiring">Cảnh báo sắp hết hạn</option>
            </select>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-[12px] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Xuất CSV
            </button>

            <button
              onClick={() =>
                setItemModal({
                  mode: 'add',
                  data: {
                    name: '',
                    category: 'Phân bón',
                    stockQty: 0,
                    unit: 'kg',
                    minSafetyStock: 0,
                    unitPrice: 0,
                    supplierName: 'Nhà cung cấp Bio Việt',
                    warehouseName: 'Kho vật tư chính',
                    expiryDate: '',
                    description: '',
                  },
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[12px] rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm vật tư mới
            </button>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.9px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                  <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('id')}>
                    Mã VT
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('name')}>
                    Tên Vật tư & Nông cụ
                  </th>
                  <th className="py-3 px-4">Phân loại</th>
                  <th className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('stockQty')}>
                    Số lượng tồn
                  </th>
                  <th className="py-3 px-4 text-right">Ngưỡng an toàn</th>
                  <th className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('unitPrice')}>
                    Đơn giá tham chiếu
                  </th>
                  <th className="py-3 px-4">Hạn sử dụng</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const statusKey = getStockStatus(item);
                  const st = STATUS_META[statusKey];
                  const expSt = getExpiryStatus(item.expiryDate);
                  const ratio = Math.min(100, Math.round((item.stockQty / (item.minSafetyStock || 1)) * 100));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600 text-[12px]">{item.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11.2px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {item.supplierName && <span>🏢 {item.supplierName}</span>}
                          {item.warehouseName && <span>🏬 {item.warehouseName}</span>}
                        </div>
                        {/* Progress ratio */}
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${ratio}%`,
                              backgroundColor: st.fg,
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[11.5px] font-bold"
                          style={{
                            color: CAT_COLORS[item.category] || '#334155',
                            backgroundColor: `${CAT_COLORS[item.category]}18`,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {num(item.stockQty)} <span className="font-normal text-xs text-slate-500">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {num(item.minSafetyStock)} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {money(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4">
                        {item.expiryDate ? (
                          expSt === 'expired' ? (
                            <span className="text-rose-700 font-bold text-[11.5px] flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" /> Hết hạn ({fmtDate(item.expiryDate)})
                            </span>
                          ) : expSt === 'warning' ? (
                            <span className="text-amber-700 font-bold text-[11.5px] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Sắp hết hạn ({fmtDate(item.expiryDate)})
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[11.5px]">{fmtDate(item.expiryDate)}</span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11.5px]">Không áp dụng</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap"
                          style={{ color: st.fg, backgroundColor: st.bg }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setItemModal({ mode: 'edit', data: item })}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                            title="Sửa thông tin vật tư"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 hover:text-rose-800 transition-colors"
                            title="Xóa vật tư"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      Không tìm thấy vật tư phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Hiển thị <strong>{filtered.length}</strong> / {items.length} vật tư</span>
            <span>Tổng trị giá danh mục lọc: <strong>{money(filtered.reduce((s, i) => s + i.stockQty * i.unitPrice, 0))}</strong></span>
          </div>
        </div>
      )}

      {/* TAB 2: Stock Receipts History */}
      {tab === 'receipts' && (
        <div className="bg-white border border-slate-200 rounded-b-xl shadow-subtle overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-extrabold text-[14px] text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              Lịch sử các Giao dịch Nhập & Xuất kho
            </h3>
            <span className="text-xs text-slate-500 font-medium">Tổng cộng {history.length} phiếu</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.9px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                  <th className="py-3 px-4">Mã Phiếu</th>
                  <th className="py-3 px-4">Loại Giao Dịch</th>
                  <th className="py-3 px-4">Vật tư & Nông cụ</th>
                  <th className="py-3 px-4 text-right">Số lượng</th>
                  <th className="py-3 px-4 text-right">Đơn giá</th>
                  <th className="py-3 px-4">Ngày giao dịch</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Ghi chú / Mùa vụ cấp phát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 text-[12px]">{rec.id}</td>
                    <td className="py-3 px-4">
                      {rec.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <ArrowDownRight className="w-3.5 h-3.5" /> Nhập kho
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Xuất kho
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{rec.itemName}</td>
                    <td className={`py-3 px-4 text-right font-black ${rec.type === 'IN' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {rec.type === 'IN' ? '+' : '−'}{num(rec.qty)} <span className="font-normal text-xs text-slate-500">{rec.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {rec.unitPrice ? money(rec.unitPrice) : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[12px]">{fmtDate(rec.date)}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{rec.person}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{rec.note}</div>
                      {rec.seasonName && (
                        <div className="text-[11.2px] text-emerald-800 font-bold mt-0.5">
                          🌱 {rec.seasonName} • {rec.memberName || 'Xã viên'} ({rec.farmPlotName || 'Vùng trồng'})
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Chưa có phiếu nhập/xuất kho nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Season & Member Material Allocations (Expanded Flow) */}
      {tab === 'allocations' && (
        <div className="bg-white border border-slate-200 rounded-b-xl shadow-subtle p-5 space-y-5">
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              Báo cáo Cấp phát Vật tư theo Mùa vụ & Xã viên
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Theo dõi định mức vật tư đầu vào (Phân bón, Thuốc BVTV) được phân bổ cho từng vùng trồng & hộ xã viên theo mùa vụ OCOP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Mùa vụ áp dụng</div>
              <div className="text-xl font-black text-slate-900 mt-1">Vụ Đông Xuân 2025–2026</div>
              <div className="text-[11.5px] text-emerald-700 mt-0.5">14 vùng trồng VietGAP</div>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Tổng giá trị cấp phát</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {money(seasonAllocations.reduce((s, a) => s + a.totalCost, 0))}
              </div>
              <div className="text-[11.5px] text-amber-700 mt-0.5">Hỗ trợ vật tư đầu mùa vụ</div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Số lượt nhận vật tư</div>
              <div className="text-xl font-black text-slate-900 mt-1">{seasonAllocations.length} nhóm cấp phát</div>
              <div className="text-[11.5px] text-blue-700 mt-0.5">Tính theo từng đợt xuất kho</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-[12.9px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                  <th className="py-3 px-4">Tên Mùa Vụ</th>
                  <th className="py-3 px-4">Xã viên / Tổ sản xuất</th>
                  <th className="py-3 px-4">Vật tư cấp phát</th>
                  <th className="py-3 px-4 text-right">Tổng số lượng</th>
                  <th className="py-3 px-4 text-right">Thành tiền</th>
                  <th className="py-3 px-4">Ngày cấp gần nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seasonAllocations.map((alloc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="pill-badge pill-green text-[11px]">{alloc.seasonName}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">👤 {alloc.memberName}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{alloc.materialName}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {num(alloc.totalQty)} {alloc.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">{money(alloc.totalCost)}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[12px]">{fmtDate(alloc.latestDate)}</td>
                  </tr>
                ))}

                {seasonAllocations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Chưa có phiếu xuất kho gắn với mùa vụ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Analytics & Recharts */}
      {tab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-b-xl p-5 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Giá trị tồn kho theo phân loại (VNĐ)</h3>
            <p className="text-xs text-slate-500 mb-4">Tổng giá trị danh mục kho: <strong>{money(totalValue)}</strong></p>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                  <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + 'tr'} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip formatter={(v: any) => money(Number(v))} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12.5 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={CAT_COLORS[d.name as MaterialCategory] || '#059669'} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={(v: any) => (Number(v) / 1000000).toFixed(1) + 'tr'} style={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-b-xl p-5 shadow-subtle space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Cần nhập bổ sung sỉ</h3>
              <p className="text-xs text-slate-500">Xếp thứ tự mức độ thiếu hụt so với ngưỡng an toàn</p>
            </div>

            <div className="space-y-3">
              {urgentItems.length === 0 && <p className="text-sm text-slate-400">Không có vật tư nào thiếu hụt.</p>}
              {urgentItems.map((it) => {
                const ratio = Math.round((it.stockQty / (it.minSafetyStock || 1)) * 100);
                return (
                  <div key={it.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[12.8px]">
                      <span className="font-bold text-slate-900 truncate">{it.name}</span>
                      <span className="font-mono font-bold text-orange-600">{ratio}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, ratio)}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Tồn: {num(it.stockQty)} {it.unit}</span>
                      <span>Ngưỡng: {num(it.minSafetyStock)} {it.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Item Form Modal (Add/Edit) */}
      {itemModal && (
        <Modal
          title={itemModal.mode === 'add' ? 'Thêm mới Vật tư / Nông cụ' : 'Chỉnh sửa Vật tư'}
          subtitle={itemModal.mode === 'add' ? 'Khai báo vật tư mới vào danh mục quản lý kho' : `Mã vật tư: ${itemModal.data.id}`}
          onClose={() => setItemModal(null)}
        >
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên vật tư - nông cụ (*)</label>
              <input
                type="text"
                value={itemModal.data.name || ''}
                onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, name: e.target.value } })}
                placeholder="VD: Phân bón NPK 16-16-8 Đầu Trâu"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại (*)</label>
                <select
                  value={itemModal.data.category || 'Phân bón'}
                  onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, category: e.target.value as MaterialCategory } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị tính (*)</label>
                <input
                  type="text"
                  value={itemModal.data.unit || ''}
                  onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, unit: e.target.value } })}
                  placeholder="kg / cái / chai (1L)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng tồn kho (*)</label>
                <input
                  type="number"
                  min="0"
                  value={itemModal.data.stockQty ?? 0}
                  onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, stockQty: Number(e.target.value) || 0 } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngưỡng tồn an toàn (*)</label>
                <input
                  type="number"
                  min="0"
                  value={itemModal.data.minSafetyStock ?? 0}
                  onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, minSafetyStock: Number(e.target.value) || 0 } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn giá tham chiếu (đ)</label>
                <input
                  type="number"
                  min="0"
                  value={itemModal.data.unitPrice ?? 0}
                  onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, unitPrice: Number(e.target.value) || 0 } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn sử dụng (HSD)</label>
                <input
                  type="date"
                  value={itemModal.data.expiryDate || ''}
                  onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, expiryDate: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhà cung cấp</label>
                <input
                  type="text"
                  value={itemModal.data.supplierName || ''}
                  onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, supplierName: e.target.value } })}
                  placeholder="Công ty Bio Việt..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên kho lưu trữ</label>
                <input
                  type="text"
                  value={itemModal.data.warehouseName || ''}
                  onChange={(e) => setItemModal({ ...itemModal, data: { ...itemModal.data, warehouseName: e.target.value } })}
                  placeholder="Kho vật tư chính..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setItemModal(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => saveItem(itemModal.data)}
                disabled={!itemModal.data.name || !itemModal.data.unit}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors"
              >
                {itemModal.mode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Stock Move Modal (IN / OUT) */}
      {stockModal && (
        <StockMoveModalDialog
          type={stockModal.type}
          items={items}
          onClose={() => setStockModal(null)}
          onSubmit={submitStockMove}
        />
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deleteTarget && (
        <Modal
          title="Xác nhận xóa vật tư?"
          subtitle={`"${deleteTarget.name}" (${deleteTarget.id}) sẽ bị loại khỏi danh mục.`}
          onClose={() => setDeleteTarget(null)}
          width={400}
        >
          <div className="space-y-4 text-sm text-slate-600">
            <p>Hành động này không thể hoàn tác. Các phiếu lịch sử nhập/xuất đã có vẫn được bảo lưu.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Xóa vật tư
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
};

/* ---------------------------------- Sub-components ---------------------------------- */

function KPIItem({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11.8px] text-slate-500 font-medium">{label}</div>
        <div className="text-lg font-black text-slate-900 mt-0.5 truncate">{value}</div>
        <div className="text-[10.8px] text-slate-400 mt-0.5 truncate">{sub}</div>
      </div>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  width = 500,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function StockMoveModalDialog({
  type,
  items,
  onClose,
  onSubmit,
}: {
  type: 'IN' | 'OUT';
  items: Material[];
  onClose: () => void;
  onSubmit: (payload: {
    itemId: string;
    qty: number;
    note: string;
    type: 'IN' | 'OUT';
    seasonName?: string;
    memberName?: string;
    farmPlotName?: string;
  }) => void;
}) {
  const [itemId, setItemId] = useState(items[0]?.id || '');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [seasonName, setSeasonName] = useState(MOCK_SEASONS[0].name);
  const [memberPlot, setMemberPlot] = useState(MOCK_MEMBERS_PLOTS[0]);

  const item = items.find((i) => i.id === itemId);
  const qtyNum = Number(qty) || 0;
  const exceeds = type === 'OUT' && item && qtyNum > item.stockQty;
  const valid = itemId && qtyNum > 0 && !exceeds;
  const isIn = type === 'IN';

  return (
    <Modal
      title={isIn ? 'Tạo phiếu Nhập kho Vật tư' : 'Tạo phiếu Xuất kho (Cấp phát Mùa vụ)'}
      subtitle={isIn ? 'Ghi nhận vật tư mới nhập kho từ Nhà cung cấp' : 'Cấp phát phân bón, thuốc BVTV cho hộ xã viên / mùa vụ'}
      onClose={onClose}
    >
      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Vật tư & Nông cụ (*)</label>
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-medium"
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.id}) — Tồn: {num(i.stockQty)} {i.unit}
              </option>
            ))}
          </select>
        </div>

        {item && (
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-600">Tồn kho hiện tại</span>
            <span className="font-extrabold text-slate-900 font-mono">
              {num(item.stockQty)} {item.unit}
            </span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Số lượng {isIn ? 'nhập' : 'xuất'} {item ? `(${item.unit})` : ''} (*)
          </label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-mono"
          />
          {exceeds && (
            <span className="text-xs font-bold text-rose-600 block mt-1">
              ⚠️ Số lượng xuất ({num(qtyNum)}) vượt quá số lượng tồn hiện có ({num(item?.stockQty || 0)}).
            </span>
          )}
        </div>

        {!isIn && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mùa vụ áp dụng (*)</label>
              <select
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
              >
                {MOCK_SEASONS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Xã viên / Vùng trồng nhận vật tư (*)</label>
              <select
                value={JSON.stringify(memberPlot)}
                onChange={(e) => setMemberPlot(JSON.parse(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
              >
                {MOCK_MEMBERS_PLOTS.map((mp, i) => (
                  <option key={i} value={JSON.stringify(mp)}>
                    👤 {mp.member} — {mp.plot}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú phiếu (*)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={
              isIn
                ? 'VD: Nhập đợt vụ Đông Xuân từ nhà cung cấp Bio Việt...'
                : 'VD: Cấp phát phân bón bón lót chè Oolong vụ Đông Xuân...'
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs"
          >
            Hủy
          </button>
          <button
            onClick={() =>
              onSubmit({
                itemId,
                qty: qtyNum,
                note,
                type,
                seasonName: !isIn ? seasonName : undefined,
                memberName: !isIn ? memberPlot.member : undefined,
                farmPlotName: !isIn ? memberPlot.plot : undefined,
              })
            }
            disabled={!valid}
            className={`px-4 py-2 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
              isIn ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-amber-700 hover:bg-amber-800'
            }`}
          >
            {isIn ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            {isIn ? 'Xác nhận nhập kho' : 'Xác nhận xuất kho'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
