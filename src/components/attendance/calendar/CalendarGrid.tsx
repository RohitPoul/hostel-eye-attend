
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceRecord } from '@/types/room';

interface CalendarGridProps {
  selectedMonth: number;
  selectedYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: number) => void;
  attendanceData: Record<string, "P" | "A" | "L" | "H" | "-">;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const statusColors = {
  'P': 'bg-green-100 text-green-800',
  'A': 'bg-red-100 text-red-800',
  'L': 'bg-yellow-100 text-yellow-800',
  'H': 'bg-blue-100 text-blue-800',
  '-': 'bg-gray-100 text-gray-500'
};

export function CalendarGrid({
  selectedMonth,
  selectedYear,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  attendanceData,
}: CalendarGridProps) {
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDateString = (day: number) => {
    const dateObj = new Date(selectedYear, selectedMonth, day);
    return dateObj.toISOString().split('T')[0];
  };

  const getAttendanceForDay = (day: number) => {
    const dateString = formatDateString(day);
    return attendanceData[dateString] || '-';
  };

  const getStatusClass = (status: "P" | "A" | "L" | "H" | "-") => {
    return statusColors[status] || 'bg-gray-100 text-gray-500';
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h3 className="text-lg font-medium">
          {MONTHS[selectedMonth]} {selectedYear}
        </h3>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center font-medium p-2 text-gray-500">
            {day}
          </div>
        ))}
        
        {generateCalendarDays().map((day, index) => (
          <div
            key={index}
            className={`p-2 h-20 border rounded-md ${
              day === null ? 'bg-gray-50' : 'bg-white cursor-pointer hover:bg-gray-50'
            }`}
            onClick={() => day !== null && onDayClick(day)}
          >
            {day !== null && (
              <>
                <div className="flex justify-between items-start">
                  <span className={`text-sm ${
                    day === new Date().getDate() &&
                    selectedMonth === new Date().getMonth() &&
                    selectedYear === new Date().getFullYear()
                      ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : ''
                  }`}>
                    {day}
                  </span>
                  
                  {getAttendanceForDay(day) !== '-' && (
                    <span className={`text-xs font-bold rounded-full px-2 py-1 ${
                      getStatusClass(getAttendanceForDay(day))
                    }`}>
                      {getAttendanceForDay(day)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
