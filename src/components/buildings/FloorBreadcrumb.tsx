
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BuildingData, BlockData } from '@/utils/roomUtils';

interface FloorBreadcrumbProps {
  buildingId?: string;
  buildingName: string;
  blockName: string;
  onBack: () => void;
}

const FloorBreadcrumb = ({ 
  buildingId,
  buildingName, 
  blockName,
  onBack
}: FloorBreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-6">
      <Button
        variant="ghost"
        className="text-muted-foreground"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Blocks
      </Button>
      <div className="ml-2 px-3 py-1 bg-primary-light rounded-full text-primary text-sm font-medium">
        {buildingName}
      </div>
      <div className="ml-2 px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-sm font-medium">
        {blockName}
      </div>
    </div>
  );
};

export default FloorBreadcrumb;
