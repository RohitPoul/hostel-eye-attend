
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Trash2, ChevronRight, Edit2, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RoomProps } from '@/types/room';
import { updateRoomName } from '@/utils/roomOperations';

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    students?: {
      id: string;
      name: string;
      registration_no: string;
      photo_url?: string;
      phone_number?: string;
    }[];
  };
  buildingId?: string;
  blockId?: string;
  floorId?: string;
  onDeleteClick: (room: RoomProps) => void;
}

const RoomCard = ({
  room,
  buildingId,
  blockId,
  floorId,
  onDeleteClick
}: RoomCardProps) => {
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(room.name);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateNameMutation = useMutation({
    mutationFn: ({ roomId, newName }: { roomId: string, newName: string }) => 
      updateRoomName(roomId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', blockId, floorId] });
      toast({
        title: "Success",
        description: "Room name updated successfully",
      });
      setIsEditingName(false);
    },
    onError: (error) => {
      console.error('Error updating room name:', error);
      toast({
        title: "Error",
        description: "Failed to update room name",
        variant: "destructive",
      });
    }
  });

  const handleNameSave = () => {
    if (editedName.trim()) {
      updateNameMutation.mutate({ roomId: room.id, newName: editedName.trim() });
    }
  };

  const studentCount = room.students?.length || 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-blue-100 mr-3">
            <Layers className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-8 w-40"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleNameSave}
                  disabled={updateNameMutation.isPending}
                >
                  {updateNameMutation.isPending ? '...' : <Check className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{room.name}</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setEditedName(room.name);
                    setIsEditingName(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center mt-1">
              <Users className="h-3.5 w-3.5 text-gray-500 mr-1" />
              <p className="text-sm text-gray-500">
                {studentCount} Student{studentCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
            onClick={() => onDeleteClick(room)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 justify-center"
          onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms/${room.id}/edit`)}
        >
          Edit
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center text-green-600 hover:bg-green-50"
          onClick={() => navigate(`/students?room=${room.id}`)}
        >
          View Students
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default RoomCard;
