import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { markAttendance, markDayAsHoliday } from '@/utils/attendanceUtils';

export const useAttendanceData = (
  selectedYear: number,
  selectedMonth: number,
  selectedDay: number | null,
  roomId?: string
) => {
  const { toast } = useToast();
  const [attendanceData, setAttendanceData] = useState<Record<string, "P" | "A" | "L" | "H">>({});

  const formatDateString = (day: number) => {
    const dateObj = new Date(selectedYear, selectedMonth, day);
    return dateObj.toISOString().split('T')[0];
  };

  const { data: monthAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', selectedYear, selectedMonth, roomId],
    queryFn: async () => {
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      let query = supabase
        .from('attendance')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr);
      
      if (roomId) {
        query = query.eq('room_id', roomId);
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
    queryKey: ['day-attendance', selectedDay, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!selectedDay) return [];
      
      const dateString = formatDateString(selectedDay);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', dateString);
        
      if (error) throw error;
      return data || [];
    },
    enabled: selectedDay !== null
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
        if (newAttendanceData[date] === 'H') return;
        
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
            maxCount = count;
            maxStatus = status as "P" | "A" | "L" | "H";
          }
        });
        
        newAttendanceData[date] = maxStatus;
      });
      
      setAttendanceData(newAttendanceData);
    }
  }, [monthAttendance]);

  const handleMarkAttendance = async (studentId: string, status: 'P' | 'A' | 'L' | 'H', roomId?: string) => {
    if (selectedDay) {
      const dateString = formatDateString(selectedDay);
      
      try {
        await markAttendance(studentId, status, dateString, roomId);
        
        toast({
          title: "Attendance Marked",
          description: `Student has been marked as ${status === 'P' ? 'Present' : status === 'A' ? 'Absent' : status === 'L' ? 'Leave' : 'Holiday'}.`,
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
    if (selectedDay) {
      const dateString = formatDateString(selectedDay);
      
      try {
        await markDayAsHoliday(dateString);
        
        toast({
          title: "Holiday Marked",
          description: `The selected day has been marked as a holiday.`,
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

  const getStudentAttendanceStatus = (studentId: string): "P" | "A" | "L" | "H" | "-" => {
    if (!selectedDay || !selectedDayAttendance) return '-';
    
    const dateString = formatDateString(selectedDay);
    const record = selectedDayAttendance.find(r => r.student_id === studentId && r.date === dateString);
    
    if (record) {
      const status = record.status;
      if (status === 'P' || status === 'A' || status === 'L' || status === 'H') {
        return status;
      }
    }
    
    return '-';
  };

  const isHolidayAlreadyMarked = (day: number): boolean => {
    if (!attendanceData) return false;
    
    const dateString = formatDateString(selectedYear, selectedMonth, day);
    const dayData = attendanceData[dateString];
    
    if (!dayData || !dayData.isHoliday) return false;
    
    // Only consider it a holiday if roomId is provided AND matches the holidayRoomId
    if (roomId && typeof dayData.holidayRoomId === 'string') {
      return dayData.holidayRoomId === roomId;
    }
    
    // If no roomId provided, consider it a holiday if it has any holidayRoomId
    return !!dayData.holidayRoomId;
  };

  return {
    attendanceData,
    handleMarkAttendance,
    handleMarkHoliday,
    getStudentAttendanceStatus,
    refetchAttendance,
    refetchDayAttendance,
  };
};
