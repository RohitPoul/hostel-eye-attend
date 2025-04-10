
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttendanceForm from '@/components/attendance/AttendanceForm';

const AttendancePage = () => {
  return (
    <DashboardLayout title="Take Attendance">
      <AttendanceForm />
    </DashboardLayout>
  );
};

export default AttendancePage;
