
import DashboardLayout from '@/components/layout/DashboardLayout';
import CalendarView from '@/components/attendance/CalendarView';

const CalendarPage = () => {
  return (
    <DashboardLayout title="Attendance Calendar">
      <CalendarView />
    </DashboardLayout>
  );
};

export default CalendarPage;
