
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    // Extract path parts to navigate back to a valid page
    const pathParts = location.pathname.split('/');
    
    // Handle room edit routes
    if (location.pathname.includes('/rooms') && location.pathname.includes('/edit')) {
      const buildingIndex = pathParts.indexOf('buildings');
      if (buildingIndex !== -1 && pathParts.length > buildingIndex + 1) {
        const buildingId = pathParts[buildingIndex + 1];
        const blockIndex = pathParts.indexOf('blocks');
        
        if (blockIndex !== -1 && pathParts.length > blockIndex + 1) {
          const blockId = pathParts[blockIndex + 1];
          const floorIndex = pathParts.indexOf('floors');
          
          if (floorIndex !== -1 && pathParts.length > floorIndex + 1) {
            const floorId = pathParts[floorIndex + 1];
            // Navigate back to the rooms list
            navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`);
            return;
          }
        }
      }
    }
    
    // If the URL contains student-related paths, handle them specially
    if (location.pathname.includes('student')) {
      // Extract building, block, floor, and room IDs from the URL to navigate back safely
      const pathParts = location.pathname.split('/');
      const buildingIndex = pathParts.indexOf('buildings');
      
      if (buildingIndex !== -1 && pathParts.length > buildingIndex + 1) {
        const buildingId = pathParts[buildingIndex + 1];
        const blockIndex = pathParts.indexOf('blocks');
        
        if (blockIndex !== -1 && pathParts.length > blockIndex + 1) {
          const blockId = pathParts[blockIndex + 1];
          const floorIndex = pathParts.indexOf('floors');
          
          if (floorIndex !== -1 && pathParts.length > floorIndex + 1) {
            const floorId = pathParts[floorIndex + 1];
            const roomIndex = pathParts.indexOf('rooms');
            
            if (roomIndex !== -1 && pathParts.length > roomIndex + 1) {
              const roomId = pathParts[roomIndex + 1];
              // Navigate back to the room page
              navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`);
              return;
            }
            
            // Navigate back to the floors page
            navigate(`/buildings/${buildingId}/blocks/${blockId}/floors`);
            return;
          }
          
          // Navigate back to the blocks page
          navigate(`/buildings/${buildingId}/blocks`);
          return;
        }
        
        // Navigate back to the buildings page
        navigate(`/buildings`);
        return;
      }
    } else if (location.pathname.includes('/rooms')) {
      // Extract building, block, and floor IDs from the URL to navigate back safely
      const pathParts = location.pathname.split('/');
      const buildingIndex = pathParts.indexOf('buildings');
      
      if (buildingIndex !== -1 && pathParts.length > buildingIndex + 1) {
        const buildingId = pathParts[buildingIndex + 1];
        const blockIndex = pathParts.indexOf('blocks');
        
        if (blockIndex !== -1 && pathParts.length > blockIndex + 1) {
          const blockId = pathParts[blockIndex + 1];
          const floorIndex = pathParts.indexOf('floors');
          
          if (floorIndex !== -1 && pathParts.length > floorIndex + 1) {
            const floorId = pathParts[floorIndex + 1];
            navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`);
            return;
          }
          
          navigate(`/buildings/${buildingId}/blocks/${blockId}/floors`);
          return;
        }
        
        navigate(`/buildings/${buildingId}/blocks`);
        return;
      }
      
      // Fallback to buildings list
      navigate('/buildings');
      return;
    }
    
    // For other routes, just go back or to home
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-6xl font-bold mb-2 text-red-500">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button 
            className="flex items-center" 
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
