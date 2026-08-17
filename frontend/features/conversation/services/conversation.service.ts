import api from "@/lib/axios";

export interface ConversationResponse {
  success: boolean;
  message: string;
  conversation: any; // We can type this strictly later if needed
}

// ==========================================
// START OR GET CONVERSATION
// ==========================================

export async function createOrGetConversation(
  roomId: string
): Promise<ConversationResponse> {
  const response = await api.post<ConversationResponse>(
    `/conversations/${roomId}`
  );
  return response.data;
}
