
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building, ChevronLeft, ChevronRight, Home, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BlockProps {
  id: string;
  name: string;
  floorCount: number;
}

const BlockList = () => {
  const { buildingId } = useParams();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<BlockProps | null>(null);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch building data for the header
  const { data: building } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('name')
        .eq('id', buildingId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch blocks for the current building
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['blocks', buildingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocks')
        .select('id, name')
        .eq('building_id', buildingId);
      
      if (error) throw error;
      
      // In a real app, we would fetch floor count for each block
      // For now, we'll hardcode it to 4 for all blocks
      return data.map(block => ({
        ...block,
        floorCount: 4
      }));
    },
  });

  // Delete block mutation
  const deleteBlock = useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', blockId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', buildingId] });
      toast({
        title: "Block Deleted",
        description: `${blockToDelete?.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setBlockToDelete(null);
      setPassword('');
    },
    onError: (error) => {
      console.error('Error deleting block:', error);
      toast({
        title: "Error",
        description: "Failed to delete block. Please try again.",
        variant: "destructive",
      });
    }
  });

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
      deleteBlock.mutate(blockToDelete.id);
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
          {building?.name || "Loading..."}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Blocks</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Loading blocks...</p>
        </div>
      ) : blocks.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gray-100">
              <Layers className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <h3 className="font-medium text-lg mb-2">No Blocks Found</h3>
          <p className="text-gray-500 mb-4">
            This building doesn't have any blocks yet.
          </p>
        </div>
      ) : (
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
      )}

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
              disabled={deleteBlock.isPending}
            >
              {deleteBlock.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlockList;
