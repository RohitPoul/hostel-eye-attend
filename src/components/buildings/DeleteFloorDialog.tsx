
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FloorProps } from '@/hooks/use-floor-data';

interface DeleteFloorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  floorToDelete: FloorProps | null;
  onConfirmDelete: () => void;
  isPending: boolean;
}

const DeleteFloorDialog = ({
  isOpen,
  onOpenChange,
  floorToDelete,
  onConfirmDelete,
  isPending
}: DeleteFloorDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {floorToDelete?.name}? This action cannot be undone.
            All associated rooms and student data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-2">
          <label className="text-sm font-medium">Enter Admin Password to Confirm</label>
          <Input
            type="password"
            placeholder="Enter password"
            value="admin123"
            readOnly
          />
          <p className="text-xs text-muted-foreground">Using default password: "admin123"</p>
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
