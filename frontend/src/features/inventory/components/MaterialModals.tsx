import React from 'react';
import { Material, StockReceipt } from '../../../types/inventory';
import { MaterialFormModal } from './MaterialFormModal';
import { StockMoveModal } from './StockMoveModal';
import { WarehouseManagementModal } from './WarehouseManagementModal';
import { MaterialDrawer } from './drawer/MaterialDrawer';
import { StockReceiptDrawer } from './drawer/StockReceiptDrawer';

interface MaterialModalsProps {
  itemModal: { mode: 'add' | 'edit'; data: Partial<Material> } | null;
  onCloseItemModal: () => void;
  onSaveMaterial: (data: Partial<Material>) => void;

  stockModal: { type: 'IN' | 'OUT'; defaultItem?: Material | null } | null;
  items: Material[];
  onCloseStockModal: () => void;
  onSubmitStockMove: (payload: any) => void;

  deleteTarget: Material | null;
  onCloseDeleteTarget: () => void;
  onConfirmDeleteTarget: () => void;

  selectedMaterial: Material | null;
  onCloseMaterialDrawer: () => void;
  onEditFromDrawer: (m: Material) => void;
  onStockMoveFromDrawer: (m: Material, type: 'IN' | 'OUT') => void;

  selectedReceipt: StockReceipt | null;
  onCloseReceiptDrawer: () => void;

  warehouseModalOpen: boolean;
  onCloseWarehouseModal: () => void;
}

export const MaterialModals: React.FC<MaterialModalsProps> = ({
  itemModal,
  onCloseItemModal,
  onSaveMaterial,
  stockModal,
  items,
  onCloseStockModal,
  onSubmitStockMove,
  deleteTarget,
  onCloseDeleteTarget,
  onConfirmDeleteTarget,
  selectedMaterial,
  onCloseMaterialDrawer,
  onEditFromDrawer,
  onStockMoveFromDrawer,
  selectedReceipt,
  onCloseReceiptDrawer,
  warehouseModalOpen,
  onCloseWarehouseModal,
}) => {
  return (
    <>
      {itemModal && (
        <MaterialFormModal
          mode={itemModal.mode}
          initialData={itemModal.data}
          onClose={onCloseItemModal}
          onSave={onSaveMaterial}
        />
      )}

      {stockModal && (
        <StockMoveModal
          type={stockModal.type}
          items={items}
          defaultItem={stockModal.defaultItem}
          onClose={onCloseStockModal}
          onSubmit={onSubmitStockMove}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa vật tư?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vật tư <strong>"{deleteTarget.name}"</strong> ({deleteTarget.id}) sẽ bị loại bỏ khỏi danh mục quản lý.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onCloseDeleteTarget}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteTarget}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Xóa vật tư
              </button>
            </div>
          </div>
        </div>
      )}

      <MaterialDrawer
        material={selectedMaterial}
        isOpen={!!selectedMaterial}
        onClose={onCloseMaterialDrawer}
        onEdit={onEditFromDrawer}
        onStockMove={onStockMoveFromDrawer}
      />

      <StockReceiptDrawer
        receipt={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={onCloseReceiptDrawer}
      />

      <WarehouseManagementModal
        isOpen={warehouseModalOpen}
        onClose={onCloseWarehouseModal}
      />
    </>
  );
};
