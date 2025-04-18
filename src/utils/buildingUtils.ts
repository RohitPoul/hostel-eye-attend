
import { supabase } from '@/integrations/supabase/client';
import { BuildingData, BlockData, FloorData } from '@/types/room';

export const fetchBuilding = async (buildingId: string | undefined): Promise<BuildingData | null> => {
  if (!buildingId) return null;
  
  const { data, error } = await supabase
    .from('buildings')
    .select('id, name')
    .eq('id', buildingId)
    .single();
  
  if (error) {
    console.error('Error fetching building:', error);
    throw error;
  }
  
  return data as BuildingData;
};

export const fetchBlock = async (blockId: string | undefined): Promise<BlockData | null> => {
  if (!blockId) return null;
  
  const { data, error } = await supabase
    .from('blocks')
    .select('id, name, building_id')
    .eq('id', blockId)
    .single();
  
  if (error) {
    console.error('Error fetching block:', error);
    throw error;
  }
  
  return data as BlockData;
};

export const fetchFloor = async (blockId: string | undefined, floorId: string | undefined): Promise<FloorData | null> => {
  if (!blockId || !floorId) return null;
  
  const { data, error } = await supabase
    .from('floors')
    .select('id, block_id, floor_number')
    .eq('block_id', blockId)
    .eq('id', floorId)
    .single();
  
  if (error) {
    console.error('Error fetching floor:', error);
    return null;
  }
  
  return data as FloorData;
};
