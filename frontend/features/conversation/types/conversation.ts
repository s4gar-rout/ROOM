import type { User } from "@/types/auth.types";

export interface ConversationRoom {
  _id: string;
  title?: string;
  images?: Array<{ url?: string }> | string[];
  rent?: number;
  location?: string;
  availability?: boolean;
}

export interface Conversation {
  _id: string;
  room?: ConversationRoom | string | null;
  owner: User | string;
  buyer: User | string;
  otherUser?: User | null;
  lastMessage?: string;
  lastMessageAt?: string | null;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User | string;
  receiver: User | string;
  message: string;
  read: boolean;
  readAt?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  count: number;
  conversations: Conversation[];
}

export interface MessagesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  messages: Message[];
}

export interface ConversationResponse {
  success: boolean;
  message?: string;
  conversation: Conversation;
}

export interface UnreadResponse {
  success: boolean;
  unreadCount: number;
}
