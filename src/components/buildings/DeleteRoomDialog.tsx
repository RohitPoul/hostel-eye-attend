
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RoomProps } from '@/utils/roomUtils';

interface DeleteRoomDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomToDelete: RoomProps | null;
  onConfirmDelete: () => void;
  isPending: boolean;
}

const DeleteRoomDialog = ({ 
  isOpen, 
  onOpenChange, 
  roomToDelete, 
  onConfirmDelete, 
  isPending 
}: DeleteRoomDialogProps) => {
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleConfirmDelete = () => {
    if (password !== 'admin123') {
      toast({
        title: "Invalid Password",
        description: "The confirmation password is incorrect.",
        variant: "destructive",
      });
      return;
    }

    onConfirmDelete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {roomToDelete?.name}? This action cannot be undone.
            All associated student data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-2">
          <label className="text-sm font-medium">Enter Admin Password to Confirm</label>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            onClick={handleConfirmDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoomDialog;
