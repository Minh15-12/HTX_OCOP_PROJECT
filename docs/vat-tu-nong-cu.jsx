import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import {
  Search, Plus, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Pencil, Trash2, X,
  Package, Wallet, ClipboardList, TrendingDown, ChevronDown, Download, History,
  LayoutGrid, BarChart3, Sprout, Home, ChevronRight, Check, Loader2, Leaf,
} from "lucide-react";

/* ---------------------------------- tokens ---------------------------------- */

const C = {
  bg: "#F6F3EA",
  panel: "#FFFFFF",
  panelSoft: "#FBFAF5",
  sidebar: "#16261C",
  sidebarSoft: "#20342A",
  ink: "#1D2A22",
  inkSoft: "#5B685D",
  muted: "#8A9389",
  border: "#E7E2D3",
  borderSoft: "#EFEBDD",
  primary: "#2E6B47",
  primaryDark: "#1F4E34",
  primarySoft: "#E4EFE5",
  gold: "#A8762E",
  goldSoft: "#F4E9D6",
  warn: "#9C4630",
  warnSoft: "#F8E9E2",
  warnBorder: "#EAD2C3",
  ok: "#2B6B45",
  okSoft: "#E5F1E7",
  danger: "#A23B2E",
  dangerSoft: "#F7E5E0",
  cream: "#F0ECDD",
};

const FONT = "'Be Vietnam Pro', 'Inter', system-ui, -apple-system, sans-serif";

const CATS = ["Phân bón", "Thuốc BVTV Sinh học", "Vật tư đóng gói", "Nông cụ"];

const CAT_COLOR = {
  "Phân bón": C.primary,
  "Thuốc BVTV Sinh học": C.gold,
  "Vật tư đóng gói": "#5C7A93",
  "Nông cụ": "#8A5A3B",
};

const SEED_ITEMS = [
  { id: "VT001", name: "Phân bón NPK 16-16-8 Đầu Trâu", category: "Phân bón", qty: 150, unit: "kg", threshold: 300, price: 18000 },
  { id: "VT002", name: "Chế phẩm sinh học Trichoderma", category: "Thuốc BVTV Sinh học", qty: 45, unit: "chai (1L)", threshold: 20, price: 120000 },
  { id: "VT003", name: "Bao bì túi zip nhôm OCOP 500g", category: "Vật tư đóng gói", qty: 850, unit: "cái", threshold: 1000, price: 4500 },
  { id: "VT004", name: "Phân hữu cơ vi sinh Sông Giang", category: "Phân bón", qty: 1200, unit: "kg", threshold: 500, price: 9500 },
  { id: "VT005", name: "Bình phun thuốc điện 16L", category: "Nông cụ", qty: 12, unit: "cái", threshold: 5, price: 850000 },
  { id: "VT006", name: "Kéo cắt cành Nhật Bản", category: "Nông cụ", qty: 8, unit: "cái", threshold: 10, price: 150000 },
];

const SEED_HISTORY = [
  { id: "PN-0032", type: "in", itemId: "VT004", itemName: "Phân hữu cơ vi sinh Sông Giang", qty: 400, date: "2026-09-10", note: "Nhập đợt vụ Đông Xuân", person: "Nguyễn Văn Hải" },
  { id: "PX-0051", type: "out", itemId: "VT001", itemName: "Phân bón NPK 16-16-8 Đầu Trâu", qty: 120, date: "2026-09-11", note: "Cấp cho tổ trồng rau xã viên", person: "Trần Thị Mai" },
  { id: "PX-0052", type: "out", itemId: "VT003", itemName: "Bao bì túi zip nhôm OCOP 500g", qty: 300, date: "2026-09-12", note: "Đóng gói lô OCOP tháng 9", person: "Lê Văn Sơn" },
  { id: "PN-0033", type: "in", itemId: "VT002", itemName: "Chế phẩm sinh học Trichoderma", qty: 25, unit: "chai", date: "2026-09-13", note: "Bổ sung từ nhà cung cấp Bio Việt", person: "Nguyễn Văn Hải" },
];

