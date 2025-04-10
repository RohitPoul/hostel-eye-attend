
import DashboardLayout from '@/components/layout/DashboardLayout';
import FloorList from '@/components/buildings/FloorList';

const FloorsPage = () => {
  return (
    <DashboardLayout title="Floors">
      <FloorList />
    </DashboardLayout>
  );
};

export default FloorsPage;
