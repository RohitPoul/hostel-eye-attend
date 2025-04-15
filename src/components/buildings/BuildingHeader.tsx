
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BuildingHeaderProps {
  buildingName: string | undefined;
}

const BuildingHeader = ({ buildingName }: BuildingHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center mb-6">
      <Button
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => navigate('/buildings')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Buildings
      </Button>
      <div className="ml-2 px-3 py-1 bg-primary-light rounded-full text-primary text-sm font-medium">
        {buildingName || "Loading..."}
      </div>
    </div>
  );
};

export default BuildingHeader;
