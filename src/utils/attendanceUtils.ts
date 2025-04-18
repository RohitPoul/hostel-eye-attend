
import { supabase } from '@/integrations/supabase/client';
import { AttendanceRecord } from '@/types/room';

export const fetchAttendance = async (dateStr: string | null = null, buildingId?: string, blockId?: string, floorId?: string, roomId?: string, studentId?: string) => {
  try {
    let query = supabase
      .from('attendance')
      .select('*');
    
    if (dateStr) {
      query = query.eq('date', dateStr);
    }
    
    if (roomId) {
      query = query.eq('room_id', roomId);
    }
    
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

export const markAttendance = async (studentId: string, status: 'P' | 'A' | 'L' | 'H', date: string, roomId?: string) => {
  try {
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
      const { data, error } = await supabase
        .from('attendance')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as AttendanceRecord;
    } else {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          student_id: studentId,
          status,
          date,
          room_id: roomId,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as AttendanceRecord;
    }
  } catch (error) {
    console.error('Error in markAttendance:', error);
    throw error;
  }
};

export const markDayAsHoliday = async (date: string) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        status: 'H',
        date,
        student_id: null
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as AttendanceRecord;
  } catch (error) {
    console.error('Error in markDayAsHoliday:', error);
    throw error;
  }
};

export const getDateAttendanceStatus = async (date: string): Promise<'P' | 'A' | 'L' | 'H' | null> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', date)
      .eq('status', 'H')
      .maybeSingle();
    
    if (error) throw error;
    
    if (data && (data.status === 'H' || data.status === 'P' || data.status === 'A' || data.status === 'L')) {
      return data.status as 'P' | 'A' | 'L' | 'H';
    }
    
    return null;
  } catch (error) {
    console.error('Error in getDateAttendanceStatus:', error);
    return null;
  }
};
