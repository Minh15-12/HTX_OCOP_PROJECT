import React, { useState, useEffect } from 'react';
import { Material } from '@/types/inventory';
import { MaterialDrawerHeader } from './MaterialDrawerHeader';
import { MaterialTabOverview } from './tabs/MaterialTabOverview';
import { MaterialTabWarehouses } from './tabs/MaterialTabWarehouses';
import { MaterialTabHistory } from './tabs/MaterialTabHistory';
import { Info, Building2, History } from 'lucide-react';

type MaterialTabKey = 'overview' | 'warehouses' | 'history';

interface MaterialDrawerProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (m: Material) => void;
  onStockMove: (m: Material, type: 'IN' | 'OUT') => void;
}

export const MaterialDrawer: React.FC<MaterialDrawerProps> = ({
  material,
  isOpen,
  onClose,
  onEdit,
  onStockMove,
}) => {
  const [activeTab, setActiveTab] = useState<MaterialTabKey>('overview');

  // Reset tab when new material is selected
  useEffect(() => {
    if (material?.id) {
      setActiveTab('overview');
    }
  }, [material?.id]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !material) return null;

  const tabs: { key: MaterialTabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Thông tin & Định mức', icon: <Info className="w-4 h-4" /> },
    { key: 'warehouses', label: 'Điểm kho & Lưu trữ', icon: <Building2 className="w-4 h-4" /> },
    { key: 'history', label: 'Lịch sử Nhập / Xuất', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Semi-transparent Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Sheet / Detail Panel (Right side) */}
      <div
        id="material-detail-sheet"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-detail-title"
      >
        {/* Fixed Header */}
        <MaterialDrawerHeader
          material={material}
          onClose={onClose}
          onEdit={onEdit}
          onStockMove={onStockMove}
        />

        {/* Horizontal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/60 shrink-0 overflow-x-auto custom-scrollbar">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`py-3.5 px-3.5 text-[13px] font-bold transition-all relative whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <span className={isActive ? 'text-emerald-700' : 'text-slate-400'}>{t.icon}</span>
                <span>{t.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/40">
          {activeTab === 'overview' && <MaterialTabOverview material={material} />}
          {activeTab === 'warehouses' && <MaterialTabWarehouses material={material} />}
          {activeTab === 'history' && <MaterialTabHistory material={material} />}
        </div>
      </div>
    </>
  );
};

export default MaterialDrawer;
