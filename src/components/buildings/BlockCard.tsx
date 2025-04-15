
import { ChevronRight, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BlockCardProps {
  block: {
    id: string;
    name: string;
    floorCount: number;
  };
  buildingId: string;
  onDeleteClick: (block: { id: string; name: string; floorCount: number }) => void;
}

const BlockCard = ({ block, buildingId, onDeleteClick }: BlockCardProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-blue-100 mr-3">
            <Layers className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">{block.name}</h3>
            <p className="text-sm text-gray-500">{block.floorCount} Floors</p>
          </div>
        </div>
        
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
            onClick={() => onDeleteClick(block)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Button
        variant="ghost"
        className="w-full mt-4 justify-between text-blue-600 hover:bg-blue-50"
        onClick={() => navigate(`/buildings/${buildingId}/blocks/${block.id}/floors`)}
      >
        View Floors
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BlockCard;
