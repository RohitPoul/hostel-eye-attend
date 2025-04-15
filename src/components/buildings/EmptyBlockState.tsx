
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

interface EmptyBlockStateProps {
  onAddBlock?: () => void;
}

const EmptyBlockState = ({ onAddBlock }: EmptyBlockStateProps) => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-gray-100">
          <Layers className="h-6 w-6 text-gray-400" />
        </div>
      </div>
      <h3 className="font-medium text-lg mb-2">No Blocks Found</h3>
      <p className="text-gray-500 mb-4">
        This building doesn't have any blocks yet.
      </p>
      
      {onAddBlock && (
        <Button 
          onClick={onAddBlock}
          className="mt-2"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Block
        </Button>
      )}
    </div>
  );
};

export default EmptyBlockState;
