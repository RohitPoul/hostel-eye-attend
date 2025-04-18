
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

export interface AttendanceRecord {
  id: string;
  student_id: string;
  status: 'P' | 'A' | 'L' | 'H';
  date: string;
  room_id?: string;
  created_at: string;
  updated_at: string;
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
    .eq('id', floorId)
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
  
  try {
    // First get the floor information
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

// Fetch students for a specific block and floor
export const fetchStudents = async (blockId: string | undefined, floorId: string | undefined, blockName: string | undefined) => {
  if (!blockId || !floorId) return [];
  
  try {
    // First get the floor information to get the floor_number
    const floor = await fetchFloor(blockId, floorId);
    if (!floor) return [];
    
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('block_name', blockName || '')
      .eq('floor_number', floor.floor_number);
    
    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchStudents:', error);
    return [];
  }
};

// Fetch attendance for a specific date or date range
export const fetchAttendance = async (dateStr: string | null = null, buildingId?: string, blockId?: string, floorId?: string, roomId?: string, studentId?: string) => {
  try {
    let query = supabase
      .from('attendance')
      .select('*');
    
    // Add date filter if provided
    if (dateStr) {
      query = query.eq('date', dateStr);
    }
    
    // Add room filter if provided
    if (roomId) {
      query = query.eq('room_id', roomId);
    }
    
    // Add student filter if provided
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
    
    return data as AttendanceRecord[];
  } catch (error) {
    console.error('Error in fetchAttendance:', error);
    return [];
  }
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
export const getFloorName = (floorId: string | undefined) => {
  if (!floorId) return '';
  
  // This function now expects the floor ID, not the floor number
  // We'll need to extract the floor number from the database
  return "Floor"; // Default fallback
};

// New helper function to get floor number and format it
export const formatFloorNumber = (floorNumber: number | undefined | null) => {
  if (floorNumber === undefined || floorNumber === null) return '';
  
  const num = parseInt(floorNumber.toString());
  if (isNaN(num)) return ''; // Return empty string if not a valid number
  
  const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
  return `${num}${suffix} Floor`;
};

// Mark attendance for a specific student
export const markAttendance = async (studentId: string, status: 'P' | 'A' | 'L' | 'H', date: string, roomId?: string) => {
  try {
    // Check if there's already an attendance record for this student on this date
    const { data: existingRecord, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', date)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing attendance:', fetchError);
      throw fetchError;
    }
    
    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabase
        .from('attendance')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating attendance:', error);
        throw error;
      }
      
      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('attendance')
        .insert([{ 
          student_id: studentId, 
          status, 
          date, 
          room_id: roomId 
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting attendance:', error);
        throw error;
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error in markAttendance:', error);
    throw error;
  }
};

// Mark day as holiday
export const markDayAsHoliday = async (date: string) => {
  try {
    // For holidays, we create a special record with null student_id
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ 
        student_id: null, 
        status: 'H', 
        date
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error marking holiday:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in markDayAsHoliday:', error);
    throw error;
  }
};

// Get attendance status for a specific date
export const getDateAttendanceStatus = async (date: string): Promise<'P' | 'A' | 'L' | 'H' | null> => {
  try {
    // First check if it's a holiday
    const { data: holidayData, error: holidayError } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date)
      .eq('status', 'H')
      .maybeSingle();
    
    if (holidayError && holidayError.code !== 'PGRST116') {
      console.error('Error checking holiday:', holidayError);
    }
    
    if (holidayData) {
      return 'H';
    }
    
    // Not a holiday, default to null
    return null;
  } catch (error) {
    console.error('Error in getDateAttendanceStatus:', error);
    return null;
  }
};
