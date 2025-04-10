import { useState } from 'react';
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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type AttendanceStatus = 'P' | 'A' | 'L' | 'H';

interface AttendanceRecord {
  status: AttendanceStatus;
  studentId?: string;
  studentName?: string;
}

interface Student {
  id: string;
  name: string;
  registrationNo: string;
}

const dummyStudents: Student[] = [
  { id: 's1', name: 'John Doe', registrationNo: 'REG2023001' },
  { id: 's2', name: 'Jane Smith', registrationNo: 'REG2023002' },
  { id: 's3', name: 'Alex Johnson', registrationNo: 'REG2023003' },
  { id: 's4', name: 'Emily Davis', registrationNo: 'REG2023004' },
];

const dummyAttendanceData: Record<string, AttendanceRecord> = {
  '2025-04-01': { status: 'P' },
  '2025-04-02': { status: 'P' },
  '2025-04-03': { status: 'A' },
  '2025-04-04': { status: 'P' },
  '2025-04-05': { status: 'L' },
  '2025-04-06': { status: 'L' },
  '2025-04-07': { status: 'P' },
  '2025-04-08': { status: 'P' },
  '2025-04-09': { status: 'H' },
  '2025-04-10': { status: 'P' },
};

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
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord>>(dummyAttendanceData);
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
    return attendanceData[dateString] || { status: '-' as AttendanceStatus | '-' };
  };

  const getStatusClass = (status: AttendanceStatus | '-') => {
    if (status === '-') return 'bg-gray-100 text-gray-500';
    return statusColors[status] || 'bg-gray-100 text-gray-500';
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsStudentListOpen(true);
  };

  const markAsHoliday = () => {
    if (selectedDay) {
      const dateString = formatDateString(selectedDay);
      const updatedAttendanceData = { ...attendanceData };
      
      updatedAttendanceData[dateString] = { status: 'H' };
      
      setAttendanceData(updatedAttendanceData);
      setIsHolidayDialogOpen(false);
      
      toast({
        title: "Holiday Marked",
        description: `${MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear} has been marked as a holiday.`,
      });
    }
  };

  const markStudentLeave = () => {
    if (selectedDay && selectedStudent) {
      const dateString = formatDateString(selectedDay);
      const updatedAttendanceData = { ...attendanceData };
      
      updatedAttendanceData[dateString] = { 
        status: 'L',
        studentId: selectedStudent.id,
        studentName: selectedStudent.name
      };
      
      setAttendanceData(updatedAttendanceData);
      setIsLeaveDialogOpen(false);
      setSelectedStudent(null);
      
      toast({
        title: "Leave Marked",
        description: `${selectedStudent.name} has been marked on leave for ${MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear}.`,
      });
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setIsLeaveDialogOpen(true);
    setIsStudentListOpen(false);
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
                      <SelectItem value="1">Satyaadi</SelectItem>
                      <SelectItem value="2">Ananya</SelectItem>
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
                      <SelectItem value="A">Block A</SelectItem>
                      <SelectItem value="B">Block B</SelectItem>
                      <SelectItem value="C">Block C</SelectItem>
                      <SelectItem value="D">Block D</SelectItem>
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
                      <SelectItem value="1">1st Floor</SelectItem>
                      <SelectItem value="2">2nd Floor</SelectItem>
                      <SelectItem value="3">3rd Floor</SelectItem>
                      <SelectItem value="4">4th Floor</SelectItem>
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
                      <SelectItem value="NAF-01">NAF-01</SelectItem>
                      <SelectItem value="NAF-02">NAF-02</SelectItem>
                      <SelectItem value="NAF-03">NAF-03</SelectItem>
                      <SelectItem value="NAF-04">NAF-04</SelectItem>
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
                onSelect={setSelectedDate}
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
                    
                    {getAttendanceForDay(day).status !== '-' && (
                      <span className={`text-xs font-bold rounded-full px-2 py-1 ${
                        getStatusClass(getAttendanceForDay(day).status)
                      }`}>
                        {getAttendanceForDay(day).status}
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
                {dummyStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.registrationNo}</TableCell>
                    <TableCell>
                      {selectedDay && (
                        <Badge className={getStatusClass(getAttendanceForDay(selectedDay).status)}>
                          {getAttendanceForDay(selectedDay).status !== '-' 
                            ? statusLabels[getAttendanceForDay(selectedDay).status as AttendanceStatus] 
                            : 'Not Marked'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStudentSelect(student)}
                      >
                        Mark Leave
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
