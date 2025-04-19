
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchBlock, fetchFloor } from '@/utils/buildingUtils';
import { StudentProps } from '@/types/room';
import { useCalendarState } from '@/hooks/use-calendar-state';
import { useCalendarFilters } from '@/hooks/use-calendar-filters';
import { useAttendanceData } from '@/hooks/use-attendance-data';
import { CalendarHeaderTop } from './calendar/CalendarHeader';
import { CalendarHeader } from './calendar/header/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { AttendanceDialog } from './calendar/AttendanceDialog';
import { HolidayDialog } from './calendar/HolidayDialog';
import { LeaveDialog } from './calendar/LeaveDialog';
import { HolidayPeriodDialog } from './calendar/HolidayPeriodDialog';
import { AttendanceLegend } from './calendar/AttendanceLegend';

const CalendarView = () => {
  const calendarState = useCalendarState();
  const filters = useCalendarFilters();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isHolidayPeriodOpen, setIsHolidayPeriodOpen] = useState(false);

  const { data: students } = useQuery({
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

  const {
    attendanceData,
    handleMarkAttendance,
    handleMarkHoliday,
    getStudentAttendanceStatus,
    refetchAttendance,
    refetchDayAttendance,
  } = useAttendanceData(
    calendarState.selectedYear,
    calendarState.selectedMonth,
    calendarState.selectedDay,
    filters.filterRoom
  );

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

  const handleStudentSelect = (student: StudentProps) => {
    calendarState.setSelectedStudent(student);
    calendarState.setIsLeaveDialogOpen(true);
    calendarState.setIsStudentListOpen(false);
  };

  const handleStudentFilter = (studentId: string) => {
    setSelectedStudentId(studentId === 'all-students' ? null : studentId);
  };

  const handleMarkLeave = async () => {
    if (calendarState.selectedDay && calendarState.selectedStudent) {
      await handleMarkAttendance(calendarState.selectedStudent.id, 'L');
      calendarState.setIsLeaveDialogOpen(false);
      calendarState.setSelectedStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      <CalendarHeaderTop
        selectedStudentId={selectedStudentId}
        onStudentFilter={handleStudentFilter}
        onHolidayPeriodClick={() => setIsHolidayPeriodOpen(true)}
        students={students}
      />

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
      
      <AttendanceLegend />
      
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
        students={students?.filter(s => !selectedStudentId || s.id === selectedStudentId)}
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

      <HolidayPeriodDialog
        isOpen={isHolidayPeriodOpen}
        onClose={() => setIsHolidayPeriodOpen(false)}
        onSuccess={() => {
          refetchAttendance();
          refetchDayAttendance();
        }}
      />
    </div>
  );
};

export default CalendarView;
