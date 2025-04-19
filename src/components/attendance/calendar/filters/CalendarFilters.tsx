
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';
import { useCalendarFilters } from '@/hooks/use-calendar-filters';
import { useFilterQueries } from '@/hooks/use-filter-queries';
import { FilterSelect } from './FilterSelect';
import { formatFloorNumber } from '@/utils/formatUtils';

export const CalendarFilters = ({ filters }: { filters: ReturnType<typeof useCalendarFilters> }) => {
  const { buildings, blocks, floors, rooms, students } = useFilterQueries(filters);

  return (
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
          
          <FilterSelect
            label="Building"
            value={filters.filterBuilding}
            onValueChange={filters.setFilterBuilding}
            placeholder="All Buildings"
            options={buildings || []}
            allOptionLabel="All Buildings"
          />
          
          <FilterSelect
            label="Block"
            value={filters.filterBlock}
            onValueChange={filters.setFilterBlock}
            placeholder="All Blocks"
            options={blocks || []}
            allOptionLabel="All Blocks"
          />
          
          <FilterSelect
            label="Floor"
            value={filters.filterFloor}
            onValueChange={filters.setFilterFloor}
            placeholder="All Floors"
            options={(floors || []).map(floor => ({
              id: floor.id,
              name: formatFloorNumber(floor.floor_number)
            }))}
            allOptionLabel="All Floors"
          />
          
          <FilterSelect
            label="Room"
            value={filters.filterRoom}
            onValueChange={filters.setFilterRoom}
            placeholder="All Rooms"
            options={rooms || []}
            allOptionLabel="All Rooms"
          />
          
          <FilterSelect
            label="Student"
            value={filters.filterStudent}
            onValueChange={filters.setFilterStudent}
            placeholder="All Students"
            options={students || []}
            allOptionLabel="All Students"
          />
          
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
  );
};
