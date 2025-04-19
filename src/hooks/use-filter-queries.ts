
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCalendarFilters } from './use-calendar-filters';

export const useFilterQueries = (filters: ReturnType<typeof useCalendarFilters>) => {
  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: blocks } = useQuery({
    queryKey: ['blocks', filters.filterBuilding],
    queryFn: async () => {
      if (!filters.filterBuilding) return [];
      const { data, error } = await supabase
        .from('blocks')
        .select('id, name, building_id')
        .eq('building_id', filters.filterBuilding);
      if (error) throw error;
      return data || [];
    },
    enabled: !!filters.filterBuilding && filters.filterBuilding !== 'all-buildings'
  });

  const { data: floors } = useQuery({
    queryKey: ['floors', filters.filterBlock],
    queryFn: async () => {
      if (!filters.filterBlock) return [];
      const { data, error } = await supabase
        .from('floors')
        .select('id, block_id, floor_number')
        .eq('block_id', filters.filterBlock);
      if (error) throw error;
      return data || [];
    },
    enabled: !!filters.filterBlock && filters.filterBlock !== 'all-blocks'
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms', filters.filterBlock, filters.filterFloor],
    queryFn: async () => {
      if (!filters.filterBlock || !filters.filterFloor) return [];
      const { data: floorData } = await supabase
        .from('floors')
        .select('floor_number')
        .eq('id', filters.filterFloor)
        .single();
      if (!floorData) return [];
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, block_id, floor_id')
        .eq('block_id', filters.filterBlock)
        .eq('floor_id', floorData.floor_number);
      if (error) throw error;
      return data || [];
    },
    enabled: !!filters.filterBlock && !!filters.filterFloor && 
      filters.filterBlock !== 'all-blocks' && filters.filterFloor !== 'all-floors'
  });

  const { data: students } = useQuery({
    queryKey: ['students', filters.filterBlock, filters.filterFloor, filters.filterRoom],
    queryFn: async () => {
      let query = supabase.from('students').select('id, name');
      
      if (filters.filterRoom) {
        query = query.eq('room_id', filters.filterRoom);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!(filters.filterBlock && filters.filterFloor)
  });

  return { buildings, blocks, floors, rooms, students };
};
