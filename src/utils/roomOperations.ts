
import { supabase } from '@/integrations/supabase/client';
import { RoomProps } from '@/types/room';

export const fetchRooms = async (blockId: string | undefined, floorId: string | undefined): Promise<RoomProps[]> => {
  if (!blockId || !floorId) return [];
  
  try {
    const { data: floorData, error: floorError } = await supabase
      .from('floors')
      .select('*')
      .eq('id', floorId)
      .single();
    
    if (floorError || !floorData) {
      console.error('Error fetching floor data:', floorError);
      return [];
    }
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('block_id', blockId)
      .eq('floor_id', floorData.floor_number);
    
    if (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
    
    console.log('Rooms fetched:', data);
    return data as RoomProps[];
  } catch (error) {
    console.error('Error in fetchRooms:', error);
    return [];
  }
};

export const deleteRoomById = async (roomId: string) => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId);
  
  if (error) throw error;
  return roomId;
};
