
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Hostel Eye Attend</h1>
        <p className="text-gray-600">Facial Recognition Attendance System</p>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default Index;
