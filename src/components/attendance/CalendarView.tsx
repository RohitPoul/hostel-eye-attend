import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, User, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchBuilding, 
  fetchBlock, 
  fetchFloor, 
  fetchStudents, 
  markAttendance, 
  markDayAsHoliday,
  fetchAttendance,
  getDateAttendanceStatus,
  AttendanceRecord,
  StudentProps,
  formatFloorNumber
} from '@/utils/roomUtils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type AttendanceStatus = 'P' | 'A' | 'L' | 'H';

const statusColors = {
  'P': 'bg-green-100 text-green-800',
  'A': 'bg-red-100 text-red-800',
  'L': 'bg-yellow-100 text-yellow-800',
  'H': 'bg-blue-100 text-blue-800',
};

const statusLabels = {
  'P': 'Present',
  'A': 'Absent',
  'L': 'Leave',
  'H': 'Holiday',
};

const CalendarView = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(currentDate);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [filterBuilding, setFilterBuilding] = useState<string | null>(null);
  const [filterBlock, setFilterBlock] = useState<string | null>(null);
  const [filterFloor, setFilterFloor] = useState<string | null>(null);
  const [filterRoom, setFilterRoom] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProps | null>(null);

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
    queryKey: ['blocks', filterBuilding],
    queryFn: async () => {
      if (!filterBuilding) return [];
      
      const { data, error } = await supabase
        .from('blocks')
        .select('id, name, building_id')
        .eq('building_id', filterBuilding);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!filterBuilding && filterBuilding !== 'all-buildings'
  });
  
  const { data: floors } = useQuery({
    queryKey: ['floors', filterBlock],
    queryFn: async () => {
      if (!filterBlock) return [];
      
      const { data, error } = await supabase
        .from('floors')
        .select('id, block_id, floor_number')
        .eq('block_id', filterBlock);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!filterBlock && filterBlock !== 'all-blocks'
  });
  
  const { data: rooms } = useQuery({
    queryKey: ['rooms', filterBlock, filterFloor],
    queryFn: async () => {
      if (!filterBlock || !filterFloor) return [];
      
      const { data: floorData } = await supabase
        .from('floors')
        .select('floor_number')
        .eq('id', filterFloor)
        .single();
        
      if (!floorData) return [];
      
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, block_id, floor_id')
        .eq('block_id', filterBlock)
        .eq('floor_id', floorData.floor_number);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!filterBlock && !!filterFloor && filterBlock !== 'all-blocks' && filterFloor !== 'all-floors'
  });
  
  const { data: students, refetch: refetchStudents } = useQuery({
    queryKey: ['students', filterBuilding, filterBlock, filterFloor, filterRoom],
    queryFn: async () => {
      let query = supabase.from('students').select('*');
      
      if (filterBlock && filterBlock !== 'all-blocks') {
        const blockData = await fetchBlock(filterBlock);
        if (blockData) {
          query = query.eq('block_name', blockData.name);
        }
      }
      
      if (filterFloor && filterFloor !== 'all-floors') {
        const floorData = await fetchFloor(filterBlock || '', filterFloor);
        if (floorData) {
          query = query.eq('floor_number', floorData.floor_number);
        }
      }
      
      if (filterRoom && filterRoom !== 'all-rooms') {
        query = query.eq('room_id', filterRoom);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const { data: monthAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', selectedYear, selectedMonth, filterBuilding, filterBlock, filterFloor, filterRoom],
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
      
      if (filterRoom && filterRoom !== 'all-rooms') {
        query = query.eq('room_id', filterRoom);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching attendance:', error);
        return [];
      }
      
      return data || [];
    }
  });
  
  useEffect(() => {
    if (monthAttendance) {
      const newAttendanceData: Record<string, AttendanceStatus> = {};
      
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
      }, {} as Record<string, AttendanceRecord[]>);
      
      Object.entries(attendanceByDate).forEach(([date, records]) => {
        if (newAttendanceData[date] === 'H') {
          return;
        }
        
        const statusCounts = records.reduce((acc, record) => {
          const status = record.status;
          if (status === 'P' || status === 'A' || status === 'L' || status === 'H') {
            acc[status as AttendanceStatus] = (acc[status as AttendanceStatus] || 0) + 1;
          }
          return acc;
        }, {} as Record<AttendanceStatus, number>);
        
        let maxCount = 0;
        let maxStatus: AttendanceStatus = 'P';
        
        Object.entries(statusCounts).forEach(([status, count]) => {
          if (count > maxCount) {
            maxCount = count;
            maxStatus = status as AttendanceStatus;
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

  const formatDateString = (day: number) => {
    const dateObj = new Date(selectedYear, selectedMonth, day);
    return dateObj.toISOString().split('T')[0];
  };

  const getAttendanceForDay = (day: number) => {
    const dateString = formatDateString(day);
    return attendanceData[dateString] || '-' as AttendanceStatus | '-';
  };

  const getStatusClass = (status: AttendanceStatus | '-') => {
    if (status === '-') return 'bg-gray-100 text-gray-500';
    return statusColors[status] || 'bg-gray-100 text-gray-500';
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsStudentListOpen(true);
  };

  const markAsHoliday = async () => {
    if (selectedDay) {
      const dateString = formatDateString(selectedDay);
      
      try {
        await markDayAsHoliday(dateString);
        
        setIsHolidayDialogOpen(false);
        
        toast({
          title: "Holiday Marked",
          description: `${MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear} has been marked as a holiday.`,
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

  const markStudentLeave = async () => {
    if (selectedDay && selectedStudent) {
      const dateString = formatDateString(selectedDay);
      
      try {
        await markAttendance(selectedStudent.id, 'L', dateString);
        
        setIsLeaveDialogOpen(false);
        setSelectedStudent(null);
        
        toast({
          title: "Leave Marked",
          description: `${selectedStudent.name} has been marked on leave for ${MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear}.`,
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
    setSelectedStudent(student);
    setIsLeaveDialogOpen(true);
    setIsStudentListOpen(false);
  };

  const handleMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
    if (selectedDay) {
      const dateString = formatDateString(selectedDay);
      
      try {
        await markAttendance(studentId, status, dateString, filterRoom || undefined);
        
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

  const getStudentAttendanceStatus = (studentId: string): AttendanceStatus | '-' => {
    if (!selectedDay || !selectedDayAttendance) return '-';
    
    const dateString = formatDateString(selectedDay);
    const record = selectedDayAttendance.find(r => r.student_id === studentId && r.date === dateString);
    
    if (record) {
      const status = record.status;
      if (status === 'P' || status === 'A' || status === 'L' || status === 'H') {
        return status as AttendanceStatus;
      }
    }
    
    return '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-semibold">Attendance Records</h2>
          <p className="text-gray-500">View and filter attendance history</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setViewMode(value)}>
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
                  <Select value={filterBuilding || "all-buildings"} onValueChange={setFilterBuilding}>
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
                  <Select value={filterBlock || "all-blocks"} onValueChange={setFilterBlock}>
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
                  <Select value={filterFloor || "all-floors"} onValueChange={setFilterFloor}>
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
                  <Select value={filterRoom || "all-rooms"} onValueChange={setFilterRoom}>
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
                    onClick={() => {
                      setFilterBuilding(null);
                      setFilterBlock(null);
                      setFilterFloor(null);
                      setFilterRoom(null);
                    }}
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
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setSelectedMonth(date.getMonth());
                    setSelectedYear(date.getFullYear());
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${statusColors[status as AttendanceStatus]} mr-2`}></div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
      
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <h3 className="text-lg font-medium">
            {MONTHS[selectedMonth]} {selectedYear}
          </h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
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
              onClick={() => day !== null && handleDayClick(day)}
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

      <Dialog open={isStudentListOpen} onOpenChange={setIsStudentListOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && `${MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear}`}
            </DialogTitle>
            <DialogDescription>
              View and manage attendance for this day
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Student Attendance</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600"
                onClick={() => {
                  setIsStudentListOpen(false);
                  setIsHolidayDialogOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Mark as Holiday
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Reg No.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.length ? (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.registration_no}</TableCell>
                      <TableCell>
                        {selectedDay && (
                          <Badge className={getStatusClass(getStudentAttendanceStatus(student.id))}>
                            {getStudentAttendanceStatus(student.id) !== '-' 
                              ? statusLabels[getStudentAttendanceStatus(student.id) as AttendanceStatus] 
                              : 'Not Marked'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleMarkAttendance(student.id, 'P')}
                          >
                            Present
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleMarkAttendance(student.id, 'A')}
                          >
                            Absent
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600"
                            onClick={() => handleStudentSelect(student)}
                          >
                            Leave
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No students found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Holiday</DialogTitle>
            <DialogDescription>
              This will mark the day as a holiday for all students. This action can be undone later.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHolidayDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={markAsHoliday}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Student Leave</DialogTitle>
            <DialogDescription>
              {selectedStudent && `Mark ${selectedStudent.name} as on leave for ${selectedDay && MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear}.`}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={markStudentLeave}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
