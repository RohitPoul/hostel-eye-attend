
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FloorProps } from './use-floor-data';

export const useFloorMutations = (onSuccessCallback?: () => void) => {
  const { blockId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete floor mutation
  const deleteFloorMutation = useMutation({
    mutationFn: async (floorId: string) => {
      // First, delete all rooms associated with this floor
      const { data: floorObj } = await supabase
        .from('floors')
        .select('*')
        .eq('id', floorId)
        .single();
      
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
        description: "Floor has been removed successfully.",
      });
      
      if (onSuccessCallback) onSuccessCallback();
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

  // Update room count mutation
  const updateRoomCountMutation = useMutation({
    mutationFn: async ({ floorId, newCount, blockName }: { floorId: string, newCount: number, blockName?: string }) => {
      const { data: floorObj, error: floorError } = await supabase
        .from('floors')
        .select('*')
        .eq('id', floorId)
        .single();
      
      if (floorError || !floorObj) throw new Error('Floor not found');
      
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
        const blockPrefix = blockName?.replace('Block ', '') || '';
        
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
      
      toast({
        title: "Room Count Updated",
        description: `Room count has been updated to ${data.roomCount}.`,
      });
      
      if (onSuccessCallback) onSuccessCallback();
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

  return {
    deleteFloorMutation,
    updateRoomCountMutation
  };
};
