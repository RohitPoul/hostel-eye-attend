
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatFloorNumber } from '@/utils/formatUtils';
import { cn } from '@/lib/utils';
import { useCalendarFilters } from '@/hooks/use-calendar-filters';

interface CalendarHeaderProps {
  viewMode: 'daily' | 'weekly' | 'monthly';
  selectedDate?: Date;
  filters: ReturnType<typeof useCalendarFilters>;
  onViewModeChange: (mode: 'daily' | 'weekly' | 'monthly') => void;
  onDateSelect: (date: Date | undefined) => void;
}

export function CalendarHeader({
  viewMode,
  selectedDate,
  filters,
  onViewModeChange,
  onDateSelect,
}: CalendarHeaderProps) {
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

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h2 className="text-xl font-semibold">Attendance Records</h2>
        <p className="text-gray-500">View and filter attendance history</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Select value={viewMode} onValueChange={onViewModeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="View Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Attendance Records</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Building</label>
                <Select value={filters.filterBuilding || "all-buildings"} onValueChange={filters.setFilterBuilding}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Buildings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-buildings">All Buildings</SelectItem>
                    {buildings?.map(building => (
                      <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Block</label>
                <Select value={filters.filterBlock || "all-blocks"} onValueChange={filters.setFilterBlock}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Blocks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-blocks">All Blocks</SelectItem>
                    {blocks?.map(block => (
                      <SelectItem key={block.id} value={block.id}>{block.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Floor</label>
                <Select value={filters.filterFloor || "all-floors"} onValueChange={filters.setFilterFloor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Floors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-floors">All Floors</SelectItem>
                    {floors?.map(floor => (
                      <SelectItem key={floor.id} value={floor.id}>
                        {formatFloorNumber(floor.floor_number)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Room</label>
                <Select value={filters.filterRoom || "all-rooms"} onValueChange={filters.setFilterRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-rooms">All Rooms</SelectItem>
                    {rooms?.map(room => (
                      <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={filters.resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Select Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              initialFocus
              className={cn("pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
