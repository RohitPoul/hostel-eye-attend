
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HolidayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDay: number | null;
  selectedMonth: number;
  selectedYear: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function HolidayDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedDay,
  selectedMonth,
  selectedYear,
}: HolidayDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Holiday</DialogTitle>
          <DialogDescription>
            This will mark the day as a holiday for all students. This action can be undone later.
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
