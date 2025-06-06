
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFloorManagement } from '@/hooks/use-floor-management';
import FloorBreadcrumb from './FloorBreadcrumb';
import FloorCard from './FloorCard';
import EmptyFloorState from './EmptyFloorState';
import DeleteFloorDialog from './DeleteFloorDialog';

const FloorList = () => {
  const navigate = useNavigate();
  const { buildingId, blockId } = useParams();
  const {
    buildingId: floorBuildingId,
    blockId: floorBlockId,
    floors,
    isLoading,
    building,
    block,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    floorToDelete,
    password,
    setPassword,
    isEditMode,
    editFloorId,
    editRoomCount,
    setEditRoomCount,
    handleDeleteClick,
    confirmDelete,
    handleEditRoomCount,
    saveRoomCount,
    deleteFloorMutation,
    updateRoomCountMutation,
    updateFloorMutation
  } = useFloorManagement();

  const buildingName = building?.name || "Loading...";
  const blockName = block?.name || "Loading...";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading floors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FloorBreadcrumb 
        buildingId={buildingId}
        buildingName={buildingName}
        blockName={blockName}
        onBack={() => navigate(`/buildings/${buildingId}/blocks`)}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Floors</h2>
      </div>

      {floors.length === 0 ? (
        <EmptyFloorState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {floors.map((floor) => (
            <FloorCard
              key={floor.id}
              {...floor}
              buildingId={buildingId}
              blockId={blockId}
              isEditMode={isEditMode}
              editRoomCount={editRoomCount}
              editFloorId={editFloorId}
              onDelete={() => handleDeleteClick(floor)}
              onEditRoomCount={() => handleEditRoomCount(floor)}
              onSaveRoomCount={saveRoomCount}
              onEditRoomCountChange={setEditRoomCount}
              onUpdateFloorName={(newName) => updateFloorMutation.mutate({ floorId: floor.id, newName })}
              isPending={updateRoomCountMutation.isPending}
            />
          ))}
        </div>
      )}

      <DeleteFloorDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        floorToDelete={floorToDelete}
        onConfirmDelete={confirmDelete}
        isPending={deleteFloorMutation.isPending}
      />
    </div>
  );
};

export default FloorList;
