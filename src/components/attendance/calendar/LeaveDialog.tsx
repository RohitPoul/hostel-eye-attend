
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StudentProps } from '@/types/room';

interface LeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedStudent: StudentProps | null;
  selectedDay: number | null;
  selectedMonth: number;
  selectedYear: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function LeaveDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedStudent,
  selectedDay,
  selectedMonth,
  selectedYear,
}: LeaveDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Student Leave</DialogTitle>
          <DialogDescription>
            {selectedStudent && `Mark ${selectedStudent.name} as on leave for ${selectedDay && MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear}.`}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
