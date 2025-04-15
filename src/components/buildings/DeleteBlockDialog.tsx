
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DeleteBlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  blockToDelete: { id: string; name: string } | null;
  onConfirmDelete: (id: string) => void;
  isPending: boolean;
}

const DeleteBlockDialog = ({ isOpen, onClose, blockToDelete, onConfirmDelete, isPending }: DeleteBlockDialogProps) => {
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

    if (blockToDelete) {
      onConfirmDelete(blockToDelete.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {blockToDelete?.name}? This action cannot be undone.
            All associated floors, rooms, and student data will be permanently removed.
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
            onClick={onClose}
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

export default DeleteBlockDialog;
