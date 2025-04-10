
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building, ChevronLeft, ChevronRight, Home, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface BlockProps {
  id: string;
  name: string;
  floorCount: number;
}

const BlockList = () => {
  const { buildingId } = useParams();
  const [blocks, setBlocks] = useState<BlockProps[]>([
    { id: '1', name: 'Block A', floorCount: 4 },
    { id: '2', name: 'Block B', floorCount: 4 },
    { id: '3', name: 'Block C', floorCount: 4 },
    { id: '4', name: 'Block D', floorCount: 4 },
  ]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<BlockProps | null>(null);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const buildingName = "Satyaadi"; // In a real app, this would be fetched from the database

  const handleDeleteClick = (block: BlockProps) => {
    setBlockToDelete(block);
    setPassword('');
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (password !== 'admin123') {
      toast({
        title: "Invalid Password",
        description: "The confirmation password is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (blockToDelete) {
      const updatedBlocks = blocks.filter(b => b.id !== blockToDelete.id);
      setBlocks(updatedBlocks);
      
      toast({
        title: "Block Deleted",
        description: `${blockToDelete.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setBlockToDelete(null);
      setPassword('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate('/buildings')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Buildings
        </Button>
        <div className="ml-2 px-3 py-1 bg-primary-light rounded-full text-primary text-sm font-medium">
          {buildingName}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Blocks</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{block.name}</h3>
                  <p className="text-sm text-gray-500">{block.floorCount} Floors</p>
                </div>
              </div>
              
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleDeleteClick(block)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between text-blue-600 hover:bg-blue-50"
              onClick={() => navigate(`/buildings/${buildingId}/blocks/${block.id}/floors`)}
            >
              View Floors
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlockList;
