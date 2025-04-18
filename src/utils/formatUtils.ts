
export const getFloorName = (floorId: string | undefined) => {
  if (!floorId) return '';
  return "Floor";
};

export const formatFloorNumber = (floorNumber: number | undefined | null) => {
  if (floorNumber === undefined || floorNumber === null) return '';
  
  const num = parseInt(floorNumber.toString());
  if (isNaN(num)) return '';
  
  const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
  return `${num}${suffix} Floor`;
};
