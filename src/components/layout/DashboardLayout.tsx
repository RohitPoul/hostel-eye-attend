
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Calendar, Camera, LogOut, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkIfLoggedIn = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        navigate('/');
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkIfLoggedIn();
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { title: 'Dashboard', icon: <Calendar className="h-5 w-5" />, path: '/dashboard' },
    { title: 'Start Attendance', icon: <Camera className="h-5 w-5" />, path: '/attendance' },
    { title: 'Buildings', icon: <Building className="h-5 w-5" />, path: '/buildings' },
    { title: 'Profile', icon: <User className="h-5 w-5" />, path: '/profile' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`bg-white shadow-md fixed h-full transition-all duration-300 z-20 border-r ${
          isSidebarOpen ? 'w-64' : 'w-0 -ml-64 md:w-20 md:ml-0'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className={`flex items-center justify-center mb-8 mt-4 ${!isSidebarOpen && 'md:justify-center'}`}>
            <div className={`font-bold text-primary text-2xl ${!isSidebarOpen && 'md:hidden'}`}>Hostel Eye</div>
            {!isSidebarOpen && <div className="hidden md:block text-primary text-2xl font-bold">HE</div>}
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start hover:bg-primary hover:text-white ${
                      window.location.pathname === item.path ? 'bg-primary-light text-primary' : ''
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className={`ml-2 ${!isSidebarOpen && 'md:hidden'}`}>{item.title}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-red-100 hover:text-red-500 border-red-200"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className={`ml-2 ${!isSidebarOpen && 'md:hidden'}`}>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-medium">{title}</h1>
          </div>
          <div className="flex items-center">
            <div className="mr-2 text-sm hidden md:block">
              Welcome, {localStorage.getItem('username') || 'Admin'}
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
