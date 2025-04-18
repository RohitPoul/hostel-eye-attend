
import { useState } from 'react';
import { StudentProps } from '@/types/room';

export const useCalendarState = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(currentDate);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProps | null>(null);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return {
    selectedMonth,
    selectedYear,
    selectedDate,
    viewMode,
    selectedDay,
    isStudentListOpen,
    isHolidayDialogOpen,
    isLeaveDialogOpen,
    selectedStudent,
    setSelectedMonth,
    setSelectedYear,
    setSelectedDate,
    setViewMode,
    setSelectedDay,
    setIsStudentListOpen,
    setIsHolidayDialogOpen,
    setIsLeaveDialogOpen,
    setSelectedStudent,
    handlePrevMonth,
    handleNextMonth,
  };
};
