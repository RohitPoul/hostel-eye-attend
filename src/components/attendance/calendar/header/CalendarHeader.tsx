
import { DateSelector } from './DateSelector';
import { CalendarFilters } from '../filters/CalendarFilters';
import { ViewModeSelect } from './ViewModeSelect';
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
  onDateSelect
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pb-4 border-b">
      <ViewModeSelect
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
      
      <div className="flex items-center space-x-4">
        <DateSelector 
          selectedDate={selectedDate} 
          onDateSelect={onDateSelect} 
        />
        
        <CalendarFilters filters={filters} />
      </div>
    </div>
  );
}
