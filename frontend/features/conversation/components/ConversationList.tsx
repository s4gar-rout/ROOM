"use client";

import type { Conversation } from "../types/conversation";
import Avatar from "./Avatar";
import type { User } from "@/types/auth.types";

function asUser(value: Conversation["otherUser"]): User | null {
  return value && typeof value !== "string" ? value : null;
}

function roomTitle(room: Conversation["room"]) {
  if (!room || typeof room === "string") return "Room conversation";
  return room.title || "Room conversation";
}

export default function ConversationList({
  conversations,
  selectedId,
  loading,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId?: string;
  loading?: boolean;
  onSelect: (conversation: Conversation) => void;
}) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-[#1C1B18]/10 bg-[#FFFDF8] md:w-[340px]">
      <div className="border-b border-[#1C1B18]/10 px-5 py-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#174D35]">Messages</p>
        <h2 className="mt-1 font-serif text-2xl tracking-[-0.03em] text-[#1C1B18]">Conversations</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-[#1C1B18]/5" />)}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-xl text-[#1C1B18]">No conversations yet.</p>
            <p className="mt-2 text-xs leading-5 text-[#756B60]">Start a chat from an available room.</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const other = asUser(conversation.otherUser);
            const selected = selectedId === conversation._id;
            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => onSelect(conversation)}
                className={`flex w-full items-center gap-3 border-b border-[#1C1B18]/7 px-4 py-4 text-left transition-colors ${selected ? "bg-[#174D35]/7" : "hover:bg-[#1C1B18]/4"}`}
              >
                <Avatar user={other} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[#1C1B18]">{other?.username || "User"}</span>
                    {conversation.unreadCount ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#174D35] px-1.5 text-[9px] font-bold text-[#F8F4EA]">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] uppercase tracking-[0.1em] text-[#174D35]">{roomTitle(conversation.room)}</span>
                  <span className="mt-1 block truncate text-xs text-[#756B60]">{conversation.lastMessage || "Start the conversation"}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
