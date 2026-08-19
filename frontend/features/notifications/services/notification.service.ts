import api from "@/lib/axios";

export interface NotificationItem {
  _id: string;
  user: string;
  sender?: {
    _id: string;
    username: string;
    email: string;
    avatar?: {
      url: string;
    };
  };
  room?: {
    _id: string;
    title: string;
    rent: number;
    location?: string;
    images?: Array<{ url: string }>;
  };
  conversation?: string;
  message?: {
    _id: string;
    message: string;
    createdAt: string;
  };
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  readAt?: string | null;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  notifications: NotificationItem[];
}

export const getMyNotifications = async (): Promise<NotificationsResponse> => {
  const response = await api.get<NotificationsResponse>("/notifications");
  return response.data;
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.patch<{ success: boolean; message?: string }>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};