const STORAGE_KEY = "vat-tu-nong-cu:v1";

const money = (n) => n.toLocaleString("vi-VN") + " đ";
const num = (n) => n.toLocaleString("vi-VN");
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

function statusOf(item) {
  if (item.qty <= 0) return "het";
  if (item.qty < item.threshold) return "canhbao";
  return "du";
}

const STATUS_META = {
  du: { label: "Đủ số lượng", fg: C.ok, bg: C.okSoft },
  canhbao: { label: "Cảnh báo thiếu", fg: C.warn, bg: C.warnSoft },
  het: { label: "Hết hàng", fg: C.danger, bg: C.dangerSoft },
};

/* ---------------------------------- small ui ---------------------------------- */

function Pill({ children, fg, bg }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ color: fg, background: bg }}
    >
      {children}
    </span>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
      style={{ background: C.primaryDark, color: "#fff" }}
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
        <Check size={13} strokeWidth={3} />
      </span>
      {toast}
    </div>
  );
}

function Modal({ title, subtitle, onClose, children, width = 520 }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(22,30,24,0.45)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ maxWidth: width, background: C.panel, boxShadow: "0 24px 60px rgba(22,30,24,0.28)" }}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          <div>
            <h3 className="text-lg font-bold" style={{ color: C.ink }}>{title}</h3>
            {subtitle && <p className="text-sm mt-0.5" style={{ color: C.inkSoft }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg -mt-1 -mr-1" style={{ color: C.muted }}>
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: C.inkSoft }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  border: `1.5px solid ${C.border}`,
  background: C.panelSoft,
  color: C.ink,
};

/* ---------------------------------- app ---------------------------------- */

