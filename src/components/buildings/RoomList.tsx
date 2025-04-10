
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, DoorOpen, Edit, Plus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface StudentProps {
  id: string;
  name: string;
  registrationNo: string;
  photoUrl: string;
  phoneNumber: string;
}

interface RoomProps {
  id: string;
  name: string;
  students: StudentProps[];
}

const RoomList = () => {
  const { buildingId, blockId, floorId } = useParams();
  const [rooms, setRooms] = useState<RoomProps[]>([
    { 
      id: '1', 
      name: 'NAF-01', 
      students: [
        { 
          id: 's1', 
          name: 'John Doe', 
          registrationNo: 'REG2023001', 
          photoUrl: 'https://i.pravatar.cc/150?img=1', 
          phoneNumber: '9876543210' 
        },
        { 
          id: 's2', 
          name: 'Jane Smith', 
          registrationNo: 'REG2023002', 
          photoUrl: 'https://i.pravatar.cc/150?img=2', 
          phoneNumber: '9876543211' 
        }
      ] 
    },
    { 
      id: '2', 
      name: 'NAF-02', 
      students: [
        { 
          id: 's3', 
          name: 'Alex Johnson', 
          registrationNo: 'REG2023003', 
          photoUrl: 'https://i.pravatar.cc/150?img=3', 
          phoneNumber: '9876543212' 
        }
      ] 
    },
    { id: '3', name: 'NAF-03', students: [] },
    { id: '4', name: 'NAF-04', students: [] },
  ]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomProps | null>(null);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const buildingName = "Satyaadi"; // In a real app, this would be fetched from the database
  const blockName = "Block A"; // In a real app, this would be fetched from the database
  const floorName = "1st Floor"; // In a real app, this would be fetched from the database

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
      const updatedRooms = rooms.filter(r => r.id !== roomToDelete.id);
      setRooms(updatedRooms);
      
      toast({
        title: "Room Deleted",
        description: `${roomToDelete.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
      setPassword('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors`)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Floors
        </Button>
        <div className="ml-2 px-3 py-1 bg-primary-light rounded-full text-primary text-sm font-medium">
          {buildingName}
        </div>
        <div className="ml-2 px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-sm font-medium">
          {blockName}
        </div>
        <div className="ml-2 px-3 py-1 bg-green-100 rounded-full text-green-600 text-sm font-medium">
          {floorName}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rooms</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
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
                  {room.students.length} {room.students.length === 1 ? 'Student' : 'Students'}
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
              
              {room.students.length > 0 ? (
                <div className="space-y-3">
                  {room.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.registrationNo}</div>
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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomList;
