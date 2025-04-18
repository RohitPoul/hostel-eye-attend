
import { supabase } from '@/integrations/supabase/client';
import { fetchFloor } from './buildingUtils';

export const fetchStudents = async (blockId: string | undefined, floorId: string | undefined, blockName: string | undefined) => {
  if (!blockId || !floorId) return [];
  
  try {
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
