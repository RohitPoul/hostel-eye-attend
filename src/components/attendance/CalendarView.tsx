
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { markAttendance, markDayAsHoliday } from '@/utils/attendanceUtils';
import { StudentProps } from '@/types/room';
import { useCalendarState } from '@/hooks/use-calendar-state';
import { useCalendarFilters } from '@/hooks/use-calendar-filters';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { AttendanceDialog } from './calendar/AttendanceDialog';
import { HolidayDialog } from './calendar/HolidayDialog';
import { LeaveDialog } from './calendar/LeaveDialog';
import { fetchBlock, fetchFloor } from '@/utils/buildingUtils';

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

const statusLabels = {
  'P': 'Present',
  'A': 'Absent',
  'L': 'Leave',
  'H': 'Holiday',
};

const CalendarView = () => {
  const { toast } = useToast();
  const calendarState = useCalendarState();
  const filters = useCalendarFilters();
  const [attendanceData, setAttendanceData] = useState<Record<string, "P" | "A" | "L" | "H">>({});

  const formatDateString = (day: number) => {
    const dateObj = new Date(calendarState.selectedYear, calendarState.selectedMonth, day);
    return dateObj.toISOString().split('T')[0];
  };

  const { data: students, refetch: refetchStudents } = useQuery({
    queryKey: ['students', filters.filterBuilding, filters.filterBlock, filters.filterFloor, filters.filterRoom],
    queryFn: async () => {
      let query = supabase.from('students').select('*');
      
      if (filters.filterBlock && filters.filterBlock !== 'all-blocks') {
        const blockData = await fetchBlock(filters.filterBlock);
        if (blockData) {
          query = query.eq('block_name', blockData.name);
        }
      }
      
      if (filters.filterFloor && filters.filterFloor !== 'all-floors') {
        const floorData = await fetchFloor(filters.filterBlock || '', filters.filterFloor);
        if (floorData) {
          query = query.eq('floor_number', floorData.floor_number);
        }
      }
      
      if (filters.filterRoom && filters.filterRoom !== 'all-rooms') {
        query = query.eq('room_id', filters.filterRoom);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: monthAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', calendarState.selectedYear, calendarState.selectedMonth, 
               filters.filterBuilding, filters.filterBlock, filters.filterFloor, filters.filterRoom],
    queryFn: async () => {
      const startDate = new Date(calendarState.selectedYear, calendarState.selectedMonth, 1);
      const endDate = new Date(calendarState.selectedYear, calendarState.selectedMonth + 1, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      let query = supabase
        .from('attendance')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr);
      
      if (filters.filterRoom && filters.filterRoom !== 'all-rooms') {
        query = query.eq('room_id', filters.filterRoom);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching attendance:', error);
        return [];
      }
      
      return data || [];
    }
  });

  const { data: selectedDayAttendance, refetch: refetchDayAttendance } = useQuery({
    queryKey: ['day-attendance', calendarState.selectedDay, calendarState.selectedMonth, calendarState.selectedYear],
    queryFn: async () => {
      if (!calendarState.selectedDay) return [];
      
      const dateString = formatDateString(calendarState.selectedDay);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', dateString);
        
      if (error) throw error;
      return data || [];
    },
    enabled: calendarState.selectedDay !== null
  });

  useEffect(() => {
    if (monthAttendance) {
      const newAttendanceData: Record<string, "P" | "A" | "L" | "H"> = {};
      
      const holidays = monthAttendance.filter(record => record.student_id === null && record.status === 'H');
      
      holidays.forEach(holiday => {
        newAttendanceData[holiday.date] = 'H';
      });
      
      const studentAttendance = monthAttendance.filter(record => record.student_id !== null);
      
      const attendanceByDate = studentAttendance.reduce((acc, record) => {
        if (!acc[record.date]) {
          acc[record.date] = [];
        }
        acc[record.date].push(record);
        return acc;
      }, {} as Record<string, any[]>);
      
      Object.entries(attendanceByDate).forEach(([date, records]) => {
        if (newAttendanceData[date] === 'H') {
          return;
        }
        
        const statusCounts = records.reduce((acc, record) => {
          const status = record.status;
          if (status === 'P' || status === 'A' || status === 'L' || status === 'H') {
            acc[status] = (acc[status] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);
        
        let maxCount = 0;
        let maxStatus: "P" | "A" | "L" | "H" = 'P';
        
        Object.entries(statusCounts).forEach(([status, count]) => {
          if (count > maxCount) {
            maxCount = count as number;
            maxStatus = status as "P" | "A" | "L" | "H";
          }
        });
        
        newAttendanceData[date] = maxStatus;
      });
      
      setAttendanceData(newAttendanceData);
    }
  }, [monthAttendance]);

  useEffect(() => {
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        () => {
          refetchAttendance();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchAttendance]);

  const handleDayClick = (day: number) => {
    calendarState.setSelectedDay(day);
    calendarState.setIsStudentListOpen(true);
  };

  const handleMarkAttendance = async (studentId: string, status: 'P' | 'A' | 'L' | 'H') => {
    if (calendarState.selectedDay) {
      const dateString = formatDateString(calendarState.selectedDay);
      
      try {
        await markAttendance(studentId, status, dateString, filters.filterRoom || undefined);
        
        toast({
          title: "Attendance Marked",
          description: `Student has been marked as ${statusLabels[status]}.`,
        });
        
        refetchAttendance();
      } catch (error) {
        console.error('Error marking attendance:', error);
        toast({
          title: "Error",
          description: "Failed to mark attendance. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMarkHoliday = async () => {
    if (calendarState.selectedDay) {
      const dateString = formatDateString(calendarState.selectedDay);
      
      try {
        await markDayAsHoliday(dateString);
        
        calendarState.setIsHolidayDialogOpen(false);
        
        toast({
          title: "Holiday Marked",
          description: `${MONTHS[calendarState.selectedMonth]} ${calendarState.selectedDay}, ${calendarState.selectedYear} has been marked as a holiday.`,
        });
        
        refetchAttendance();
      } catch (error) {
        console.error('Error marking holiday:', error);
        toast({
          title: "Error",
          description: "Failed to mark holiday. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMarkLeave = async () => {
    if (calendarState.selectedDay && calendarState.selectedStudent) {
      const dateString = formatDateString(calendarState.selectedDay);
      
      try {
        await markAttendance(calendarState.selectedStudent.id, 'L', dateString);
        
        calendarState.setIsLeaveDialogOpen(false);
        calendarState.setSelectedStudent(null);
        
        toast({
          title: "Leave Marked",
          description: `${calendarState.selectedStudent.name} has been marked on leave for ${MONTHS[calendarState.selectedMonth]} ${calendarState.selectedDay}, ${calendarState.selectedYear}.`,
        });
        
        refetchAttendance();
      } catch (error) {
        console.error('Error marking leave:', error);
        toast({
          title: "Error",
          description: "Failed to mark leave. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStudentSelect = (student: StudentProps) => {
    calendarState.setSelectedStudent(student);
    calendarState.setIsLeaveDialogOpen(true);
    calendarState.setIsStudentListOpen(false);
  };

  const getStudentAttendanceStatus = (studentId: string): "P" | "A" | "L" | "H" | "-" => {
    if (!calendarState.selectedDay || !selectedDayAttendance) return '-';
    
    const dateString = formatDateString(calendarState.selectedDay);
    const record = selectedDayAttendance.find(r => r.student_id === studentId && r.date === dateString);
    
    if (record) {
      const status = record.status;
      if (status === 'P' || status === 'A' || status === 'L' || status === 'H') {
        return status;
      }
    }
    
    return '-';
  };

  return (
    <div className="space-y-6">
      <CalendarHeader
        viewMode={calendarState.viewMode}
        selectedDate={calendarState.selectedDate}
        filters={filters}
        onViewModeChange={(mode) => calendarState.setViewMode(mode)}
        onDateSelect={(date) => {
          if (date) {
            calendarState.setSelectedDate(date);
            calendarState.setSelectedMonth(date.getMonth());
            calendarState.setSelectedYear(date.getFullYear());
          }
        }}
      />
      
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${statusColors[status as keyof typeof statusColors]} mr-2`}></div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
      
      <CalendarGrid
        selectedMonth={calendarState.selectedMonth}
        selectedYear={calendarState.selectedYear}
        onPrevMonth={calendarState.handlePrevMonth}
        onNextMonth={calendarState.handleNextMonth}
        onDayClick={handleDayClick}
        attendanceData={attendanceData}
      />

      <AttendanceDialog
        isOpen={calendarState.isStudentListOpen}
        onClose={() => calendarState.setIsStudentListOpen(false)}
        selectedDay={calendarState.selectedDay}
        selectedMonth={calendarState.selectedMonth}
        selectedYear={calendarState.selectedYear}
        students={students}
        onHolidayClick={() => {
          calendarState.setIsStudentListOpen(false);
          calendarState.setIsHolidayDialogOpen(true);
        }}
        onMarkAttendance={handleMarkAttendance}
        onStudentSelect={handleStudentSelect}
        getStudentAttendanceStatus={getStudentAttendanceStatus}
      />

      <HolidayDialog
        isOpen={calendarState.isHolidayDialogOpen}
        onClose={() => calendarState.setIsHolidayDialogOpen(false)}
        onConfirm={handleMarkHoliday}
        selectedDay={calendarState.selectedDay}
        selectedMonth={calendarState.selectedMonth}
        selectedYear={calendarState.selectedYear}
      />

      <LeaveDialog
        isOpen={calendarState.isLeaveDialogOpen}
        onClose={() => calendarState.setIsLeaveDialogOpen(false)}
        onConfirm={handleMarkLeave}
        selectedStudent={calendarState.selectedStudent}
        selectedDay={calendarState.selectedDay}
        selectedMonth={calendarState.selectedMonth}
        selectedYear={calendarState.selectedYear}
      />
    </div>
  );
};

export default CalendarView;
