import type { User } from "@/types/auth.types";

// ── Room as populated by the backend ──────────────────────────────────────
// Matches the ROOM_SELECT = "title images rent location availability" projection
// in conversation.controllers.js

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
  /**
   * Always populated after createConversation / getMyConversations.
   * May arrive as a bare ObjectId string for legacy edge cases, so we keep
   * the union — but components should type-narrow with `getRoomInfo()`.
   */
  room: ConversationRoom | string | null;
  owner: User | string;
  buyer: User | string;
  /** Derived by the backend formatConversation() helper — the other participant. */
  otherUser?: User | null;
  lastMessage?: string;
  lastMessageAt?: string | null;
  /** Derived unread count for the current user (owner or tenant). */
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
  isDeletedForEveryone?: boolean;
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

// ── Utility ────────────────────────────────────────────────────────────────

/**
 * Safely extract the populated room object from a conversation.
 * Returns null if room is missing or is still a bare ObjectId string.
 */
export function getRoomInfo(
  conversation: Conversation
): ConversationRoom | null {
  if (
    conversation.room &&
    typeof conversation.room === "object"
  ) {
    return conversation.room as ConversationRoom;
  }
  return null;
}
