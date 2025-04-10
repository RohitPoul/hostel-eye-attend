
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BuildingForm from '@/components/buildings/BuildingForm';

const BuildingFormPage = () => {
  const { buildingId } = useParams();
  const isEditing = !!buildingId;
  
  return (
    <DashboardLayout title={isEditing ? 'Edit Building' : 'Add Building'}>
      <BuildingForm isEditing={isEditing} buildingId={buildingId} />
    </DashboardLayout>
  );
};

export default BuildingFormPage;
