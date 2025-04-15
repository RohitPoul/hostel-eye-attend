
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoomList from '@/components/buildings/RoomList';
import RoomForm from '@/components/buildings/RoomForm';

const RoomsPage = () => {
  const { roomId } = useParams();
  const isEditing = !!roomId;

  return (
    <DashboardLayout title={isEditing ? "Edit Room" : "Rooms"}>
      {isEditing ? <RoomForm /> : <RoomList />}
    </DashboardLayout>
  );
};

export default RoomsPage;
