"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ArrowRight } from "lucide-react";
import type { Conversation } from "../types/conversation";
import { getMyConversations } from "../services/conversation.service";
import Avatar from "./Avatar";
import type { User } from "@/types/auth.types";
import { useConversationSocket } from "../hooks/useConversationSocket";
import { chatStore } from "../store";

function asUser(value: Conversation["otherUser"]): User | null {
  return value && typeof value !== "string" ? value : null;
}

export default function DashboardMessages() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const response = await getMyConversations();
      setConversations(response.conversations?.slice(0, 3) || []);
    } catch (err) {
      console.error("Failed to load dashboard messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  useConversationSocket({
    enabled: true,
    onConversationUpdated: (payload: any) => {
      if (payload.conversationId === chatStore.activeConversationId) return;
      load();
    },
    onNotification: (payload: any) => {
      if (payload.conversation === chatStore.activeConversationId) return;
      load();
    },
    onConversationRead: () => {
      load();
    },
    onMessage: (message) => {
      if (message.conversation === chatStore.activeConversationId) return;
      load();
    }
  });

  if (loading) {
    return (
      <div className="rounded-[18px] border border-[#1C1B18]/8 bg-[#F8F4EA] p-5">
        <div className="h-6 w-32 animate-pulse rounded bg-[#174D35]/10" />
        <div className="mt-4 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[#1C1B18]/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[#1C1B18]/10 bg-[#FFFDF8] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1C1B18]/10 px-5 py-4 bg-[#F8F4EA]">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-[#174D35]" />
          <h2 className="font-serif text-lg font-medium text-[#1C1B18]">Messages</h2>
        </div>
        <button
          onClick={() => router.push("/messages")}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#174D35] hover:text-[#174D35]/70 transition"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>

      <div className="divide-y divide-[#1C1B18]/5">
        {conversations.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="font-serif text-lg text-[#1C1B18]">No messages yet</p>
            <p className="mt-1 text-xs text-[#756B60]">When tenants contact you, your conversations will appear here.</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const other = asUser(conversation.otherUser);
            return (
              <button
                key={conversation._id}
                onClick={() => router.push(`/messages/${conversation._id}`)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#1C1B18]/4 transition-colors"
              >
                <Avatar user={other} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[#1C1B18]">{other?.username || "User"}</span>
                    {conversation.unreadCount ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#174D35] px-1.5 text-[9px] font-bold text-[#F8F4EA]">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount} unread
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8A8177]">
                        {new Date(conversation.lastMessageAt || conversation.createdAt || new Date()).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 block truncate text-xs text-[#756B60]">
                    {conversation.lastMessage || "Start the conversation"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
