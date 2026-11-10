import React, { useState, useEffect } from 'react';
import { ReceivablePayable } from '@/services/financeApi';
import { DebtDrawerHeader } from './DebtDrawerHeader';
import { DebtTabOverview } from './tabs/DebtTabOverview';
import { DebtTabSettlements } from './tabs/DebtTabSettlements';
import { FileText, Receipt } from 'lucide-react';

type DebtTabKey = 'overview' | 'settlements';

interface DebtDrawerProps {
  debt: ReceivablePayable | null;
  isOpen: boolean;
  onClose: () => void;
  onSettle: (d: ReceivablePayable) => void;
}

export const DebtDrawer: React.FC<DebtDrawerProps> = ({
  debt,
  isOpen,
  onClose,
  onSettle,
}) => {
  const [activeTab, setActiveTab] = useState<DebtTabKey>('overview');

  // Reset tab when new debt is selected
  useEffect(() => {
    if (debt?.id) {
      setActiveTab('overview');
    }
  }, [debt?.id]);

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

  if (!isOpen || !debt) return null;

  const tabs: { key: DebtTabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Chi tiết & Tiến độ thu hồi', icon: <FileText className="w-4 h-4" /> },
    { key: 'settlements', label: 'Lịch sử Thu / Chi & Chứng từ', icon: <Receipt className="w-4 h-4" /> },
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
        id="debt-detail-sheet"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="debt-detail-title"
      >
        {/* Fixed Header */}
        <DebtDrawerHeader
          debt={debt}
          onClose={onClose}
          onSettle={onSettle}
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
          {activeTab === 'overview' && <DebtTabOverview debt={debt} />}
          {activeTab === 'settlements' && <DebtTabSettlements debt={debt} />}
        </div>
      </div>
    </>
  );
};

export default DebtDrawer;
