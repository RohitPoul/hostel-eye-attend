
import { useState } from 'react';
import { FloorProps } from './use-floor-data';

export const useFloorState = () => {
  const [floors, setFloors] = useState<FloorProps[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<FloorProps | null>(null);
  const [password, setPassword] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFloorId, setEditFloorId] = useState<string | null>(null);
  const [editRoomCount, setEditRoomCount] = useState<number>(0);

  const handleDeleteClick = (floor: FloorProps) => {
    setFloorToDelete(floor);
    setPassword('');
    setIsDeleteDialogOpen(true);
  };

  const handleEditRoomCount = (floor: FloorProps) => {
    setEditFloorId(floor.id);
    setEditRoomCount(floor.roomCount);
    setIsEditMode(true);
  };

  const resetEditMode = () => {
    setIsEditMode(false);
    setEditFloorId(null);
  };

  return {
    floors,
    setFloors,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    floorToDelete,
    setFloorToDelete,
    password,
    setPassword,
    isEditMode,
    setIsEditMode,
    editFloorId,
    setEditFloorId,
    editRoomCount,
    setEditRoomCount,
    handleDeleteClick,
    handleEditRoomCount,
    resetEditMode
  };
};
