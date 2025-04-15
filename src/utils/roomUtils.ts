
import { supabase } from '@/integrations/supabase/client';

export interface RoomProps {
  id: string;
  name: string;
  floor_id: number;
  block_id: string;
  created_at: string;
  updated_at: string;
  students?: StudentProps[];
}

export interface StudentProps {
  id: string;
  name: string;
  registration_no: string;
  photo_url: string | null;
  phone_number: string;
}

export interface BuildingData {
  id: string;
  name: string;
}

export interface BlockData {
  id: string;
  name: string;
  building_id: string;
}

export interface FloorData {
  id: string;
  block_id: string;
  floor_number: number;
}

// Fetch building data
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

// Fetch block data
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

// Fetch floor data
export const fetchFloor = async (blockId: string | undefined, floorId: string | undefined): Promise<FloorData | null> => {
  if (!blockId || !floorId) return null;
  
  const { data, error } = await supabase
    .from('floors')
    .select('id, block_id, floor_number')
    .eq('block_id', blockId)
    .eq('floor_number', parseInt(floorId))
    .single();
  
  if (error) {
    console.error('Error fetching floor:', error);
    return null; // Return null instead of throwing to handle case where floor doesn't exist yet
  }
  
  return data as FloorData;
};

// Fetch rooms for the current floor
export const fetchRooms = async (blockId: string | undefined, floorId: string | undefined): Promise<RoomProps[]> => {
  if (!blockId || !floorId) return [];
  
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('block_id', blockId)
    .eq('floor_id', parseInt(floorId));
  
  if (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
  
  return data as RoomProps[];
};

// Fetch students for a specific block and floor
export const fetchStudents = async (blockId: string | undefined, floorId: string | undefined, blockName: string | undefined) => {
  if (!blockId || !floorId) return [];
  
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('block_name', blockName || '')
    .eq('floor_number', parseInt(floorId));
  
  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  
  return data;
};

// Delete room function
export const deleteRoomById = async (roomId: string) => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId);
  
  if (error) throw error;
  return roomId;
};

// Format floor name helper
export const getFloorName = (floorNumber: string | undefined) => {
  if (!floorNumber) return '';
  
  const num = parseInt(floorNumber);
  const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
  return `${num}${suffix} Floor`;
};
