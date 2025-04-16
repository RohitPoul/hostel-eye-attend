
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BuildingHeader from './BuildingHeader';
import BlockCard from './BlockCard';
import EmptyBlockState from './EmptyBlockState';
import DeleteBlockDialog from './DeleteBlockDialog';

interface BlockProps {
  id: string;
  name: string;
  floorCount: number;
}

const BlockList = () => {
  const { buildingId } = useParams();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<BlockProps | null>(null);
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
  const { data: blocksData = [], isLoading } = useQuery({
    queryKey: ['blocks', buildingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocks')
        .select('id, name')
        .eq('building_id', buildingId);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch floor counts for each block
  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks-with-floors', buildingId],
    queryFn: async () => {
      if (!blocksData.length) return [];
      
      // Get floor counts for each block
      const blocksWithFloors = await Promise.all(
        blocksData.map(async (block) => {
          const { count, error } = await supabase
            .from('floors')
            .select('id', { count: 'exact', head: true })
            .eq('block_id', block.id);
          
          return {
            ...block,
            floorCount: count || 0
          };
        })
      );
      
      return blocksWithFloors;
    },
    enabled: blocksData.length > 0,
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
      queryClient.invalidateQueries({ queryKey: ['blocks-with-floors', buildingId] });
      toast({
        title: "Block Deleted",
        description: `${blockToDelete?.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setBlockToDelete(null);
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
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setBlockToDelete(null);
  };

  const confirmDelete = (blockId: string) => {
    deleteBlock.mutate(blockId);
  };

  return (
    <div className="space-y-4">
      <BuildingHeader buildingName={building?.name} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Blocks</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Loading blocks...</p>
        </div>
      ) : blocks.length === 0 ? (
        <EmptyBlockState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              buildingId={buildingId || ''}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <DeleteBlockDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        blockToDelete={blockToDelete}
        onConfirmDelete={confirmDelete}
        isPending={deleteBlock.isPending}
      />
    </div>
  );
};

export default BlockList;
