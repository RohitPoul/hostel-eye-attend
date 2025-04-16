
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building, ChevronLeft, ChevronRight, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBuilding, fetchBlock, fetchFloor, fetchRooms } from '@/utils/roomUtils';

interface FloorProps {
  id: string;
  name: string;
  roomCount: number;
}

const FloorList = () => {
  const { buildingId, blockId } = useParams();
  const [floors, setFloors] = useState<FloorProps[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<FloorProps | null>(null);
  const [password, setPassword] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFloorId, setEditFloorId] = useState<string | null>(null);
  const [editRoomCount, setEditRoomCount] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch building data
  const { data: building } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: () => fetchBuilding(buildingId),
    enabled: !!buildingId,
  });

  // Fetch block data
  const { data: block } = useQuery({
    queryKey: ['block', blockId],
    queryFn: () => fetchBlock(blockId),
    enabled: !!blockId,
  });

  // Fetch floors for the current block
  const { data: floorData, isLoading } = useQuery({
    queryKey: ['floors', blockId],
    queryFn: async () => {
      if (!blockId) return [];
      
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .eq('block_id', blockId)
        .order('floor_number');
      
      if (error) {
        console.error('Error fetching floors:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!blockId,
  });

  // Update state when floor data is loaded
  useEffect(() => {
    if (floorData && floorData.length > 0) {
      const loadFloorData = async () => {
        const updatedFloors = await Promise.all(
          floorData.map(async (floor) => {
            // Fetch rooms for this floor to get the count
            const rooms = await fetchRooms(blockId, floor.floor_number.toString());
            const floorName = getFloorName(floor.floor_number.toString());
            
            return {
              id: floor.id,
              name: floorName,
              roomCount: rooms.length
            };
          })
        );
        setFloors(updatedFloors);
      };
      
      loadFloorData();
    }
  }, [floorData, blockId]);

  // Helper function to format floor name
  const getFloorName = (floorNumber: string) => {
    const num = parseInt(floorNumber);
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix} Floor`;
  };

  const buildingName = building?.name || "Loading...";
  const blockName = block?.name || "Loading...";

  const handleDeleteClick = (floor: FloorProps) => {
    setFloorToDelete(floor);
    setPassword('');
    setIsDeleteDialogOpen(true);
  };

  // Delete floor mutation
  const deleteFloorMutation = useMutation({
    mutationFn: async (floorId: string) => {
      // First, delete all rooms associated with this floor
      const floorObj = floorData?.find(f => f.id === floorId);
      if (!floorObj) throw new Error('Floor not found');
      
      const { error: roomsError } = await supabase
        .from('rooms')
        .delete()
        .eq('block_id', blockId || '')
        .eq('floor_id', floorObj.floor_number);
      
      if (roomsError) throw roomsError;
      
      // Then delete the floor
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', floorId);
      
      if (error) throw error;
      
      return floorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors', blockId] });
      
      toast({
        title: "Floor Deleted",
        description: `${floorToDelete?.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setFloorToDelete(null);
      setPassword('');
    },
    onError: (error) => {
      console.error('Error deleting floor:', error);
      toast({
        title: "Error",
        description: "Failed to delete floor. Please try again.",
        variant: "destructive",
      });
    }
  });

  const confirmDelete = () => {
    if (password !== 'admin123') {
      toast({
        title: "Invalid Password",
        description: "The confirmation password is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (floorToDelete) {
      deleteFloorMutation.mutate(floorToDelete.id);
    }
  };

  const handleEditRoomCount = (floor: FloorProps) => {
    setEditFloorId(floor.id);
    setEditRoomCount(floor.roomCount);
    setIsEditMode(true);
  };

  const updateRoomCountMutation = useMutation({
    mutationFn: async ({ floorId, newCount }: { floorId: string, newCount: number }) => {
      const floorObj = floorData?.find(f => f.id === floorId);
      if (!floorObj) throw new Error('Floor not found');
      
      const floorNumber = floorObj.floor_number;
      
      // Get current rooms
      const { data: currentRooms, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .eq('block_id', blockId || '')
        .eq('floor_id', floorNumber);
      
      if (fetchError) throw fetchError;
      
      const currentCount = currentRooms?.length || 0;
      
      if (newCount > currentCount) {
        // Add more rooms
        const roomsToAdd = newCount - currentCount;
        const blockPrefix = block?.name.replace('Block ', '') || '';
        
        const newRooms = Array.from({ length: roomsToAdd }).map((_, i) => ({
          name: `${blockPrefix}-${floorNumber}${String(currentCount + i + 1).padStart(2, '0')}`,
          floor_id: floorNumber,
          block_id: blockId
        }));
        
        const { error: addError } = await supabase
          .from('rooms')
          .insert(newRooms);
        
        if (addError) throw addError;
      } else if (newCount < currentCount) {
        // Remove excess rooms (remove from the end)
        const roomsToDelete = currentRooms?.slice(newCount);
        
        if (roomsToDelete && roomsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('rooms')
            .delete()
            .in('id', roomsToDelete.map(r => r.id));
          
          if (deleteError) throw deleteError;
        }
      }
      
      return { floorId, roomCount: newCount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', blockId] });
      queryClient.invalidateQueries({ queryKey: ['floors', blockId] });
      
      const updatedFloors = floors.map(floor => 
        floor.id === data.floorId 
          ? { ...floor, roomCount: data.roomCount } 
          : floor
      );
      setFloors(updatedFloors);
      
      toast({
        title: "Room Count Updated",
        description: `Room count has been updated to ${data.roomCount}.`,
      });
      
      setIsEditMode(false);
      setEditFloorId(null);
    },
    onError: (error) => {
      console.error('Error updating room count:', error);
      toast({
        title: "Error",
        description: "Failed to update room count. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveRoomCount = () => {
    if (editFloorId) {
      updateRoomCountMutation.mutate({ 
        floorId: editFloorId, 
        newCount: editRoomCount 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading floors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate(`/buildings/${buildingId}/blocks`)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Blocks
        </Button>
        <div className="ml-2 px-3 py-1 bg-primary-light rounded-full text-primary text-sm font-medium">
          {buildingName}
        </div>
        <div className="ml-2 px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-sm font-medium">
          {blockName}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Floors</h2>
      </div>

      {floors.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No floors found for this block.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {floors.map((floor) => (
            <div
              key={floor.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-3">
                    <Layers className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{floor.name}</h3>
                    <div className="flex items-center">
                      {editFloorId === floor.id ? (
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="number" 
                            value={editRoomCount}
                            onChange={(e) => setEditRoomCount(parseInt(e.target.value) || 0)}
                            className="w-16 h-7 p-1 text-sm" 
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={saveRoomCount}
                            disabled={updateRoomCountMutation.isPending}
                          >
                            {updateRoomCountMutation.isPending ? '...' : 'Save'}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 cursor-pointer hover:underline" onClick={() => handleEditRoomCount(floor)}>
                          {floor.roomCount} Rooms
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteClick(floor)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                className="w-full mt-4 justify-between text-green-600 hover:bg-green-50"
                onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floor.id}/rooms`)}
              >
                View Rooms
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
              Are you sure you want to delete {floorToDelete?.name}? This action cannot be undone.
              All associated rooms and student data will be permanently removed.
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
              disabled={deleteFloorMutation.isPending}
            >
              {deleteFloorMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FloorList;
