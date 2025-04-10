
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoomList from '@/components/buildings/RoomList';

const RoomsPage = () => {
  return (
    <DashboardLayout title="Rooms">
      <RoomList />
    </DashboardLayout>
  );
};

export default RoomsPage;
