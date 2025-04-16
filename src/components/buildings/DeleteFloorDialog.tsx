
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DeleteFloorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  floorName: string | undefined;
  password: string;
  onPasswordChange: (password: string) => void;
  onConfirmDelete: () => void;
  isPending: boolean;
}

const DeleteFloorDialog = ({
  isOpen,
  onOpenChange,
  floorName,
  password,
  onPasswordChange,
  onConfirmDelete,
  isPending
}: DeleteFloorDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {floorName}? This action cannot be undone.
            All associated rooms and student data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-2">
          <label className="text-sm font-medium">Enter Admin Password to Confirm</label>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Hint: Use "admin123" as the password</p>
        </div>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFloorDialog;
