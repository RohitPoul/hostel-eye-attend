
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchBuilding, fetchBlock, fetchRooms } from '@/utils/roomUtils';

export interface FloorProps {
  id: string;
  name: string;
  roomCount: number;
}

export const useFloorData = () => {
  const { buildingId, blockId } = useParams();

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

  // Helper function to format floor name
  const getFloorName = (floorNumber: string) => {
    const num = parseInt(floorNumber);
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix} Floor`;
  };

  return {
    buildingId,
    blockId,
    building,
    block,
    floorData,
    isLoading,
    getFloorName
  };
};
