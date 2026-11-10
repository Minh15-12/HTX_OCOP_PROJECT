import React from 'react';
import { ProductionUnit, ProductionUnitPayload, FarmPlot, MemberAssignment } from '@/services/farmPlotApi';
import { Member } from '@/types/memberTypes';
import { ProductionUnitModal } from './ProductionUnitModal';
import { AddFarmPlotModal } from './AddFarmPlotModal';
import { EditFarmPlotModal } from './EditFarmPlotModal';
import { PlotAssignmentModal } from './PlotAssignmentModal';
import { DeletePlotModal } from './DeletePlotModal';
import { FarmPlotDrawer } from './drawer/FarmPlotDrawer';

interface FarmPlotModalsProps {
  units: ProductionUnit[];
  selectedUnit: ProductionUnit | null;
  unitModalOpen: boolean;
  editingUnit: ProductionUnit | null;
  onCloseUnitModal: () => void;
  onSaveUnit: (payload: ProductionUnitPayload, id?: string) => Promise<void>;
  isSavingUnit: boolean;

  addPlotModalOpen: boolean;
  onCloseAddPlotModal: () => void;
  onAddPlot: (plotData: {
    unit_id?: string;
    plot_code: string;
    area: number;
    status?: string;
    safe_harvest_date?: string | null;
    gps_coordinates?: string | null;
    national_cadastral_code?: string | null;
    land_sheet_number?: string | null;
    land_parcel_number?: string | null;
    greenhouse_type?: string | null;
    substrate_bag_count?: number | null;
    planting_density_per_sqm?: number | null;
    geometry_geojson?: any;
    vn2000_coordinates?: any;
    max_yield_rate_per_sqm?: number | null;
  }) => Promise<void>;
  isAddingPlot: boolean;

  editingPlot: FarmPlot | null;
  onCloseEditPlot: () => void;
  onPlotEdited: () => void;

  selectedPlotForAssignments: FarmPlot | null;
  members: Member[];
  assignments: MemberAssignment[];
  assignmentsLoading: boolean;
  onCloseAssignments: () => void;
  onAssignMember: (memberId: string, role: string) => Promise<void>;

  plotToDelete: FarmPlot | null;
  onCloseDeletePlot: () => void;
  onConfirmDeletePlot: () => Promise<void>;
  isDeletingPlot: boolean;

  selectedPlotForDrawer: FarmPlot | null;
  onCloseDrawer: () => void;
  onEditFromDrawer: (plot: FarmPlot) => void;
  onAssignFromDrawer: (plot: FarmPlot) => void;
}

export const FarmPlotModals: React.FC<FarmPlotModalsProps> = ({
  units,
  selectedUnit,
  unitModalOpen,
  editingUnit,
  onCloseUnitModal,
  onSaveUnit,
  isSavingUnit,
  addPlotModalOpen,
  onCloseAddPlotModal,
  onAddPlot,
  isAddingPlot,
  editingPlot,
  onCloseEditPlot,
  onPlotEdited,
  selectedPlotForAssignments,
  members,
  assignments,
  assignmentsLoading,
  onCloseAssignments,
  onAssignMember,
  plotToDelete,
  onCloseDeletePlot,
  onConfirmDeletePlot,
  isDeletingPlot,
  selectedPlotForDrawer,
  onCloseDrawer,
  onEditFromDrawer,
  onAssignFromDrawer,
}) => {
  const currentEditingParentUnit = editingPlot
    ? units.find((u) => u.id === editingPlot.production_unit_id) || selectedUnit
    : selectedUnit;
  const parentBoundary =
    currentEditingParentUnit?.location?.polygon_coordinates ||
    currentEditingParentUnit?.location?.polygon ||
    [];

  return (
    <>
      <FarmPlotDrawer
        plot={selectedPlotForDrawer}
        unit={selectedUnit || (selectedPlotForDrawer ? units.find((u) => u.id === selectedPlotForDrawer.production_unit_id) || null : null)}
        isOpen={!!selectedPlotForDrawer}
        onClose={onCloseDrawer}
        onEdit={onEditFromDrawer}
        onAssign={onAssignFromDrawer}
      />

      <ProductionUnitModal
        isOpen={unitModalOpen}
        unitToEdit={editingUnit}
        onClose={onCloseUnitModal}
        onSubmit={onSaveUnit}
        isSubmitting={isSavingUnit}
      />

      <AddFarmPlotModal
        isOpen={addPlotModalOpen}
        units={units}
        selectedUnit={selectedUnit}
        onClose={onCloseAddPlotModal}
        onSubmit={onAddPlot}
        isSubmitting={isAddingPlot}
      />

      <EditFarmPlotModal
        isOpen={!!editingPlot}
        plot={editingPlot}
        unitId={editingPlot?.production_unit_id || selectedUnit?.id || ''}
        onClose={onCloseEditPlot}
        onSuccess={onPlotEdited}
        parentPolygon={parentBoundary}
      />

      <PlotAssignmentModal
        plot={selectedPlotForAssignments}
        members={members}
        assignments={assignments}
        assignmentsLoading={assignmentsLoading}
        onClose={onCloseAssignments}
        onAssign={onAssignMember}
      />

      <DeletePlotModal
        plot={plotToDelete}
        selectedUnit={selectedUnit || (plotToDelete ? units.find((u) => u.id === plotToDelete.production_unit_id) || null : null)}
        onClose={onCloseDeletePlot}
        onConfirm={onConfirmDeletePlot}
        isDeleting={isDeletingPlot}
      />
    </>
  );
};
