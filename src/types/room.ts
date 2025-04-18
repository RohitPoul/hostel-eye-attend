
export interface RoomProps {
  id: string;
  name: string;
  floor_id: number;
  block_id: string;
  created_at: string;
  updated_at: string;
  students?: StudentProps[];
}

export interface StudentProps {
  id: string;
  name: string;
  registration_no: string;
  photo_url: string | null;
  phone_number: string;
}

export interface BuildingData {
  id: string;
  name: string;
}

export interface BlockData {
  id: string;
  name: string;
  building_id: string;
}

export interface FloorData {
  id: string;
  block_id: string;
  floor_number: number;
}

export interface AttendanceRecord {
  id: string;
  student_id: string | null;
  status: string;
  date: string;
  room_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
}
