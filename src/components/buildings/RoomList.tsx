
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, DoorOpen, Edit, Plus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RoomProps {
  id: string;
  name: string;
  floor_id: number;
  block_id: string;
  created_at: string;
  updated_at: string;
  students?: StudentProps[];
}

interface StudentProps {
  id: string;
  name: string;
  registration_no: string;
  photo_url: string | null;
  phone_number: string;
}

interface BuildingData {
  id: string;
  name: string;
}

interface BlockData {
  id: string;
  name: string;
  building_id: string;
}

interface FloorData {
  id: string;
  block_id: string;
  floor_number: number;
}

const RoomList = () => {
  const { buildingId, blockId, floorId } = useParams();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomProps | null>(null);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch building name
  const { data: building } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: async (): Promise<BuildingData | null> => {
      if (!buildingId) return null;
      
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name')
        .eq('id', buildingId)
        .single();
      
      if (error) {
        console.error('Error fetching building:', error);
        throw error;
      }
      
      return data as BuildingData;
    },
  });

  // Fetch block name
  const { data: block } = useQuery({
    queryKey: ['block', blockId],
    queryFn: async (): Promise<BlockData | null> => {
      if (!blockId) return null;
      
      const { data, error } = await supabase
        .from('blocks')
        .select('id, name, building_id')
        .eq('id', blockId)
        .single();
      
      if (error) {
        console.error('Error fetching block:', error);
        throw error;
      }
      
      return data as BlockData;
    },
  });

  // Fetch floor data
  const { data: floor } = useQuery({
    queryKey: ['floor', blockId, floorId],
    queryFn: async (): Promise<FloorData | null> => {
      if (!blockId || !floorId) return null;
      
      const { data, error } = await supabase
        .from('floors')
        .select('id, block_id, floor_number')
        .eq('block_id', blockId)
        .eq('floor_number', floorId)
        .single();
      
      if (error) {
        console.error('Error fetching floor:', error);
        return null; // Return null instead of throwing to handle case where floor doesn't exist yet
      }
      
      return data as FloorData;
    },
  });

  // Fetch rooms for the current floor
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms', blockId, floorId],
    queryFn: async (): Promise<RoomProps[]> => {
      if (!blockId || !floorId) return [];
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('block_id', blockId)
        .eq('floor_id', floorId);
      
      if (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      }
      
      return data as RoomProps[];
    },
  });

  // Fetch students for each room
  const { data: students = [] } = useQuery({
    queryKey: ['students', blockId, floorId],
    queryFn: async () => {
      if (!blockId || !floorId) return [];
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('block_name', block?.name || '')
        .eq('floor_number', parseInt(floorId));
      
      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!block,
  });

  // Organize students by room
  const roomsWithStudents = rooms.map(room => {
    const roomStudents = students.filter(student => 
      student.room_number === room.name
    );
    
    return {
      ...room,
      students: roomStudents.map(student => ({
        id: student.id,
        name: student.name,
        registration_no: student.registration_no,
        photo_url: student.photo_url,
        phone_number: student.phone_number
      }))
    };
  });

  // Delete room mutation
  const deleteRoom = useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) throw error;
      return roomId;
    },
    onSuccess: (deletedRoomId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      toast({
        title: "Room Deleted",
        description: `${roomToDelete?.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
      setPassword('');
    },
    onError: (error) => {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (room: RoomProps) => {
    setRoomToDelete(room);
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

    if (roomToDelete) {
      deleteRoom.mutate(roomToDelete.id);
    }
  };

  // Format floor name
  const getFloorName = (floorNumber: string | undefined) => {
    if (!floorNumber) return '';
    
    const num = parseInt(floorNumber);
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix} Floor`;
  };

  if (isLoadingRooms) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6 flex-wrap gap-2">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors`)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Floors
        </Button>
        {building && (
          <div className="px-3 py-1 bg-primary-light rounded-full text-primary text-sm font-medium">
            {building.name}
          </div>
        )}
        {block && (
          <div className="px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-sm font-medium">
            {block.name}
          </div>
        )}
        <div className="px-3 py-1 bg-green-100 rounded-full text-green-600 text-sm font-medium">
          {getFloorName(floorId)}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rooms</h2>
      </div>

      {roomsWithStudents.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gray-100">
              <DoorOpen className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <h3 className="font-medium text-lg mb-2">No Rooms Found</h3>
          <p className="text-gray-500 mb-4">
            There are no rooms for this floor yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roomsWithStudents.map((room) => (
            <Card key={room.id} className="card-hover overflow-hidden">
              <div className="bg-amber-50 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-amber-100 mr-2">
                    <DoorOpen className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-medium text-amber-800">{room.name}</h3>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:bg-amber-100"
                    onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms/${room.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteClick(room)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    {room.students?.length || 0} {(room.students?.length || 0) === 1 ? 'Student' : 'Students'}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-amber-500 text-amber-600 hover:bg-amber-50"
                    onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms/${room.id}/add-student`)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Student
                  </Button>
                </div>
                
                {room.students && room.students.length > 0 ? (
                  <div className="space-y-3">
                    {room.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/students/${student.id}`)}
                      >
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
                          {student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt={student.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.registration_no}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No students assigned</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-primary hover:bg-primary-light"
                      onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms/${room.id}/add-student`)}
                    >
                      Add Student
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteRoom.isPending}
            >
              {deleteRoom.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomList;
