import MessagesPage from "../page";

export default async function ConversationRoute({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <MessagesPage initialConversationId={conversationId} />;
}
