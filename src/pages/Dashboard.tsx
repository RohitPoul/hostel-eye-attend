
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Calendar, Camera, Clock, UserCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState({
    isActive: false,
    startTime: '',
    endTime: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // In a real app, we would fetch the attendance status from the server
    // For demo, we'll simulate an active attendance session
    setAttendanceStatus({
      isActive: true,
      startTime: '8:30 PM',
      endTime: '9:30 PM',
    });

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getAttendanceTimes = () => {
    if (attendanceStatus.isActive) {
      return `${attendanceStatus.startTime} - ${attendanceStatus.endTime}`;
    }
    return 'Not scheduled';
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-4 md:gap-6">
        {/* Date and Time */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-xl md:text-2xl font-medium text-primary">
            {formatDate(currentTime)}
          </div>
          <div className="text-lg text-gray-600 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Attendance Status */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Attendance Status</CardTitle>
            <CardDescription>
              {attendanceStatus.isActive
                ? 'Attendance is currently active'
                : 'No active attendance session'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Scheduled Time</div>
                <div className="font-medium">{getAttendanceTimes()}</div>
              </div>
              <Button 
                className="bg-primary hover:bg-primary-dark"
                onClick={() => navigate('/attendance')}
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Attendance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-primary-light mb-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg mb-2">Manage Buildings</CardTitle>
                <CardDescription className="mb-4">
                  Add, edit, or remove buildings, blocks, floors, and rooms
                </CardDescription>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate('/buildings')}
                >
                  Manage Buildings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-secondary-light mb-4">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-lg mb-2">View Attendance Records</CardTitle>
                <CardDescription className="mb-4">
                  Access historical attendance data and generate reports
                </CardDescription>
                <Button
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                  onClick={() => navigate('/calendar')}
                >
                  View Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest attendance and system logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start space-x-4 pb-4 border-b">
                  <div className="p-2 rounded-full bg-primary-light">
                    <UserCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {['Attendance completed for Building Satyaadi', 
                         'New student added to Room NAF-01', 
                         'Building Ananya attendance started'][i]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {['Today at 9:30 PM', 'Yesterday at 3:15 PM', 'Yesterday at 8:45 PM'][i]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
