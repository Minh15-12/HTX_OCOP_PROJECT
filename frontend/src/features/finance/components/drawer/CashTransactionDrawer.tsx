import React, { useState, useEffect } from 'react';
import { FileText, Printer } from 'lucide-react';
import { CashTransaction } from '@/services/financeApi';
import { CashTransactionDrawerHeader } from './CashTransactionDrawerHeader';
import { CashTransactionTabAccounting } from './tabs/CashTransactionTabAccounting';
import { CashTransactionTabVoucher } from './tabs/CashTransactionTabVoucher';

export type CashTransactionDrawerTab = 'accounting' | 'voucher';

interface CashTransactionDrawerProps {
  transaction: CashTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: (transaction: CashTransaction) => void;
}

export const CashTransactionDrawer: React.FC<CashTransactionDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
  onPrint,
}) => {
  const [activeTab, setActiveTab] = useState<CashTransactionDrawerTab>('accounting');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset tab when transaction changes
  useEffect(() => {
    if (transaction) {
      setActiveTab('accounting');
    }
  }, [transaction?.id]);

  if (!isOpen || !transaction) return null;

  const tabs: { id: CashTransactionDrawerTab; label: string; icon: any }[] = [
    { id: 'accounting', label: 'Định khoản & Hạch toán', icon: FileText },
    { id: 'voucher', label: 'Mẫu chứng từ & In ấn', icon: Printer },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer slide-over */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
          {/* Header */}
          <CashTransactionDrawerHeader
            transaction={transaction}
            onClose={onClose}
            onPrint={onPrint}
          />

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                    isActive
                      ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'accounting' && (
              <CashTransactionTabAccounting transaction={transaction} />
            )}
            {activeTab === 'voucher' && <CashTransactionTabVoucher transaction={transaction} />}
          </div>
        </div>
      </div>
    </div>
  );
};
