
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FloorCardProps {
  id: string;
  name: string;
  roomCount: number;
  buildingId?: string;
  blockId?: string;
  isEditMode: boolean;
  editRoomCount: number;
  editFloorId: string | null;
  onDelete: () => void;
  onEditRoomCount: () => void;
  onSaveRoomCount: () => void;
  onEditRoomCountChange: (count: number) => void;
  isPending: boolean;
}

const FloorCard = ({
  id,
  name,
  roomCount,
  buildingId,
  blockId,
  isEditMode,
  editRoomCount,
  editFloorId,
  onDelete,
  onEditRoomCount,
  onSaveRoomCount,
  onEditRoomCountChange,
  isPending
}: FloorCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-green-100 mr-3">
            <Layers className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <div className="flex items-center">
              {isEditMode && id === editFloorId ? (
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    value={editRoomCount}
                    onChange={(e) => onEditRoomCountChange(parseInt(e.target.value) || 0)}
                    className="w-16 h-7 p-1 text-sm" 
                  />
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={onSaveRoomCount}
                    disabled={isPending}
                  >
                    {isPending ? '...' : 'Save'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 cursor-pointer hover:underline" onClick={onEditRoomCount}>
                  {roomCount} Rooms
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Button
        variant="ghost"
        className="w-full mt-4 justify-between text-green-600 hover:bg-green-50"
        onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${id}/rooms`)}
      >
        View Rooms
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FloorCard;
