// ==========================================
// ROOM IMAGE
// ==========================================

export interface RoomImage {
  url: string;
  fileId: string;
}

// ==========================================
// ROOM OWNER
// ==========================================

export interface RoomOwner {
  _id: string;
  username: string;
}

// ==========================================
// ROOM
// ==========================================

export interface Room {
  _id: string;

  owner: RoomOwner | string;

  title: string;
  description: string;

  rent: number;

  location: string;

  roomType:
    | "single"
    | "double"
    | "shared"
    | "1BHK"
    | "2BHK";

  facilities: string[];

  images: RoomImage[];

  availability: boolean;

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// GET MY ROOMS
// ==========================================

export interface MyRoomsResponse {
  success: boolean;
  message?: string;
  rooms: Room[];
}

// ==========================================
// ROOM ACTION
// ==========================================

export interface RoomActionResponse {
  success: boolean;
  message: string;
  room?: Room;
}

// ==========================================
// ALL ROOMS RESPONSE
// ==========================================

export interface AllRoomsResponse {
  success: boolean;
  message?: string;
  rooms: Room[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}