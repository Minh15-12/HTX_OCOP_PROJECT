import React, { useState, useEffect } from 'react';
import type { HarvestItem } from '@/types/agriculture';
import { HarvestDrawerHeader } from './HarvestDrawerHeader';
import { HarvestTabQualityKcs } from './tabs/HarvestTabQualityKcs';
import { HarvestTabTraceability } from './tabs/HarvestTabTraceability';
import { HarvestTabSettlement } from './tabs/HarvestTabSettlement';
import { Award, QrCode, Coins } from 'lucide-react';

type HarvestTabKey = 'kcs' | 'traceability' | 'settlement';

interface HarvestDrawerProps {
  harvest: HarvestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (h: HarvestItem) => void;
  onPrintLabel: (h: HarvestItem) => void;
  onDelete?: (h: HarvestItem) => void;
}

export const HarvestDrawer: React.FC<HarvestDrawerProps> = ({
  harvest,
  isOpen,
  onClose,
  onEdit,
  onPrintLabel,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<HarvestTabKey>('kcs');

  // Reset tab when new harvest is selected
  useEffect(() => {
    if (harvest?.id) {
      setActiveTab('kcs');
    }
  }, [harvest?.id]);

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

  if (!isOpen || !harvest) return null;

  const tabs: { key: HarvestTabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'kcs', label: 'Hồ sơ KCS & Gate PHI', icon: <Award className="w-4 h-4" /> },
    { key: 'traceability', label: 'Truy xuất GS1 & Mã QR', icon: <QrCode className="w-4 h-4" /> },
    { key: 'settlement', label: 'Định giá & Cấn trừ nợ', icon: <Coins className="w-4 h-4" /> },
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
        id="harvest-detail-sheet"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="harvest-detail-title"
      >
        {/* Fixed Header */}
        <HarvestDrawerHeader
          harvest={harvest}
          onClose={onClose}
          onEdit={onEdit}
          onPrintLabel={onPrintLabel}
          onDelete={onDelete}
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
          {activeTab === 'kcs' && <HarvestTabQualityKcs harvest={harvest} />}
          {activeTab === 'traceability' && <HarvestTabTraceability harvest={harvest} />}
          {activeTab === 'settlement' && <HarvestTabSettlement harvest={harvest} />}
        </div>
      </div>
    </>
  );
};

export default HarvestDrawer;
