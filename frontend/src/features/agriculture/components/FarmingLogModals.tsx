import React from 'react';
import { X } from 'lucide-react';
import { FarmingLog } from '@/types/agriculture';
import { QuickMobileLogModal } from './QuickMobileLogModal';
import { FarmingLogDetailModal } from './FarmingLogDetailModal';
import { EditFarmingLogModal } from './EditFarmingLogModal';
import { DeleteFarmingLogModal } from './DeleteFarmingLogModal';

interface FarmingLogModalsProps {
  isLogModalOpen: boolean;
  onCloseLogModal: () => void;
  onLogCreated: () => void;
  selectedSeasonId?: string;

  selectedLogForDetailModal: FarmingLog | null;
  onCloseDetailModal: () => void;
  onOpenEditFromDetail: (log: FarmingLog) => void;
  onOpenDeleteFromDetail: (log: FarmingLog) => void;
  onVerifyLog?: (log: FarmingLog) => void;
  onRejectLog?: (log: FarmingLog) => void;

  selectedLogForEdit: FarmingLog | null;
  onCloseEditModal: () => void;
  onLogUpdated: () => void;

  logToDelete: FarmingLog | null;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;

  selectedPhoto: string | null;
  onClosePhoto: () => void;
}

export const FarmingLogModals: React.FC<FarmingLogModalsProps> = ({
  isLogModalOpen,
  onCloseLogModal,
  onLogCreated,
  selectedSeasonId,
  selectedLogForDetailModal,
  onCloseDetailModal,
  onOpenEditFromDetail,
  onOpenDeleteFromDetail,
  onVerifyLog,
  onRejectLog,
  selectedLogForEdit,
  onCloseEditModal,
  onLogUpdated,
  logToDelete,
  onCloseDeleteModal,
  onConfirmDelete,
  isDeleting,
  selectedPhoto,
  onClosePhoto,
}) => {
  return (
    <>
      <QuickMobileLogModal
        isOpen={isLogModalOpen}
        onClose={onCloseLogModal}
        onSuccess={onLogCreated}
        preselectedSeasonId={selectedSeasonId}
      />

      <FarmingLogDetailModal
        log={selectedLogForDetailModal}
        isOpen={!!selectedLogForDetailModal}
        onClose={onCloseDetailModal}
        onEdit={onOpenEditFromDetail}
        onDelete={onOpenDeleteFromDetail}
        onVerify={onVerifyLog}
        onReject={onRejectLog}
      />

      <EditFarmingLogModal
        log={selectedLogForEdit}
        isOpen={!!selectedLogForEdit}
        onClose={onCloseEditModal}
        onSuccess={onLogUpdated}
      />

      <DeleteFarmingLogModal
        log={logToDelete}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in"
          onClick={onClosePhoto}
        >
          <div className="relative max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              onClick={onClosePhoto}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/90 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={selectedPhoto} alt="Minh chứng chi tiết" className="max-h-[80vh] w-auto" />
          </div>
        </div>
      )}
    </>
  );
};
