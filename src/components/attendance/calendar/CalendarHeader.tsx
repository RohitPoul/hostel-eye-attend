
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Student } from '@/types/student';

interface CalendarHeaderProps {
  selectedStudentId: string | null;
  onStudentFilter: (studentId: string) => void;
  onHolidayPeriodClick: () => void;
  students?: Student[];
}

export function CalendarHeaderTop({
  selectedStudentId,
  onStudentFilter,
  onHolidayPeriodClick,
  students,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h2 className="text-xl font-semibold">Attendance Records</h2>
        <p className="text-gray-500">View and filter attendance history</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Select value={selectedStudentId || 'all-students'} onValueChange={onStudentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-students">All Students</SelectItem>
            {students?.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline"
          onClick={onHolidayPeriodClick}
        >
          Mark Holiday Period
        </Button>
      </div>
    </div>
  );
}
