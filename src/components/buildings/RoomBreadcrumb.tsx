
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BuildingData, BlockData, formatFloorNumber } from '@/utils/roomUtils';

interface RoomBreadcrumbProps {
  buildingId?: string;
  blockId?: string;
  floorId?: string;
  building?: BuildingData | null;
  block?: BlockData | null;
  floorNumber?: number | null;
}

const RoomBreadcrumb = ({ 
  buildingId, 
  blockId, 
  floorId, 
  building, 
  block,
  floorNumber
}: RoomBreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-6 flex-wrap gap-2">
      <Button
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors`)}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Floors
      </Button>
      {building && (
        <div className="px-3 py-1 bg-primary-light rounded-full text-primary text-sm font-medium">
          {building.name}
        </div>
      )}
      {block && (
        <div className="px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-sm font-medium">
          {block.name}
        </div>
      )}
      <div className="px-3 py-1 bg-green-100 rounded-full text-green-600 text-sm font-medium">
        {formatFloorNumber(floorNumber)}
      </div>
    </div>
  );
};

export default RoomBreadcrumb;
