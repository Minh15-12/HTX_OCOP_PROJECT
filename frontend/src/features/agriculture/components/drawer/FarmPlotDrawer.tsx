import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  BookOpen,
  Award,
  Layers,
} from 'lucide-react';
import { FarmPlot, ProductionUnit, fetchPlotMemberAssignments } from '@/services/farmPlotApi';
import { useQuery } from '@tanstack/react-query';
import { FarmPlotDrawerHeader } from './FarmPlotDrawerHeader';
import { FarmPlotTabOverview } from './tabs/FarmPlotTabOverview';
import { FarmPlotTabAssignments } from './tabs/FarmPlotTabAssignments';
import { FarmPlotTabLogs } from './tabs/FarmPlotTabLogs';
export type FarmPlotDrawerTab = 'overview' | 'assignments' | 'logs';

interface FarmPlotDrawerProps {
  plot: FarmPlot | null;
  unit?: ProductionUnit | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (plot: FarmPlot) => void;
  onAssign?: (plot: FarmPlot) => void;
}

export const FarmPlotDrawer: React.FC<FarmPlotDrawerProps> = ({
  plot,
  unit,
  isOpen,
  onClose,
  onEdit,
  onAssign,
}) => {
  const [activeTab, setActiveTab] = useState<FarmPlotDrawerTab>('overview');

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset tab when plot changes
  useEffect(() => {
    if (plot) {
      setActiveTab('overview');
    }
  }, [plot?.id]);

  // Query assigned count for header
  const { data: assignments = [] } = useQuery({
    queryKey: ['plotAssignments', plot?.id],
    queryFn: () => (plot?.id ? fetchPlotMemberAssignments(plot.id) : Promise.resolve([])),
    enabled: !!plot?.id && isOpen,
  });

  if (!isOpen || !plot) return null;

  const tabs: { id: FarmPlotDrawerTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Tổng quan & Pháp lý', icon: MapPin },
    { id: 'assignments', label: `Xã viên (${assignments.length})`, icon: Users },
    { id: 'logs', label: 'Nhật ký canh tác', icon: BookOpen },
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
          <FarmPlotDrawerHeader
            plot={plot}
            unit={unit}
            assignedCount={assignments.length}
            onClose={onClose}
            onEdit={onEdit}
            onAssign={onAssign}
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
            {activeTab === 'overview' && <FarmPlotTabOverview plot={plot} unit={unit} />}
            {activeTab === 'assignments' && (
              <FarmPlotTabAssignments plot={plot} onOpenAssignments={onAssign} />
            )}
            {activeTab === 'logs' && <FarmPlotTabLogs plot={plot} />}
          </div>
        </div>
      </div>
    </div>
  );
};
