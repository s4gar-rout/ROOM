import api from "@/lib/axios";

import type {
  MyRoomsResponse,
  RoomActionResponse,
  AllRoomsResponse,
  Room,
} from "../types/rental";

// ==========================================
// CREATE ROOM
// ==========================================

export async function createRoom(data: {
  title: string;
  description: string;
  rent: number;
  location: string;
  roomType:
    | "single"
    | "double"
    | "3BHK"
    | "1BHK"
    | "2BHK";
  facilities: string[];
  images: File[];
}) {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("rent", String(data.rent));
  formData.append("location", data.location);
  formData.append("roomType", data.roomType);

  formData.append(
    "facilities",
    JSON.stringify(data.facilities)
  );

  data.images.forEach((image) => {
    formData.append("images", image);
  });

  const response =
    await api.post<RoomActionResponse>(
      "/rooms/listings",
      formData
    );

  return response.data;
}

// ==========================================
// GET ALL ROOMS
// ==========================================

export interface GetRoomsParams {
  location?: string;
  roomType?: Room["roomType"];
  minRent?: number;
  maxRent?: number;
  availability?: boolean;
  search?: string;
  sort?: "rentAsc" | "rentDesc" | "oldest" | "newest";
  page?: number;
  limit?: number;
}

export async function getAllRooms(
  params?: GetRoomsParams
): Promise<AllRoomsResponse> {
  const response = await api.get<AllRoomsResponse>(
    "/rooms/getall",
    {
      params,
    }
  );

  return response.data;
}

// ==========================================
// GET MY ROOMS
// ==========================================

export async function getMyRooms(): Promise<
  MyRoomsResponse["rooms"]
> {
  const response =
    await api.get<MyRoomsResponse>(
      "/rooms/my-rooms"
    );

  return response.data.rooms || [];
}

// ==========================================
// UPDATE ROOM
// ==========================================

export async function getSingleRoom(
  roomId: string
): Promise<RoomActionResponse> {
  const response = await api.get<RoomActionResponse>(
    `/rooms/single/${roomId}`
  );
  return response.data;
}

// ==========================================
// UPDATE ROOM
// ==========================================

export async function updateRoom(
  roomId: string,
  data: {
    title?: string;
    description?: string;
    rent?: number;
    location?: string;
    roomType?:
      | "single"
      | "double"
      | "3BHK"
      | "1BHK"
      | "2BHK";
    facilities?: string[];
    availability?: boolean;
    images?: File[];
  }
) {
  let payload: FormData | Record<string, unknown> = data as Record<string, unknown>;

  if (data.images && data.images.length > 0) {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.rent !== undefined) formData.append("rent", String(data.rent));
    if (data.location !== undefined) formData.append("location", data.location);
    if (data.roomType !== undefined) formData.append("roomType", data.roomType);
    if (data.facilities !== undefined) {
      formData.append("facilities", JSON.stringify(data.facilities));
    }
    if (data.availability !== undefined) {
      formData.append("availability", String(data.availability));
    }
    data.images.forEach((image) => {
      formData.append("images", image);
    });
    payload = formData;
  }

  const response =
    await api.patch<RoomActionResponse>(
      `/rooms/update/${roomId}`,
      payload
    );

  return response.data;
}

// ==========================================
// DELETE ROOM IMAGE
// ==========================================

export async function deleteRoomImage(
  roomId: string,
  fileId: string
): Promise<RoomActionResponse> {
  const response = await api.delete<RoomActionResponse>(
    `/rooms/delete-image/${roomId}/${fileId}`
  );
  return response.data;
}

// ==========================================
// UPDATE AVAILABILITY
// ==========================================

export async function updateRoomAvailability(
  roomId: string,
  availability: boolean
) {
  const response =
    await api.patch<RoomActionResponse>(
      `/rooms/update-availability/${roomId}`,
      {
        availability,
      }
    );

  return response.data;
}

// ==========================================
// DELETE ROOM
// ==========================================

export async function deleteRoom(
  roomId: string
) {
  const response =
    await api.delete<RoomActionResponse>(
      `/rooms/delete/${roomId}`
    );

  return response.data;
}