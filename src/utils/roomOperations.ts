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

export const updateRoomName = async (roomId: string, newName: string) => {
  try {
    // Get the current room data first
    const { data: room, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching room:', fetchError);
      throw fetchError;
    }
    
    // Update only the name field, keeping all other fields intact
    const { data, error } = await supabase
      .from('rooms')
      .update({ name: newName })
      .eq('id', roomId)
      .select();
    
    if (error) {
      console.error('Error updating room name:', error);
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error in updateRoomName:', error);
    throw error;
  }
};
