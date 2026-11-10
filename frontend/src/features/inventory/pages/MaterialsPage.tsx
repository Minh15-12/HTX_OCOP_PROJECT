import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Package, Wallet, AlertTriangle, Clock, Sprout, Plus, ArrowDownRight, ArrowUpRight, Check, Building2, Layers, ClipboardCheck, Download, Loader2,
  Wrench, Scale, Printer, Recycle
} from 'lucide-react';
import { Material, StockReceipt, StockIssue, Voucher02Data } from '../../../types/inventory';
import { inventoryApi } from '../../../services/inventoryApi';
import { reportApi } from '@/services/reportApi';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { MaterialsTable } from '../components/MaterialsTable';
import { StockReceiptsTable } from '../components/StockReceiptsTable';
import { StockIssuesTable } from '../components/StockIssuesTable';
import { MaterialBatchesTable } from '../components/MaterialBatchesTable';
import { StockCountsTable } from '../components/StockCountsTable';
import { CreateStockCountModal } from '../components/CreateStockCountModal';
import { MaterialAllocationsTab } from '../components/MaterialAllocationsTab';
import { MaterialModals } from '../components/MaterialModals';
import { PrintVoucher02Modal } from '../components/PrintVoucher02Modal';
import { ReturnPackagingModal } from '../components/ReturnPackagingModal';
import { MemberToolTrackingTab } from '../components/MemberToolTrackingTab';
import { MaterialReconciliationTab } from '../components/MaterialReconciliationTab';

const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const num = (n: number) => n.toLocaleString('vi-VN');

type InventoryTab = 'inventory' | 'batches' | 'receipts' | 'issues' | 'tools_005' | 'reconciliation' | 'counts' | 'allocations';

