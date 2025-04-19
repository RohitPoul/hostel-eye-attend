
import { useCalendarFilters } from '@/hooks/use-calendar-filters';
import { CalendarFilters } from './filters/CalendarFilters';
import { ViewModeSelect } from './header/ViewModeSelect';
import { DateSelector } from './header/DateSelector';

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
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h2 className="text-xl font-semibold">Attendance Records</h2>
        <p className="text-gray-500">View and filter attendance history</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <ViewModeSelect viewMode={viewMode} onViewModeChange={onViewModeChange} />
        <CalendarFilters filters={filters} />
        <DateSelector selectedDate={selectedDate} onDateSelect={onDateSelect} />
      </div>
    </div>
  );
}
