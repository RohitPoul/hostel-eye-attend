
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StudentForm from '@/components/students/StudentForm';

const StudentFormPage = () => {
  const { studentId, buildingId, blockId, floorId, roomId } = useParams();
  const isEditing = !!studentId;
  
  return (
    <DashboardLayout title={isEditing ? 'Edit Student' : 'Add Student'}>
      <StudentForm 
        isEditing={isEditing} 
        studentId={studentId}
        buildingId={buildingId}
        blockId={blockId}
        floorId={floorId}
        roomId={roomId}
      />
    </DashboardLayout>
  );
};

export default StudentFormPage;