export const MaterialsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeCooperative } = useTenantContextStore();
  const [toast, setToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Queries
  const { data: items = [], isLoading: loadingItems, isError: errorItems } = useQuery({
    queryKey: ['materials'],
    queryFn: () => inventoryApi.getMaterials(),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['stockReceipts'],
    queryFn: () => inventoryApi.getStockReceipts(),
  });

  const { data: issues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ['stockIssues'],
    queryFn: () => inventoryApi.getStockIssues(),
  });

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ['materialBatches'],
    queryFn: () => inventoryApi.getMaterialBatches(),
  });

  const { data: counts = [], isLoading: loadingCounts } = useQuery({
    queryKey: ['stockCounts'],
    queryFn: () => inventoryApi.getStockCounts(),
  });

  // State
  const [tab, setTab] = useState<InventoryTab>('inventory');
  const [itemModal, setItemModal] = useState<{ mode: 'add' | 'edit'; data: Partial<Material> } | null>(null);
  const [stockModal, setStockModal] = useState<{ type: 'IN' | 'OUT'; defaultItem?: Material | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<StockReceipt | null>(null);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [isStockCountModalOpen, setIsStockCountModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState<Voucher02Data | null>(null);
  const [isPrintVoucherOpen, setIsPrintVoucherOpen] = useState(false);
  const [loadingVoucher, setLoadingVoucher] = useState(false);
  const [packagingTargetIssue, setPackagingTargetIssue] = useState<StockIssue | null>(null);

  // KPI Calculations
  const totalValue = items.reduce((s, it) => s + it.stockQty * (it.unitPrice || 0), 0);
  const lowStockCount = items.filter((it) => it.stockQty < (it.minSafetyStock || 0)).length;
  const expiringCount = batches.filter((b) => b.status === 'NEAR_EXPIRY' || b.status === 'EXPIRED').length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveMaterial = async (data: Partial<Material>) => {
    try {
      if (itemModal?.mode === 'add') {
        await inventoryApi.createMaterial(data);
        showToast(`Đã thêm mới vật tư "${data.name}" vào kho`);
      } else if (itemModal?.data.id) {
        await inventoryApi.updateMaterial(itemModal.data.id, data);
        showToast(`Đã cập nhật thông tin vật tư "${data.name}"`);
      }
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setItemModal(null);
    } catch {
      showToast('Thao tác không thành công. Vui lòng kiểm tra lại kết nối!');
    }
  };

  const handleStockMove = async (payload: {
    itemId: string;
    qty: number;
    note: string;
    type: 'IN' | 'OUT';
    seasonName?: string;
    memberName?: string;
  }) => {
    try {
      const selectedMat = items.find((i) => i.id === payload.itemId);
      if (payload.type === 'IN') {
        await inventoryApi.createStockReceipt({
          material_id: payload.itemId,
          quantity: payload.qty,
          unit_price: selectedMat?.unitPrice || 0,
          note: payload.note,
        });
        showToast(`Đã ghi nhận nhập kho +${payload.qty} ${selectedMat?.unit || ''}`);
      } else {
        await inventoryApi.createStockIssue({
          material_id: payload.itemId,
          quantity: payload.qty,
          season_name: payload.seasonName,
          member_name: payload.memberName,
          note: payload.note,
        });
        showToast(`Đã ghi nhận xuất kho cấp phát -${payload.qty} ${selectedMat?.unit || ''}`);
      }
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['stockReceipts'] });
      queryClient.invalidateQueries({ queryKey: ['stockIssues'] });
      setStockModal(null);
    } catch {
      showToast('Ghi nhận phiếu kho thất bại!');
    }
  };

  const handleApproveIssue = async (id: string) => {
    try {
      await inventoryApi.approveStockIssue(id);
      showToast('Đã phê duyệt phiếu xuất kho thành công');
      queryClient.invalidateQueries({ queryKey: ['stockIssues'] });
    } catch {
      showToast('Không thể phê duyệt phiếu xuất kho lúc này');
    }
  };

  const handlePrintVoucher = async (issue: StockIssue) => {
    try {
      setLoadingVoucher(true);
      setIsPrintVoucherOpen(true);
      const data = await inventoryApi.getVoucher02Data(issue.id);
      setVoucherData(data);
    } catch {
      showToast('Không thể tải chứng từ Mẫu 02-VT lúc này');
      setIsPrintVoucherOpen(false);
    } finally {
      setLoadingVoucher(false);
    }
  };

  const handleRecordPackagingReturn = async (issueId: string, count: number, proofPhotoUrl?: string) => {
    try {
      await inventoryApi.recordPackagingReturn(issueId, { returned_count: count, proof_photo_url: proofPhotoUrl });
      showToast(`Đã ghi nhận thu hồi +${count} vỏ bao bì thuốc BVTV thành công!`);
      queryClient.invalidateQueries({ queryKey: ['stockIssues'] });
    } catch {
      showToast('Ghi nhận thu hồi vỏ bao bì thất bại!');
      throw new Error('Ghi nhận thu hồi vỏ bao bì thất bại!');
    }
  };

  const handleExportStockExcel = async () => {
    try {
      setIsExporting(true);
      showToast('Đang kết xuất báo cáo tồn kho & cảnh báo hạn FEFO...');
      await reportApi.exportInventoryStockExcel();
      showToast('Xuất báo cáo tồn kho Excel thành công!');
    } catch (err: any) {
      showToast('Lỗi khi xuất file Excel tồn kho. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 pb-16 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-mono font-bold text-slate-400">
              {activeCooperative?.legal_name || 'Hợp tác xã'} / Quản lý Kho & Vật tư
            </span>
            <span className="pill-badge pill-green">FEFO & Credit Advance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Quản trị Kho Vật tư Nông nghiệp & Cấp nợ Đầu vụ
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportStockExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
            title="Xuất báo cáo tồn kho và hạn sử dụng FEFO ra file Excel"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            ) : (
              <Download className="w-4 h-4 text-emerald-700" />
            )}
            <span>{isExporting ? 'Đang xuất...' : 'Xuất tồn kho (Excel)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setWarehouseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Building2 className="w-4 h-4 text-slate-600" />
            Hệ thống kho
          </button>
          <button
            type="button"
            onClick={() => setStockModal({ type: 'IN' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            Nhập kho
          </button>
          <button
            type="button"
            onClick={() => setStockModal({ type: 'OUT' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
            Xuất nợ đầu vụ
          </button>
          <button
            type="button"
            onClick={() => setItemModal({ mode: 'add', data: {} })}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Thêm vật tư
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.8px] text-slate-500 font-medium">Danh mục vật tư</div>
            <div className="text-xl font-black text-slate-900 mt-0.5 truncate">{num(items.length)} mặt hàng</div>
            <div className="text-[10.8px] text-slate-400 mt-0.5">Phân bón, BVTV, bao bì</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.8px] text-slate-500 font-medium">Tổng giá trị tồn kho</div>
            <div className="text-xl font-black text-slate-900 mt-0.5 truncate">{money(totalValue)}</div>
            <div className="text-[10.8px] text-slate-400 mt-0.5">Theo đơn giá tham chiếu</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.8px] text-slate-500 font-medium">Cảnh báo thiếu hụt</div>
            <div className={`text-xl font-black mt-0.5 truncate ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {num(lowStockCount)} vật tư
            </div>
            <div className="text-[10.8px] text-slate-400 mt-0.5">Dưới ngưỡng an toàn</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.8px] text-slate-500 font-medium">Lô cận date & hết hạn</div>
            <div className={`text-xl font-black mt-0.5 truncate ${expiringCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {num(expiringCount)} lô FEFO
            </div>
            <div className="text-[10.8px] text-slate-400 mt-0.5">Cần ưu tiên xuất kho</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setTab('inventory')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            tab === 'inventory' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Danh mục Tồn kho ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('batches')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            tab === 'batches' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          Lô Hạn dùng FEFO ({batches.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('receipts')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            tab === 'receipts' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Phiếu Nhập kho ({history.filter((r) => r.type === 'IN').length})
        </button>
        <button
          type="button"
          onClick={() => setTab('issues')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            tab === 'issues' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
          Phiếu Xuất & Cấp nợ ({issues.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('tools_005')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            tab === 'tools_005' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
          Nông cụ (TK 005)
        </button>
        <button
          type="button"
          onClick={() => setTab('reconciliation')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            tab === 'reconciliation' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-indigo-600" />
          Đối soát cuối vụ (Phép thử 3 chiều)
        </button>
        <button
          type="button"
          onClick={() => setTab('counts')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            tab === 'counts' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
          Kiểm kê kho ({counts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('allocations')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            tab === 'allocations' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          Cấp phát Xã viên
        </button>
      </div>

      {/* Tab Contents */}
      {!loadingItems && !errorItems && (
        <>
          {tab === 'inventory' && (
            <MaterialsTable
              items={items}
              onSelectRow={(it) => setSelectedMaterial(it)}
              selectedId={selectedMaterial?.id}
              onEdit={(it) => setItemModal({ mode: 'edit', data: it })}
              onDelete={(it) => setDeleteTarget(it)}
              onStockMove={(it, moveType) => setStockModal({ type: moveType, defaultItem: it })}
            />
          )}

          {tab === 'batches' && (
            <MaterialBatchesTable batches={batches} isLoading={loadingBatches} />
          )}

          {tab === 'receipts' && (
            <StockReceiptsTable
              history={history}
              onSelectRow={(r) => setSelectedReceipt(r)}
              selectedId={selectedReceipt?.id}
            />
          )}

          {tab === 'issues' && (
            <StockIssuesTable
              issues={issues}
              isLoading={loadingIssues}
              onApproveIssue={handleApproveIssue}
              onPrintVoucher={handlePrintVoucher}
              onReturnPackaging={(iss) => setPackagingTargetIssue(iss)}
            />
          )}

          {tab === 'tools_005' && (
            <MemberToolTrackingTab materials={items} />
          )}

          {tab === 'reconciliation' && (
            <MaterialReconciliationTab />
          )}

          {tab === 'counts' && (
            <StockCountsTable
              counts={counts}
              isLoading={loadingCounts}
              onOpenCreateModal={() => setIsStockCountModalOpen(true)}
            />
          )}

          {tab === 'allocations' && (
            <MaterialAllocationsTab
              history={history}
              onNewAllocation={() => setStockModal({ type: 'OUT' })}
            />
          )}
        </>
      )}

      {/* Modals and Drawers Container */}
      <MaterialModals
        itemModal={itemModal}
        onCloseItemModal={() => setItemModal(null)}
        onSaveMaterial={handleSaveMaterial}
        stockModal={stockModal}
        items={items}
        onCloseStockModal={() => setStockModal(null)}
        onSubmitStockMove={handleStockMove}
        deleteTarget={deleteTarget}
        onCloseDeleteTarget={() => setDeleteTarget(null)}
        onConfirmDeleteTarget={() => {
          if (deleteTarget) {
            showToast(`Đã xóa vật tư "${deleteTarget.name}"`);
            setDeleteTarget(null);
            queryClient.invalidateQueries({ queryKey: ['materials'] });
          }
        }}
        selectedMaterial={selectedMaterial}
        onCloseMaterialDrawer={() => setSelectedMaterial(null)}
        onEditFromDrawer={(m) => {
          setSelectedMaterial(null);
          setItemModal({ mode: 'edit', data: m });
        }}
        onStockMoveFromDrawer={(m, type) => {
          setSelectedMaterial(null);
          setStockModal({ type, defaultItem: m });
        }}
        selectedReceipt={selectedReceipt}
        onCloseReceiptDrawer={() => setSelectedReceipt(null)}
        warehouseModalOpen={warehouseModalOpen}
        onCloseWarehouseModal={() => setWarehouseModalOpen(false)}
      />

      {/* Stock Count Audit Creation Modal */}
      <CreateStockCountModal
        isOpen={isStockCountModalOpen}
        onClose={() => setIsStockCountModalOpen(false)}
        materials={items}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['stockCounts'] });
          showToast('Đã lưu phiếu kiểm kê kho thành công!');
        }}
      />

      {/* Print Voucher 02-VT Modal (Thông tư 71/2024/TT-BTC) */}
      <PrintVoucher02Modal
        isOpen={isPrintVoucherOpen}
        onClose={() => setIsPrintVoucherOpen(false)}
        voucherData={voucherData}
        isLoading={loadingVoucher}
      />

      {/* Return Pesticide Packaging Modal (TTLT 05/2016 & Tiêu chí OCOP) */}
      <ReturnPackagingModal
        isOpen={Boolean(packagingTargetIssue)}
        onClose={() => setPackagingTargetIssue(null)}
        issue={packagingTargetIssue}
        onSubmit={handleRecordPackagingReturn}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
};
