
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import RoomBreadcrumb from './RoomBreadcrumb';
import RoomCard from './RoomCard';
import EmptyRoomState from './EmptyRoomState';
import DeleteRoomDialog from './DeleteRoomDialog';
import { 
  RoomProps, 
  fetchBuilding, 
  fetchBlock, 
  fetchFloor, 
  fetchRooms, 
  fetchStudents, 
  deleteRoomById 
} from '@/utils/roomUtils';

const RoomList = () => {
  const { buildingId, blockId, floorId } = useParams();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomProps | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch building name
  const { data: building } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: () => fetchBuilding(buildingId),
  });

  // Fetch block name
  const { data: block } = useQuery({
    queryKey: ['block', blockId],
    queryFn: () => fetchBlock(blockId),
  });

  // Fetch floor data
  const { data: floor } = useQuery({
    queryKey: ['floor', blockId, floorId],
    queryFn: () => fetchFloor(blockId, floorId),
  });

  // Fetch rooms for the current floor
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms', blockId, floorId],
    queryFn: () => fetchRooms(blockId, floorId),
  });

  // Fetch students for each room
  const { data: students = [] } = useQuery({
    queryKey: ['students', blockId, floorId],
    queryFn: () => fetchStudents(blockId, floorId, block?.name),
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
    mutationFn: deleteRoomById,
    onSuccess: (deletedRoomId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      toast({
        title: "Room Deleted",
        description: `${roomToDelete?.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
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
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (roomToDelete) {
      deleteRoom.mutate(roomToDelete.id);
    }
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
      <RoomBreadcrumb 
        buildingId={buildingId}
        blockId={blockId}
        floorId={floorId}
        building={building}
        block={block}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rooms</h2>
      </div>

      {roomsWithStudents.length === 0 ? (
        <EmptyRoomState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roomsWithStudents.map((room) => (
            <RoomCard 
              key={room.id}
              room={room} 
              buildingId={buildingId}
              blockId={blockId}
              floorId={floorId}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <DeleteRoomDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        roomToDelete={roomToDelete}
        onConfirmDelete={confirmDelete}
        isPending={deleteRoom.isPending}
      />
    </div>
  );
};

export default RoomList;
