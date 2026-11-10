import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CropSeason, CropSeasonBomItem, fetchSeasonBoms } from '@/services/cropSeasonApi';
import { CropSeasonDrawerHeader } from './CropSeasonDrawerHeader';
import { CropSeasonTabOverview } from './tabs/CropSeasonTabOverview';
import { CropSeasonTabPlots } from './tabs/CropSeasonTabPlots';
import { CropSeasonTabBom } from './tabs/CropSeasonTabBom';
import { CropSeasonTabLogs } from './tabs/CropSeasonTabLogs';
import { CropSeasonTabHarvests } from './tabs/CropSeasonTabHarvests';
import { PrintSeasonPlanModal } from '../PrintSeasonPlanModal';
import { Info, MapPin, BookOpen, Wheat, PackageCheck } from 'lucide-react';

type SeasonTabKey = 'overview' | 'plots' | 'bom' | 'logs' | 'harvests';

interface CropSeasonDrawerProps {
  season: CropSeason | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (s: CropSeason) => void;
  onCloseSeason?: (s: CropSeason) => void;
}

export const CropSeasonDrawer: React.FC<CropSeasonDrawerProps> = ({
  season,
  isOpen,
  onClose,
  onEdit,
  onCloseSeason,
}) => {
  const [activeTab, setActiveTab] = useState<SeasonTabKey>('overview');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Query BOM data for printing and export
  const { data: boms = [] } = useQuery<CropSeasonBomItem[]>({
    queryKey: ['seasonBoms', season?.id],
    queryFn: () => (season?.id ? fetchSeasonBoms(season.id) : Promise.resolve([])),
    enabled: !!season?.id && isOpen,
  });

  useEffect(() => {
    if (season?.id) {
      setActiveTab('overview');
    }
  }, [season?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPrintModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isPrintModalOpen]);

  if (!isOpen || !season) return null;

  const tabs: { key: SeasonTabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Thông tin & Kế hoạch', icon: <Info className="w-4 h-4" /> },
    { key: 'plots', label: 'Thửa đất & Rải vụ', icon: <MapPin className="w-4 h-4" /> },
    { key: 'bom', label: 'Dự toán Vật tư (BOM)', icon: <PackageCheck className="w-4 h-4" /> },
    { key: 'logs', label: 'Nhật ký Canh tác', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'harvests', label: 'Sản lượng Thu hoạch', icon: <Wheat className="w-4 h-4" /> },
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
        id="crop-season-detail-sheet"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-season-detail-title"
      >
        {/* Fixed Header */}
        <CropSeasonDrawerHeader
          season={season}
          onClose={onClose}
          onEdit={onEdit}
          onCloseSeason={onCloseSeason}
          onPrintSeason={() => setIsPrintModalOpen(true)}
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
          {activeTab === 'overview' && (
            <CropSeasonTabOverview
              season={season}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          )}
          {activeTab === 'plots' && <CropSeasonTabPlots season={season} />}
          {activeTab === 'bom' && (
            <CropSeasonTabBom
              season={season}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          )}
          {activeTab === 'logs' && <CropSeasonTabLogs season={season} />}
          {activeTab === 'harvests' && <CropSeasonTabHarvests season={season} />}
        </div>
      </div>

      {/* Print Season Plan & BOM Modal */}
      <PrintSeasonPlanModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        season={season}
        boms={boms}
      />
    </>
  );
};

export default CropSeasonDrawer;
