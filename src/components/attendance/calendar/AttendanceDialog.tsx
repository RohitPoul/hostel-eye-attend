
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { StudentProps } from '@/types/room';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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

interface AttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: number | null;
  selectedMonth: number;
  selectedYear: number;
  students?: StudentProps[];
  onHolidayClick: () => void;
  onMarkAttendance: (studentId: string, status: 'P' | 'A' | 'L' | 'H') => void;
  onStudentSelect: (student: StudentProps) => void;
  getStudentAttendanceStatus: (studentId: string) => 'P' | 'A' | 'L' | 'H' | '-';
}

export function AttendanceDialog({
  isOpen,
  onClose,
  selectedDay,
  selectedMonth,
  selectedYear,
  students,
  onHolidayClick,
  onMarkAttendance,
  onStudentSelect,
  getStudentAttendanceStatus,
}: AttendanceDialogProps) {
  const getStatusClass = (status: 'P' | 'A' | 'L' | 'H' | '-') => {
    if (status === '-') return 'bg-gray-100 text-gray-500';
    return statusColors[status] || 'bg-gray-100 text-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              onClick={onHolidayClick}
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
                            ? statusLabels[getStudentAttendanceStatus(student.id) as keyof typeof statusLabels] 
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
                          onClick={() => onMarkAttendance(student.id, 'P')}
                        >
                          Present
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => onMarkAttendance(student.id, 'A')}
                        >
                          Absent
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-yellow-600"
                          onClick={() => onStudentSelect(student)}
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
  );
}
