
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchBuilding, fetchBlock, fetchRooms, formatFloorNumber } from '@/utils/roomUtils';

export interface FloorProps {
  id: string;
  name: string;
  roomCount: number;
  floor_number?: number;
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

  return {
    buildingId,
    blockId,
    building,
    block,
    floorData,
    isLoading,
    getFloorName: formatFloorNumber
  };
};
