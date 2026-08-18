import type { User } from "@/types/auth.types";

// ── Room as populated by the backend ──────────────────────────────────────

export interface ConversationRoom {
  _id: string;
  title: string;
  rent: number;
  location: string;
  availability: boolean;
  images: Array<{ url: string; fileId?: string }>;
}

// ── Core models ────────────────────────────────────────────────────────────

export interface Conversation {
  _id: string;
  room: ConversationRoom | string | null;
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
  /**
   * Legacy flag. Treat as isDeletedForEveryone on the frontend.
   * The backend normalises this before sending, but kept for safety.
   */
  isDeleted?: boolean;
  /**
   * True when the sender deleted this message for everyone.
   * Both participants see "This message was deleted".
   */
  isDeletedForEveryone?: boolean;
  /**
   * Array of userIds who chose "Delete for me".
   * The backend already filters these out before sending, but the field
   * may arrive for optimistic-UI purposes in real-time payloads.
   */
  deletedFor?: string[];
  createdAt: string;
  updatedAt: string;
}

// ── API response shapes ────────────────────────────────────────────────────

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

// ── Utilities ──────────────────────────────────────────────────────────────

/**
 * Safely extract the populated room object from a conversation.
 * Returns null if room is missing or is still a bare ObjectId string.
 */
export function getRoomInfo(
  conversation: Conversation
): ConversationRoom | null {
  if (conversation.room && typeof conversation.room === "object") {
    return conversation.room as ConversationRoom;
  }
  return null;
}

/**
 * Normalise a populated user or bare ObjectId string into a string ID.
 */
export function getUserId(
  value: Conversation["owner"] | Message["sender"]
): string {
  return typeof value === "string" ? value : (value as User)._id;
}
