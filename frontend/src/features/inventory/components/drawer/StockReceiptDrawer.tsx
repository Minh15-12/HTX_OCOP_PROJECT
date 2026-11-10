import React, { useState, useEffect } from 'react';
import { FileText, Users, Printer } from 'lucide-react';
import { StockReceipt } from '@/types/inventory';
import { StockReceiptDrawerHeader } from './StockReceiptDrawerHeader';
import { StockReceiptTabDetails } from './tabs/StockReceiptTabDetails';
import { StockReceiptTabRecipient } from './tabs/StockReceiptTabRecipient';
import { StockReceiptTabVoucher } from './tabs/StockReceiptTabVoucher';

export type StockReceiptDrawerTab = 'details' | 'recipient' | 'voucher';

interface StockReceiptDrawerProps {
  receipt: StockReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StockReceiptDrawer: React.FC<StockReceiptDrawerProps> = ({
  receipt,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<StockReceiptDrawerTab>('details');

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

  // Reset tab when receipt changes
  useEffect(() => {
    if (receipt) {
      setActiveTab('details');
    }
  }, [receipt?.id]);

  if (!isOpen || !receipt) return null;

  const isIn = receipt.type === 'IN';
  const tabs: { id: StockReceiptDrawerTab; label: string; icon: any }[] = [
    { id: 'details', label: 'Thông số chứng từ', icon: FileText },
    {
      id: 'recipient',
      label: isIn ? 'Nguồn gốc nhập' : 'Cấp phát & Công nợ',
      icon: Users,
    },
    { id: 'voucher', label: 'Biểu mẫu & In phiếu', icon: Printer },
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
          <StockReceiptDrawerHeader receipt={receipt} onClose={onClose} />

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
                      ? isIn
                        ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                        : 'border-blue-600 text-blue-800 bg-white rounded-t-lg shadow-2xs'
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
            {activeTab === 'details' && <StockReceiptTabDetails receipt={receipt} />}
            {activeTab === 'recipient' && <StockReceiptTabRecipient receipt={receipt} />}
            {activeTab === 'voucher' && <StockReceiptTabVoucher receipt={receipt} />}
          </div>
        </div>
      </div>
    </div>
  );
};
