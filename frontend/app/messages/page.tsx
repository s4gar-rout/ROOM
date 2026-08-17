"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ConversationList from "@/features/conversation/components/ConversationList";
import ChatWindow from "@/features/conversation/components/ChatWindow";
import { getMyConversations } from "@/features/conversation/services/conversation.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Conversation, Message } from "@/features/conversation/types/conversation";
import { useConversationSocket } from "@/features/conversation/hooks/useConversationSocket";
import { chatStore } from "@/features/conversation/store";

export default function MessagesPage({ initialConversationId }: { initialConversationId?: string } = {}) {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await getMyConversations();
      const items = response.conversations || [];
      setConversations(items);
      setSelected((current) => {
        if (initialConversationId) return items.find((item) => item._id === initialConversationId) || current || null;
        return current ? (items.find((item) => item._id === current._id) || current) : null;
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login?redirect=/messages");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, initialConversationId]);

  useConversationSocket({
    enabled: isAuthenticated,
    onConversationUpdated: (payload) => {
      setConversations((current) => {
        const index = current.findIndex((c) => c._id === payload.conversationId);
        if (index === -1) {
          load();
          return current;
        }
        
        const isCurrentActive = payload.conversationId === chatStore.activeConversationId;
        const increment = isCurrentActive ? 0 : (payload.unreadIncrement || 0);

        const updated = {
          ...current[index],
          lastMessage: payload.lastMessage,
          lastMessageAt: payload.lastMessageAt,
          unreadCount: (current[index].unreadCount || 0) + increment,
        };

        const newArray = [...current];
        newArray.splice(index, 1);
        newArray.unshift(updated);
        return newArray;
      });
    },
    onConversationRead: (payload) => {
      setConversations((current) =>
        current.map((c) =>
          c._id === payload.conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    },
  });

  if (authLoading || !isAuthenticated || !user) {
    return <main className="min-h-screen bg-[#F8F4EA]"><Navbar /><div className="flex min-h-[70vh] items-center justify-center text-xs uppercase tracking-[0.2em] text-[#174D35]">Loading messages…</div></main>;
  }

  const updateConversation = (message: Message) => {
    setConversations((current) => {
      const index = current.findIndex((c) => c._id === message.conversation);
      if (index === -1) return current;
      
      const updated = {
        ...current[index],
        lastMessage: message.message,
        lastMessageAt: message.createdAt,
        unreadCount: 0,
      };

      const newArray = [...current];
      newArray.splice(index, 1);
      newArray.unshift(updated);
      return newArray;
    });
  };

  return (
    <main className="min-h-screen bg-[#F8F4EA]">
      <Navbar />
      <div className="mx-auto h-[calc(100vh-72px)] max-w-[1500px] p-0 sm:p-4 lg:p-6">
        <div className="flex h-full overflow-hidden border-y border-[#1C1B18]/10 bg-[#FFFDF8] sm:rounded-2xl sm:border">
          <div className={`h-full w-full md:block md:w-[340px] ${selected ? "hidden" : "block"}`}>
            <ConversationList conversations={conversations} selectedId={selected?._id} loading={loading} onSelect={(conversation) => setSelected(conversation)} />
          </div>
          <div className={`h-full min-w-0 flex-1 ${selected ? "block" : "hidden md:block"}`}>
            {selected ? (
              <ChatWindow conversation={selected} currentUser={user} onBack={() => setSelected(null)} onUpdated={updateConversation} />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <div><p className="font-serif text-4xl tracking-[-0.04em] text-[#1C1B18]">Your conversations</p><p className="mt-3 text-sm text-[#756B60]">Select a conversation to start chatting.</p></div>
              </div>
            )}
          </div>
        </div>
        {error ? <p className="mx-auto max-w-3xl py-2 text-center text-[10px] text-red-700">{error}</p> : null}
      </div>
    </main>
  );
}
