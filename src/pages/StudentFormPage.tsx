
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StudentForm from '@/components/students/StudentForm';

const StudentFormPage = () => {
  const { studentId } = useParams();
  const isEditing = !!studentId;
  
  return (
    <DashboardLayout title={isEditing ? 'Edit Student' : 'Add Student'}>
      <StudentForm isEditing={isEditing} studentId={studentId} />
    </DashboardLayout>
  );
};

export default StudentFormPage;
