
import { Layers } from 'lucide-react';

const EmptyBlockState = () => {
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
    </div>
  );
};

export default EmptyBlockState;
