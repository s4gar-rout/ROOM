import api from "@/lib/axios";
import type {
  Conversation,
  ConversationResponse,
  ConversationsResponse,
  Message,
  MessagesResponse,
  UnreadResponse,
} from "../types/conversation";
export { getUserId } from "../types/conversation";

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

/**
 * Delete a message.
 * scope="me"       → hidden only for the requesting user
 * scope="everyone" → shows "This message was deleted" to both (sender only)
 */
export async function deleteConversationMessage(
  conversationId: string,
  messageId: string,
  scope: "me" | "everyone" = "me",
) {
  const response = await api.delete(
    `/conversations/messages/${conversationId}/${messageId}`,
    { params: { scope } },
  );
  return response.data;
}

/**
 * Clear the conversation for the requesting user only.
 * Messages before the clear point are no longer visible to this user.
 * The other participant's history is unaffected.
 */
export async function clearConversation(conversationId: string) {
  const response = await api.delete(`/conversations/${conversationId}/clear`);
  return response.data;
}