export default function App() {
  const [items, setItems] = useState(SEED_ITEMS);
  const [history, setHistory] = useState(SEED_HISTORY);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  const [tab, setTab] = useState("inventory");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [itemModal, setItemModal] = useState(null); // { mode: 'add'|'edit', data }
  const [stockModal, setStockModal] = useState(null); // { type: 'in'|'out' }
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* --- load / persist --- */
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          if (parsed.items) setItems(parsed.items);
          if (parsed.history) setHistory(parsed.history);
        }
      } catch (e) {
        // no saved data yet — seed data stays
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (nextItems, nextHistory) => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ items: nextItems, history: nextHistory }), false);
    } catch (e) {
      console.error("Lỗi lưu dữ liệu:", e);
    }
  }, []);

  useEffect(() => {
    if (loaded) persist(items, history);
  }, [items, history, loaded, persist]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  /* --- derived --- */
  const lowStockItems = useMemo(() => items.filter((i) => statusOf(i) !== "du"), [items]);
  const totalValue = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);
  const txThisMonth = useMemo(() => {
    const ym = todayISO().slice(0, 7);
    return history.filter((h) => h.date.slice(0, 7) === ym).length;
  }, [history]);

  const filtered = useMemo(() => {
    let list = items.filter((i) => {
      const q = search.trim().toLowerCase();
      const matchQ = !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
      const matchCat = catFilter === "all" || i.category === catFilter;
      const matchStatus = statusFilter === "all" || statusOf(i) === statusFilter;
      return matchQ && matchCat && matchStatus;
    });
    if (sortKey) {
      list = [...list].sort((a, b) => {
        let av = a[sortKey], bv = b[sortKey];
        if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [items, search, catFilter, statusFilter, sortKey, sortDir]);

  const chartData = useMemo(() => {
    return CATS.map((c) => ({
      name: c,
      value: items.filter((i) => i.category === c).reduce((s, i) => s + i.qty * i.price, 0),
    })).filter((d) => d.value > 0);
  }, [items]);

  const urgentItems = useMemo(() => {
    return [...items]
      .filter((i) => statusOf(i) !== "du")
      .sort((a, b) => (a.qty / (a.threshold || 1)) - (b.qty / (b.threshold || 1)))
      .slice(0, 4);
  }, [items]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  /* --- CRUD --- */
  const nextId = () => {
    const nums = items.map((i) => parseInt(i.id.replace(/\D/g, ""), 10) || 0);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return "VT" + String(n).padStart(3, "0");
  };

  const saveItem = (data) => {
    if (itemModal.mode === "add") {
      const item = { ...data, id: nextId() };
      setItems((prev) => [...prev, item]);
      showToast(`Đã thêm vật tư "${item.name}"`);
    } else {
      setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
      showToast(`Đã cập nhật "${data.name}"`);
    }
    setItemModal(null);
  };

  const confirmDelete = () => {
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    showToast(`Đã xoá "${deleteTarget.name}" khỏi kho`);
    setDeleteTarget(null);
  };

  const submitStockMove = ({ itemId, qty, note, type }) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const delta = type === "in" ? qty : -qty;
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)));
    const prefix = type === "in" ? "PN" : "PX";
    const seq = history.filter((h) => h.type === type).length + 1;
    const entry = {
      id: `${prefix}-${String(seq).padStart(4, "0")}`,
      type, itemId, itemName: item.name, qty, date: todayISO(), note: note || "—", person: "Bạn",
    };
    setHistory((prev) => [entry, ...prev]);
    showToast(type === "in" ? `Đã nhập ${num(qty)} ${item.unit} — ${item.name}` : `Đã xuất ${num(qty)} ${item.unit} — ${item.name}`);
    setStockModal(null);
  };

  const exportCSV = () => {
    const header = ["Mã VT", "Tên vật tư", "Phân loại", "Tồn kho", "Đơn vị", "Ngưỡng an toàn", "Đơn giá", "Trạng thái"];
    const rows = filtered.map((i) => [
      i.id, i.name, i.category, i.qty, i.unit, i.threshold, i.price, STATUS_META[statusOf(i)].label,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ton-kho-vat-tu.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------------------------- render ---------------------------------- */

  return (
    <div style={{ fontFamily: FONT, background: C.bg, color: C.ink }} className="min-h-screen w-full flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .tabular { font-variant-numeric: tabular-nums; }
        table { border-collapse: separate; border-spacing: 0; }
        ::selection { background: ${C.primarySoft}; }
        .rowhover:hover { background: ${C.panelSoft}; }
        .scrollthin::-webkit-scrollbar { height: 6px; width: 6px; }
        .scrollthin::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

      {/* -------- sidebar -------- */}
      <aside
        className={`fixed lg:static z-30 inset-y-0 left-0 w-64 shrink-0 flex flex-col transition-transform duration-200 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: C.sidebar, color: "#EAF0E9" }}
      >
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.primarySoft }}>
            <Sprout size={19} style={{ color: C.primaryDark }} />
          </div>
          <div>
            <div className="font-bold text-[15px] leading-tight" style={{ color: "#fff" }}>HTX NÔNG NGHIỆP</div>
            <div className="text-[11px]" style={{ color: "#8FA091" }}>Hệ thống Số hoá OCOP</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6 scrollthin">
          <SideGroup label="Tổng quan">
            <SideItem icon={LayoutGrid} label="Tổng quan" />
          </SideGroup>
          <SideGroup label="Quản lý HTX">
            <SideItem icon={ClipboardList} label="Hồ sơ HTX" />
            <SideItem icon={Package} label="Xã viên" />
            <SideItem icon={Wallet} label="Vốn góp" />
            <SideItem icon={TrendingDown} label="Phân chia lợi nhuận" flip />
          </SideGroup>
          <SideGroup label="Quản lý nghiệp vụ">
            <SideItem icon={Leaf} label="Vùng trồng" />
            <SideItem icon={ClipboardList} label="Mùa vụ" />
            <SideItem icon={ClipboardList} label="Sản xuất & Nhật ký" />
            <SideItem icon={ClipboardList} label="Thu hoạch & Truy xuất" />
          </SideGroup>
          <SideGroup label="Kho & Sản phẩm">
            <SideItem icon={Package} label="Vật tư - Nông cụ" active badge={lowStockItems.length} />
            <SideItem icon={Package} label="Sản phẩm OCOP" />
          </SideGroup>
        </nav>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setMobileNavOpen(false)} />
      )}

      {/* -------- main -------- */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-7 py-6">
          {/* breadcrumb */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color: C.muted }}>
              <button className="lg:hidden mr-2 p-1.5 rounded-md" style={{ border: `1px solid ${C.border}` }} onClick={() => setMobileNavOpen(true)}>
                <LayoutGrid size={15} />
              </button>
              <Home size={13} />
              <span>Trang chủ</span>
              <ChevronRight size={13} />
              <span>Kho &amp; Sản phẩm</span>
              <ChevronRight size={13} />
              <span className="font-semibold" style={{ color: C.ink }}>Vật tư &amp; Kho</span>
            </div>
          </div>

          {/* header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[26px] font-extrabold tracking-tight" style={{ color: C.ink }}>Quản lý Kho vật tư &amp; Nông cụ</h1>
              <p className="text-sm mt-1" style={{ color: C.inkSoft }}>Theo dõi tồn kho phân bón, thuốc BVTV sinh học, vật tư đóng gói và quản lý phiếu nhập/xuất kho.</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setStockModal({ type: "in" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.panel, color: C.ink, border: `1.5px solid ${C.border}` }}
              >
                <ArrowDownToLine size={16} /> Tạo phiếu Nhập kho
              </button>
              <button
                onClick={() => setStockModal({ type: "out" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: C.primary }}
              >
                <ArrowUpFromLine size={16} /> Tạo phiếu Xuất kho
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
            <KPI icon={Package} label="Tổng số mặt hàng" value={num(items.length)} sub={`${CATS.length} nhóm phân loại`} accent={C.primary} />
            <KPI icon={Wallet} label="Giá trị tồn kho" value={money(totalValue)} sub="Theo đơn giá tham chiếu" accent={C.gold} />
            <KPI icon={AlertTriangle} label="Dưới ngưỡng an toàn" value={num(lowStockItems.length)} sub="Cần lên kế hoạch nhập" accent={C.warn} />
            <KPI icon={History} label="Giao dịch tháng này" value={num(txThisMonth)} sub="Phiếu nhập &amp; xuất" accent="#5C7A93" />
          </div>

          {/* alert banner */}
          {lowStockItems.length > 0 && (
            <div
              className="flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 mb-5 flex-wrap"
              style={{ background: C.warnSoft, border: `1px solid ${C.warnBorder}` }}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#F1D9C6" }}>
                  <AlertTriangle size={16} style={{ color: C.warn }} />
                </span>
                <p className="text-sm" style={{ color: "#5F3624" }}>
                  <span className="font-bold">Có {lowStockItems.length} vật tư</span> đang dưới ngưỡng tồn kho an toàn. Cần lên kế hoạch nhập hàng bổ sung.
                </p>
              </div>
              <button
                onClick={() => { setTab("inventory"); setStatusFilter("canhbao"); }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
                style={{ background: "#fff", color: C.warn, border: `1px solid ${C.warnBorder}` }}
              >
                Xem cảnh báo tồn kho
              </button>
            </div>
          )}

          {/* tabs */}
          <div className="flex items-center gap-1 mb-5 border-b" style={{ borderColor: C.borderSoft }}>
            <TabBtn active={tab === "inventory"} onClick={() => setTab("inventory")} icon={LayoutGrid} label="Danh mục Tồn kho vật tư" />
            <TabBtn active={tab === "history"} onClick={() => setTab("history")} icon={History} label="Lịch sử Nhập / Xuất kho" />
            <TabBtn active={tab === "stats"} onClick={() => setTab("stats")} icon={BarChart3} label="Thống kê" />
          </div>

          {tab === "inventory" && (
            <InventoryTab
              items={filtered}
              allCount={items.length}
              search={search} setSearch={setSearch}
              catFilter={catFilter} setCatFilter={setCatFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort}
              onAdd={() => setItemModal({ mode: "add", data: { name: "", category: CATS[0], qty: 0, unit: "kg", threshold: 0, price: 0 } })}
              onEdit={(it) => setItemModal({ mode: "edit", data: it })}
              onDelete={(it) => setDeleteTarget(it)}
              onExport={exportCSV}
            />
          )}

          {tab === "history" && <HistoryTab history={history} />}

          {tab === "stats" && <StatsTab chartData={chartData} urgentItems={urgentItems} totalValue={totalValue} items={items} />}
        </div>
      </main>

      {/* -------- modals -------- */}
      {itemModal && (
        <ItemFormModal
          mode={itemModal.mode}
          data={itemModal.data}
          onClose={() => setItemModal(null)}
          onSave={saveItem}
        />
      )}

      {stockModal && (
        <StockMoveModal
          type={stockModal.type}
          items={items}
          onClose={() => setStockModal(null)}
          onSubmit={submitStockMove}
        />
      )}

      {deleteTarget && (
        <Modal title="Xoá vật tư khỏi kho?" subtitle={`"${deleteTarget.name}" sẽ bị xoá khỏi danh mục tồn kho.`} onClose={() => setDeleteTarget(null)} width={420}>
          <p className="text-sm mb-5" style={{ color: C.inkSoft }}>Hành động này không thể hoàn tác. Lịch sử nhập/xuất liên quan vẫn được giữ lại.</p>
          <div className="flex justify-end gap-2.5">
            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ border: `1.5px solid ${C.border}`, color: C.ink }}>Huỷ</button>
            <button onClick={confirmDelete} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: C.danger }}>Xoá vật tư</button>
          </div>
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

/* ---------------------------------- sidebar bits ---------------------------------- */

function SideGroup({ label, children }) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="px-3 mb-1.5 text-[10.5px] font-bold tracking-wider" style={{ color: "#6C7C6E" }}>{label.toUpperCase()}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SideItem({ icon: Icon, label, active, badge }) {
  return (
    <button
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-left"
      style={active ? { background: C.primarySoft, color: C.primaryDark, fontWeight: 700 } : { color: "#C4CEC4" }}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {!!badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.dangerSoft, color: C.danger }}>{badge}</span>
      )}
    </button>
  );
}

/* ---------------------------------- kpi ---------------------------------- */

function KPI({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl p-4 flex items-start gap-3.5" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}1A` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium" style={{ color: C.inkSoft }}>{label}</div>
        <div className="text-xl font-extrabold tabular mt-0.5 truncate" style={{ color: C.ink }}>{value}</div>
        <div className="text-[11.5px] mt-0.5" style={{ color: C.muted }}>{sub}</div>
      </div>
    </div>
  );
}

/* ---------------------------------- tabs ---------------------------------- */

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold -mb-px"
      style={{
        color: active ? C.primaryDark : C.muted,
        borderBottom: active ? `2.5px solid ${C.primary}` : "2.5px solid transparent",
      }}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

/* ---------------------------------- inventory tab ---------------------------------- */

function InventoryTab({ items, allCount, search, setSearch, catFilter, setCatFilter, statusFilter, setStatusFilter, sortKey, sortDir, toggleSort, onAdd, onEdit, onDelete, onExport }) {
  const cols = [
    { key: "id", label: "Mã VT" },
    { key: "name", label: "Tên vật tư - nông cụ" },
    { key: "category", label: "Phân loại" },
    { key: "qty", label: "Số lượng tồn", num: true },
    { key: "threshold", label: "Ngưỡng an toàn", num: true },
    { key: "price", label: "Đơn giá tham chiếu", num: true },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-4" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm vật tư theo tên, mã, danh mục..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <Select value={catFilter} onChange={setCatFilter} options={[["all", "Tất cả phân loại"], ...CATS.map((c) => [c, c])]} />
        <Select value={statusFilter} onChange={setStatusFilter} options={[["all", "Tất cả trạng thái"], ["du", "Đủ số lượng"], ["canhbao", "Cảnh báo thiếu"], ["het", "Hết hàng"]]} />
        <button onClick={onExport} className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold shrink-0" style={{ border: `1.5px solid ${C.border}`, color: C.ink }}>
          <Download size={15} /> Xuất CSV
        </button>
        <button onClick={onAdd} className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0" style={{ background: C.primary }}>
          <Plus size={15} /> Thêm vật tư
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[880px]">
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={`px-4 py-3 text-[11.5px] font-bold tracking-wide cursor-pointer select-none ${c.num ? "text-right" : "text-left"}`}
                  style={{ color: C.muted, background: C.panelSoft }}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label.toUpperCase()}
                    {sortKey === c.key && <ChevronDown size={12} style={{ transform: sortDir === "desc" ? "rotate(180deg)" : "none" }} />}
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-[11.5px] font-bold tracking-wide text-left" style={{ color: C.muted, background: C.panelSoft }}>TRẠNG THÁI KHO</th>
              <th className="px-4 py-3 text-[11.5px] font-bold tracking-wide text-right" style={{ color: C.muted, background: C.panelSoft }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const st = STATUS_META[statusOf(it)];
              const ratio = Math.min(100, Math.round((it.qty / (it.threshold || 1)) * 100));
              return (
                <tr key={it.id} className="rowhover" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: C.inkSoft }}>{it.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold" style={{ color: C.ink }}>{it.name}</div>
                    <div className="w-28 h-1.5 rounded-full mt-1.5" style={{ background: C.borderSoft }}>
                      <div className="h-full rounded-full" style={{ width: `${ratio}%`, background: st.fg }} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Pill fg={CAT_COLOR[it.category]} bg={`${CAT_COLOR[it.category]}18`}>{it.category}</Pill>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold tabular" style={{ color: C.ink }}>{num(it.qty)} <span className="font-normal text-xs" style={{ color: C.muted }}>{it.unit}</span></td>
                  <td className="px-4 py-3.5 text-right tabular" style={{ color: C.muted }}>{num(it.threshold)} {it.unit}</td>
                  <td className="px-4 py-3.5 text-right tabular" style={{ color: C.inkSoft }}>{money(it.price)}</td>
                  <td className="px-4 py-3.5"><Pill fg={st.fg} bg={st.bg}>{st.label}</Pill></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(it)} className="p-1.5 rounded-lg" style={{ color: C.inkSoft }} title="Sửa"><Pencil size={15} /></button>
                      <button onClick={() => onDelete(it)} className="p-1.5 rounded-lg" style={{ color: C.danger }} title="Xoá"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <p className="font-semibold" style={{ color: C.ink }}>Không tìm thấy vật tư phù hợp</p>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>Thử điều chỉnh từ khoá tìm kiếm hoặc bộ lọc.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-xs flex items-center justify-between" style={{ color: C.muted, borderTop: `1px solid ${C.borderSoft}` }}>
        <span>Hiển thị {items.length} / {allCount} vật tư</span>
      </div>
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl text-sm outline-none font-medium w-full lg:w-auto"
        style={inputStyle}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.muted }} />
    </div>
  );
}

/* ---------------------------------- history tab ---------------------------------- */

function HistoryTab({ history }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr>
              {["Mã phiếu", "Loại", "Vật tư", "Số lượng", "Ngày", "Người thực hiện", "Ghi chú"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[11.5px] font-bold tracking-wide ${i === 3 ? "text-right" : "text-left"}`} style={{ color: C.muted, background: C.panelSoft }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="rowhover" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                <td className="px-4 py-3.5 font-semibold" style={{ color: C.inkSoft }}>{h.id}</td>
                <td className="px-4 py-3.5">
                  {h.type === "in"
                    ? <Pill fg={C.ok} bg={C.okSoft}><ArrowDownToLine size={12} /> Nhập kho</Pill>
                    : <Pill fg={C.gold} bg={C.goldSoft}><ArrowUpFromLine size={12} /> Xuất kho</Pill>}
                </td>
                <td className="px-4 py-3.5 font-semibold" style={{ color: C.ink }}>{h.itemName}</td>
                <td className="px-4 py-3.5 text-right font-bold tabular" style={{ color: h.type === "in" ? C.ok : C.gold }}>
                  {h.type === "in" ? "+" : "−"}{num(h.qty)}
                </td>
                <td className="px-4 py-3.5 tabular" style={{ color: C.inkSoft }}>{fmtDate(h.date)}</td>
                <td className="px-4 py-3.5" style={{ color: C.inkSoft }}>{h.person}</td>
                <td className="px-4 py-3.5" style={{ color: C.muted }}>{h.note}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-14 text-center" style={{ color: C.muted }}>Chưa có phiếu nhập/xuất nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------- stats tab ---------------------------------- */

function StatsTab({ chartData, urgentItems, totalValue, items }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 rounded-2xl p-5" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-bold mb-0.5" style={{ color: C.ink }}>Giá trị tồn kho theo phân loại</h3>
        <p className="text-xs mb-4" style={{ color: C.muted }}>Tổng giá trị: {money(totalValue)}</p>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke={C.borderSoft} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + "tr"} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(v) => money(v)}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5, fontFamily: FONT }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={CAT_COLOR[d.name] || C.primary} />)}
                <LabelList dataKey="value" position="top" formatter={(v) => (v / 1000000).toFixed(1) + "tr"} style={{ fontSize: 11, fill: C.inkSoft, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-bold mb-0.5" style={{ color: C.ink }}>Cần nhập hàng gấp</h3>
        <p className="text-xs mb-4" style={{ color: C.muted }}>Xếp theo mức độ thiếu hụt so với ngưỡng an toàn</p>
        <div className="flex flex-col gap-3">
          {urgentItems.length === 0 && <p className="text-sm" style={{ color: C.muted }}>Không có vật tư nào cần nhập gấp.</p>}
          {urgentItems.map((it) => {
            const ratio = Math.round((it.qty / (it.threshold || 1)) * 100);
            return (
              <div key={it.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold truncate" style={{ color: C.ink }}>{it.name}</span>
                    <span className="tabular font-bold" style={{ color: C.warn }}>{ratio}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mt-1.5" style={{ background: C.borderSoft }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, ratio)}%`, background: C.warn }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
          <h4 className="text-xs font-bold mb-2" style={{ color: C.inkSoft }}>PHÂN BỔ SỐ MẶT HÀNG</h4>
          <div className="flex flex-col gap-1.5">
            {CATS.map((c) => {
              const n = items.filter((i) => i.category === c).length;
              if (!n) return null;
              return (
                <div key={c} className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2" style={{ color: C.inkSoft }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLOR[c] }} /> {c}
                  </span>
                  <span className="font-bold tabular" style={{ color: C.ink }}>{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- item form modal ---------------------------------- */

function ItemFormModal({ mode, data, onClose, onSave }) {
  const [form, setForm] = useState(data);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) || 0 }));

  const valid = form.name.trim().length > 0 && form.unit.trim().length > 0;

  return (
    <Modal
      title={mode === "add" ? "Thêm vật tư mới" : "Sửa thông tin vật tư"}
      subtitle={mode === "add" ? "Thêm một mặt hàng mới vào danh mục kho." : `Mã vật tư: ${form.id}`}
      onClose={onClose}
    >
      <Field label="Tên vật tư - nông cụ">
        <input value={form.name} onChange={set("name")} placeholder="VD: Phân bón NPK 16-16-8" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
      </Field>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Phân loại">
          <Select value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={CATS.map((c) => [c, c])} />
        </Field>
        <Field label="Đơn vị tính">
          <input value={form.unit} onChange={set("unit")} placeholder="kg / cái / chai (1L)" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Số lượng tồn">
          <input type="number" min="0" value={form.qty} onChange={setNum("qty")} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none tabular" style={inputStyle} />
        </Field>
        <Field label="Ngưỡng an toàn">
          <input type="number" min="0" value={form.threshold} onChange={setNum("threshold")} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none tabular" style={inputStyle} />
        </Field>
      </div>
      <Field label="Đơn giá tham chiếu (đ)">
        <input type="number" min="0" value={form.price} onChange={setNum("price")} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none tabular" style={inputStyle} />
      </Field>

      <div className="flex justify-end gap-2.5 mt-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ border: `1.5px solid ${C.border}`, color: C.ink }}>Huỷ</button>
        <button
          disabled={!valid}
          onClick={() => onSave(form)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: valid ? C.primary : C.muted, opacity: valid ? 1 : 0.6 }}
        >
          {mode === "add" ? "Thêm vật tư" : "Lưu thay đổi"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------------------------- stock move modal ---------------------------------- */

function StockMoveModal({ type, items, onClose, onSubmit }) {
  const [itemId, setItemId] = useState(items[0]?.id || "");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const item = items.find((i) => i.id === itemId);
  const qtyNum = Number(qty) || 0;
  const exceeds = type === "out" && item && qtyNum > item.qty;
  const valid = itemId && qtyNum > 0 && !exceeds;

  const isIn = type === "in";

  return (
    <Modal
      title={isIn ? "Tạo phiếu Nhập kho" : "Tạo phiếu Xuất kho"}
      subtitle={isIn ? "Ghi nhận vật tư mới nhập về kho." : "Ghi nhận vật tư xuất khỏi kho."}
      onClose={onClose}
    >
      <Field label="Vật tư - nông cụ">
        <Select value={itemId} onChange={setItemId} options={items.map((i) => [i.id, `${i.name} (${i.id})`])} />
      </Field>

      {item && (
        <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl mb-4" style={{ background: C.panelSoft, border: `1px solid ${C.borderSoft}` }}>
          <span style={{ color: C.inkSoft }}>Tồn kho hiện tại</span>
          <span className="font-bold tabular" style={{ color: C.ink }}>{num(item.qty)} {item.unit}</span>
        </div>
      )}

      <Field label={`Số lượng ${isIn ? "nhập" : "xuất"} ${item ? `(${item.unit})` : ""}`}>
        <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none tabular" style={inputStyle} />
        {exceeds && <span className="text-xs font-medium mt-1.5 block" style={{ color: C.danger }}>Số lượng xuất vượt quá tồn kho hiện có.</span>}
      </Field>

      <Field label="Ghi chú">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={isIn ? "VD: Nhập đợt vụ Đông Xuân từ nhà cung cấp..." : "VD: Cấp phát cho tổ trồng rau xã viên..."} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
      </Field>

      <div className="flex justify-end gap-2.5 mt-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ border: `1.5px solid ${C.border}`, color: C.ink }}>Huỷ</button>
        <button
          disabled={!valid}
          onClick={() => onSubmit({ itemId, qty: qtyNum, note, type })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: valid ? (isIn ? C.primary : C.gold) : C.muted, opacity: valid ? 1 : 0.6 }}
        >
          {isIn ? <ArrowDownToLine size={15} /> : <ArrowUpFromLine size={15} />}
          {isIn ? "Xác nhận nhập kho" : "Xác nhận xuất kho"}
        </button>
      </div>
    </Modal>
  );
}
