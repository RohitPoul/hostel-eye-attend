
import { useState } from 'react';

export const useCalendarFilters = () => {
  const [filterBuilding, setFilterBuilding] = useState<string | null>(null);
  const [filterBlock, setFilterBlock] = useState<string | null>(null);
  const [filterFloor, setFilterFloor] = useState<string | null>(null);
  const [filterRoom, setFilterRoom] = useState<string | null>(null);

  const resetFilters = () => {
    setFilterBuilding(null);
    setFilterBlock(null);
    setFilterFloor(null);
    setFilterRoom(null);
  };

  return {
    filterBuilding,
    filterBlock,
    filterFloor,
    filterRoom,
    setFilterBuilding,
    setFilterBlock,
    setFilterFloor,
    setFilterRoom,
    resetFilters,
  };
};
