
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HolidayPeriodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HolidayPeriodDialog({
  isOpen,
  onClose,
  onSuccess,
}: HolidayPeriodDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "Start date cannot be after end date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const dates: string[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push(formatDateString(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Mark each day as a holiday
      for (const date of dates) {
        const { error } = await supabase
          .from('attendance')
          .upsert([
            {
              date,
              status: 'H',
              student_id: null,
            }
          ]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Marked ${dates.length} days as holidays`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error marking holiday period:', error);
      toast({
        title: "Error",
        description: "Failed to mark holiday period. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Holiday Period</DialogTitle>
          <DialogDescription>
            Select a date range to mark as holidays. All days in this range will be marked as holidays for all students.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="rounded-md border p-3"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              className="rounded-md border p-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Mark Holidays"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
