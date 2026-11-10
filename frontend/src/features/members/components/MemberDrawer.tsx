import React, { useState, useEffect } from 'react';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { MemberDrawerHeader } from './drawer/MemberDrawerHeader';
import { MemberTabPersonal } from './drawer/tabs/MemberTabPersonal';
import { MemberTabCapital } from './drawer/tabs/MemberTabCapital';
import { MemberTabFarmingPlots } from './drawer/tabs/MemberTabFarmingPlots';
import { User, Coins, FileText } from 'lucide-react';

export type DrawerTabKey =
  | 'personal'
  | 'capital'
  | 'farming'
  // Legacy aliases for backward compatibility
  | 'finance'
  | 'documents'
  | 'audit_trace';

interface MemberDrawerProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (m: Member) => void;
  onApprove?: (m: Member) => void;
  onReject?: (m: Member) => void;
  onPrint?: (m: Member) => void;
  onPrintCertificate?: (m: Member, issueCount?: number) => void;
  onPrintVoucher?: (m: Member, tx?: CapitalTransaction) => void;
  onRecordCapital?: (m: Member) => void;
  onPreviewFile?: (url: string, name: string) => void;
  onSuspend?: (m: Member) => void;
  onRestore?: (m: Member) => void;
  onTerminate?: (m: Member) => void;
  transactions?: CapitalTransaction[];
  initialTab?: DrawerTabKey;
}

const normalizeTab = (tab?: DrawerTabKey): 'personal' | 'capital' | 'farming' => {
  if (tab === 'capital' || tab === 'finance') return 'capital';
  if (tab === 'farming' || tab === 'documents' || tab === 'audit_trace') return 'farming';
  return 'personal';
};

export const MemberDrawer: React.FC<MemberDrawerProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onPrint,
  onPrintCertificate,
  onPrintVoucher,
  onRecordCapital,
  onPreviewFile,
  onSuspend,
  onRestore,
  onTerminate,
  transactions = [],
  initialTab = 'personal',
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'capital' | 'farming'>(
    normalizeTab(initialTab)
  );

  // Reset tab when a new member is selected or initialTab changes
  useEffect(() => {
    if (member?.id) {
      setActiveTab(normalizeTab(initialTab));
    }
  }, [member?.id, initialTab]);

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

  if (!isOpen || !member) return null;

  const tabs: { key: 'personal' | 'capital' | 'farming'; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Thông tin chung', icon: <User className="w-4 h-4" /> },
    { key: 'capital', label: 'Vốn góp & Tài chính', icon: <Coins className="w-4 h-4" /> },
    { key: 'farming', label: 'Hồ sơ & Lịch sử', icon: <FileText className="w-4 h-4" /> },
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
        id="member-detail-sheet"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-detail-title"
      >
        {/* Fixed Header */}
        <MemberDrawerHeader
          member={member}
          onClose={onClose}
          onEdit={onEdit}
          onPrint={onPrint}
          onApprove={onApprove}
          onReject={onReject}
          onSuspend={onSuspend}
          onRestore={onRestore}
          onTerminate={onTerminate}
        />

        {/* 3 Streamlined Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70 shrink-0">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`py-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
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
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/40">
          {activeTab === 'personal' && <MemberTabPersonal member={member} />}

          {activeTab === 'capital' && (
            <MemberTabCapital
              member={member}
              transactions={transactions}
              onPrintVoucher={onPrintVoucher}
              onPrintCertificate={onPrintCertificate}
              onRecordCapital={onRecordCapital}
            />
          )}

          {activeTab === 'farming' && (
            <MemberTabFarmingPlots
              member={member}
              onPrintVoucher={onPrintVoucher}
              onPreviewFile={onPreviewFile}
              onPrintCertificate={onPrintCertificate || onPrint}
              onPrintProfile={onPrint}
            />
          )}
        </div>
      </div>
    </>
  );
};
