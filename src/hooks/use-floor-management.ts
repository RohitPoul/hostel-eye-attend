
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchRooms } from '@/utils/roomUtils';
import { useFloorData } from './use-floor-data';
import { useFloorMutations } from './use-floor-mutations';
import { useFloorState } from './use-floor-state';

export const useFloorManagement = () => {
  const { toast } = useToast();
  const { buildingId, blockId, building, block, floorData, isLoading, getFloorName } = useFloorData();
  
  const {
    floors,
    setFloors,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    floorToDelete,
    setFloorToDelete,
    password,
    setPassword,
    isEditMode,
    setIsEditMode,
    editFloorId,
    setEditFloorId,
    editRoomCount,
    setEditRoomCount,
    handleDeleteClick,
    handleEditRoomCount,
    resetEditMode
  } = useFloorState();

  const onMutationSuccess = () => {
    setIsDeleteDialogOpen(false);
    setFloorToDelete(null);
    setPassword('');
    resetEditMode();
  };

  const { deleteFloorMutation, updateRoomCountMutation } = useFloorMutations(onMutationSuccess);

  // Update state when floor data is loaded
  useEffect(() => {
    if (floorData && floorData.length > 0) {
      const loadFloorData = async () => {
        const updatedFloors = await Promise.all(
          floorData.map(async (floor) => {
            // Fetch rooms for this floor to get the count
            // Fix: Convert floor_number to string before passing it to fetchRooms
            const rooms = await fetchRooms(blockId, floor.id);
            // Here we're using the floor's actual floor_number property for the name
            const floorName = getFloorName(floor.floor_number);
            
            return {
              id: floor.id,
              name: floorName,
              roomCount: rooms.length,
              floor_number: floor.floor_number
            };
          })
        );
        setFloors(updatedFloors);
      };
      
      loadFloorData();
    }
  }, [floorData, blockId, getFloorName]);

  const confirmDelete = () => {
    if (password !== 'admin123') {
      toast({
        title: "Invalid Password",
        description: "The confirmation password is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (floorToDelete) {
      deleteFloorMutation.mutate(floorToDelete.id);
    }
  };

  const saveRoomCount = () => {
    if (editFloorId) {
      updateRoomCountMutation.mutate({ 
        floorId: editFloorId, 
        newCount: editRoomCount,
        blockName: block?.name
      });
    }
  };

  return {
    buildingId,
    blockId,
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
    updateRoomCountMutation
  };
};
