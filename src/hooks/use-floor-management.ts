
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchBuilding, fetchBlock, fetchRooms } from '@/utils/roomUtils';

interface FloorProps {
  id: string;
  name: string;
  roomCount: number;
}

export const useFloorManagement = () => {
  const { buildingId, blockId } = useParams();
  const [floors, setFloors] = useState<FloorProps[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<FloorProps | null>(null);
  const [password, setPassword] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFloorId, setEditFloorId] = useState<string | null>(null); // Ensures this is a string or null
  const [editRoomCount, setEditRoomCount] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch building data
  const { data: building } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: () => fetchBuilding(buildingId),
    enabled: !!buildingId,
  });

  // Fetch block data
  const { data: block } = useQuery({
    queryKey: ['block', blockId],
    queryFn: () => fetchBlock(blockId),
    enabled: !!blockId,
  });

  // Fetch floors for the current block
  const { data: floorData, isLoading } = useQuery({
    queryKey: ['floors', blockId],
    queryFn: async () => {
      if (!blockId) return [];
      
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .eq('block_id', blockId)
        .order('floor_number');
      
      if (error) {
        console.error('Error fetching floors:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!blockId,
  });

  // Update state when floor data is loaded
  useEffect(() => {
    if (floorData && floorData.length > 0) {
      const loadFloorData = async () => {
        const updatedFloors = await Promise.all(
          floorData.map(async (floor) => {
            // Fetch rooms for this floor to get the count
            const rooms = await fetchRooms(blockId, floor.floor_number.toString());
            const floorName = getFloorName(floor.floor_number.toString());
            
            return {
              id: floor.id,
              name: floorName,
              roomCount: rooms.length
            };
          })
        );
        setFloors(updatedFloors);
      };
      
      loadFloorData();
    }
  }, [floorData, blockId]);

  // Helper function to format floor name
  const getFloorName = (floorNumber: string) => {
    const num = parseInt(floorNumber);
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix} Floor`;
  };

  const handleDeleteClick = (floor: FloorProps) => {
    setFloorToDelete(floor);
    setPassword('');
    setIsDeleteDialogOpen(true);
  };

  // Delete floor mutation
  const deleteFloorMutation = useMutation({
    mutationFn: async (floorId: string) => {
      // First, delete all rooms associated with this floor
      const floorObj = floorData?.find(f => f.id === floorId);
      if (!floorObj) throw new Error('Floor not found');
      
      const { error: roomsError } = await supabase
        .from('rooms')
        .delete()
        .eq('block_id', blockId || '')
        .eq('floor_id', floorObj.floor_number);
      
      if (roomsError) throw roomsError;
      
      // Then delete the floor
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', floorId);
      
      if (error) throw error;
      
      return floorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors', blockId] });
      
      toast({
        title: "Floor Deleted",
        description: `${floorToDelete?.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setFloorToDelete(null);
      setPassword('');
    },
    onError: (error) => {
      console.error('Error deleting floor:', error);
      toast({
        title: "Error",
        description: "Failed to delete floor. Please try again.",
        variant: "destructive",
      });
    }
  });

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

  const handleEditRoomCount = (floor: FloorProps) => {
    setEditFloorId(floor.id); // Set as string
    setEditRoomCount(floor.roomCount);
    setIsEditMode(true);
  };

  const updateRoomCountMutation = useMutation({
    mutationFn: async ({ floorId, newCount }: { floorId: string, newCount: number }) => {
      const floorObj = floorData?.find(f => f.id === floorId);
      if (!floorObj) throw new Error('Floor not found');
      
      const floorNumber = floorObj.floor_number;
      
      // Get current rooms
      const { data: currentRooms, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .eq('block_id', blockId || '')
        .eq('floor_id', floorNumber);
      
      if (fetchError) throw fetchError;
      
      const currentCount = currentRooms?.length || 0;
      
      if (newCount > currentCount) {
        // Add more rooms
        const roomsToAdd = newCount - currentCount;
        const blockPrefix = block?.name.replace('Block ', '') || '';
        
        const newRooms = Array.from({ length: roomsToAdd }).map((_, i) => ({
          name: `${blockPrefix}-${floorNumber}${String(currentCount + i + 1).padStart(2, '0')}`,
          floor_id: floorNumber,
          block_id: blockId
        }));
        
        const { error: addError } = await supabase
          .from('rooms')
          .insert(newRooms);
        
        if (addError) throw addError;
      } else if (newCount < currentCount) {
        // Remove excess rooms (remove from the end)
        const roomsToDelete = currentRooms?.slice(newCount);
        
        if (roomsToDelete && roomsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('rooms')
            .delete()
            .in('id', roomsToDelete.map(r => r.id));
          
          if (deleteError) throw deleteError;
        }
      }
      
      return { floorId, roomCount: newCount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', blockId] });
      queryClient.invalidateQueries({ queryKey: ['floors', blockId] });
      
      const updatedFloors = floors.map(floor => 
        floor.id === data.floorId 
          ? { ...floor, roomCount: data.roomCount } 
          : floor
      );
      setFloors(updatedFloors);
      
      toast({
        title: "Room Count Updated",
        description: `Room count has been updated to ${data.roomCount}.`,
      });
      
      setIsEditMode(false);
      setEditFloorId(null);
    },
    onError: (error) => {
      console.error('Error updating room count:', error);
      toast({
        title: "Error",
        description: "Failed to update room count. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveRoomCount = () => {
    if (editFloorId) {
      updateRoomCountMutation.mutate({ 
        floorId: editFloorId, 
        newCount: editRoomCount 
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
    editFloorId, // Return as string | null
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
