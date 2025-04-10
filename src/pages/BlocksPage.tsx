
import DashboardLayout from '@/components/layout/DashboardLayout';
import BlockList from '@/components/buildings/BlockList';

const BlocksPage = () => {
  return (
    <DashboardLayout title="Blocks">
      <BlockList />
    </DashboardLayout>
  );
};

export default BlocksPage;
