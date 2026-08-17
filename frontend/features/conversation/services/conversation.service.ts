import api from "@/lib/axios";
import type {
  Conversation,
  ConversationResponse,
  ConversationsResponse,
  Message,
  MessagesResponse,
  UnreadResponse,
} from "../types/conversation";

export async function createOrGetConversation(roomId: string): Promise<ConversationResponse> {
  const response = await api.post<ConversationResponse>(`/conversations/${roomId}`);
  return response.data;
}

export async function getMyConversations(): Promise<ConversationsResponse> {
  const response = await api.get<ConversationsResponse>("/conversations/my");
  return response.data;
}

export async function getConversation(conversationId: string): Promise<ConversationResponse> {
  const response = await api.get<ConversationResponse>(`/conversations/single/${conversationId}`);
  return response.data;
}

export async function getConversationMessages(
  conversationId: string,
  page = 1,
  limit = 30,
): Promise<MessagesResponse> {
  const response = await api.get<MessagesResponse>(
    `/conversations/messages/${conversationId}`,
    { params: { page, limit } },
  );
  return response.data;
}

export async function sendConversationMessage(
  conversationId: string,
  message: string,
): Promise<{ success: boolean; message: Message }> {
  const response = await api.post(`/conversations/messages/${conversationId}`, { message });
  return response.data;
}

export async function markConversationRead(conversationId: string) {
  const response = await api.patch(`/conversations/messages/${conversationId}/read`);
  return response.data;
}

export async function getUnreadCount(): Promise<UnreadResponse> {
  const response = await api.get<UnreadResponse>("/conversations/unread-count");
  return response.data;
}

export async function deleteConversationMessage(conversationId: string, messageId: string) {
  const response = await api.delete(`/conversations/messages/${conversationId}/${messageId}`);
  return response.data;
}

export function getUserId(value: Conversation["owner"] | Message["sender"]): string {
  return typeof value === "string" ? value : value._id;
}
