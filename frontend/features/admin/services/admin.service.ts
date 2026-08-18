import api from "@/lib/axios";

export const getDashboardStats = async () => {
    const response = await api.get("/admin/stats");
    return response.data.stats;
};

export const getAllUsers = async (page = 1, limit = 10, search = "") => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return response.data;
};

export const getAllRooms = async (page = 1, limit = 10, search = "") => {
    const response = await api.get(`/admin/rooms?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return response.data;
};

export const blockUser = async (userId: string) => {
    const response = await api.patch(`/admin/users/${userId}/block`);
    return response.data;
};

export const unblockUser = async (userId: string) => {
    const response = await api.patch(`/admin/users/${userId}/unblock`);
    return response.data;
};

export const deleteRoom = async (roomId: string) => {
    const response = await api.delete(`/admin/rooms/${roomId}`);
    return response.data;
};
