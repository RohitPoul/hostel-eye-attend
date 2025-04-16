
import { Layers } from 'lucide-react';

const EmptyFloorState = () => {
  return (
    <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No Floors Found</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        There are no floors created for this block yet.
      </p>
    </div>
  );
};

export default EmptyFloorState;
