
// Define student-related types
export type Student = {
  id: string;
  name: string;
  registration_no: string;
  phone_number: string;
  parent_phone_number: string | null;
  building_name: string;
  block_name: string;
  floor_number: number;
  room_number: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export interface StudentFormProps {
  isEditing?: boolean;
  studentId?: string;
  buildingId?: string;
  blockId?: string;
  floorId?: string;
  roomId?: string;
}
