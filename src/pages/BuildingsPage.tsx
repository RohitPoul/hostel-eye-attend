
import DashboardLayout from '@/components/layout/DashboardLayout';
import BuildingList from '@/components/buildings/BuildingList';

const BuildingsPage = () => {
  return (
    <DashboardLayout title="Buildings">
      <BuildingList />
    </DashboardLayout>
  );
};

export default BuildingsPage;
