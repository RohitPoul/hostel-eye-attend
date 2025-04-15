
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, User, Plus, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RoomProps } from '@/utils/roomUtils';

interface RoomCardProps {
  room: RoomProps;
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

  return (
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
            onClick={() => onDeleteClick(room)}
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
  );
};

export default RoomCard;
