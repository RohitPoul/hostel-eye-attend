
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StudentForm from '@/components/students/StudentForm';
import StudentEditForm from '@/components/students/StudentEditForm';

const StudentFormPage = () => {
  const { studentId } = useParams();
  const isEditing = !!studentId;
  
  return (
    <DashboardLayout title={isEditing ? 'Edit Student' : 'Add Student'}>
      {isEditing ? <StudentEditForm /> : <StudentForm isEditing={isEditing} studentId={studentId} />}
    </DashboardLayout>
  );
};

export default StudentFormPage;
