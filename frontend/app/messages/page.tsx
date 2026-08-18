"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ConversationList from "@/features/conversation/components/ConversationList";
import ChatWindow from "@/features/conversation/components/ChatWindow";
import { getMyConversations } from "@/features/conversation/services/conversation.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type {
  Conversation,
  Message,
} from "@/features/conversation/types/conversation";
import { useConversationSocket } from "@/features/conversation/hooks/useConversationSocket";
import { chatStore } from "@/features/conversation/store";
import { MessageSquare, AlertCircle, Loader2 } from "lucide-react";

export default function MessagesPage({
  initialConversationId,
}: {
  initialConversationId?: string;
} = {}) {
  const router = useRouter();

  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyConversations();
      const items = response.conversations || [];
      setConversations(items);
      setSelected((current) => {
        if (initialConversationId) {
          return (
            items.find((item) => item._id === initialConversationId) ||
            current ||
            null
          );
        }
        return current
          ? items.find((item) => item._id === current._id) || current
          : null;
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Unable to load conversations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/messages");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated, load]);

  const handleConversationUpdated = useCallback(
    (payload: {
      conversationId: string;
      lastMessage?: string;
      lastMessageAt?: string;
      unreadIncrement?: number;
    }) => {
      setConversations((current) => {
        const index = current.findIndex((c) => c._id === payload.conversationId);
        if (index === -1) {
          load();
          return current;
        }
        const isCurrentActive =
          payload.conversationId === chatStore.activeConversationId;
        const increment = isCurrentActive ? 0 : payload.unreadIncrement || 0;
        const updated: Conversation = {
          ...current[index],
          lastMessage: payload.lastMessage,
          lastMessageAt: payload.lastMessageAt,
          unreadCount: (current[index].unreadCount || 0) + increment,
        };
        const next = [...current];
        next.splice(index, 1);
        next.unshift(updated);
        return next;
      });
    },
    [load]
  );

  const handleConversationRead = useCallback(
    (payload: { conversationId: string }) => {
      setConversations((current) =>
        current.map((c) =>
          c._id === payload.conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    },
    []
  );

  const handleMessageDeletedForEveryone = useCallback(
    (payload: { conversationId: string; messageId: string; lastMessage?: string; lastMessageAt?: string }) => {
      if (payload.lastMessage !== undefined && payload.lastMessageAt !== undefined) {
        setConversations((current) => {
          const index = current.findIndex((c) => c._id === payload.conversationId);
          if (index === -1) return current;

          const updated: Conversation = {
            ...current[index],
            lastMessage: payload.lastMessage!,
            lastMessageAt: payload.lastMessageAt!,
          };

          const next = [...current];
          next[index] = updated;
          
          // Re-sort by lastMessageAt
          next.sort((a, b) =>
              (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0) - (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0)
          );

          return next;
        });
      }
    },
    []
  );

  const handleConversationCleared = useCallback(
    (payload: { conversationId: string; clearedAt: string }) => {
      setConversations((current) => {
        const index = current.findIndex((c) => c._id === payload.conversationId);
        if (index === -1) return current;

        const conv = current[index];
        // If the cleared timestamp is newer or equal to the last message, the preview should be cleared
        if (conv.lastMessageAt && new Date(conv.lastMessageAt).getTime() <= new Date(payload.clearedAt).getTime()) {
          const updated: Conversation = {
            ...conv,
            lastMessage: "",
          };

          const next = [...current];
          next[index] = updated;
          return next;
        }

        return current;
      });
    },
    []
  );



  const executeRemoveConversation = async () => {
    if (!confirmRemoveId) return;
    try {
      setRemoveLoading(true);
      const { clearConversation } = await import("@/features/conversation/services/conversation.service");
      await clearConversation(confirmRemoveId);
      if (selected?._id === confirmRemoveId) setSelected(null);
      setConfirmRemoveId(null);
    } catch (err) {
      console.error("Failed to remove conversation", err);
      setError("Failed to clear conversation");
    } finally {
      setRemoveLoading(false);
    }
  };


  useConversationSocket({
    enabled: isAuthenticated,
    onConversationUpdated: handleConversationUpdated,
    onConversationRead: handleConversationRead,
    onMessageDeletedForEveryone: handleMessageDeletedForEveryone,
    onConversationCleared: handleConversationCleared,
  });

  // ── Loading / auth gate ──────────────────────────────────────────────────
  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-[#F8F4EA]">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#174D35]">
            Loading messages…
          </span>
        </div>
      </div>
    );
  }

  // ── Handlers passed down ─────────────────────────────────────────────────
  const updateConversation = (message: Message) => {
    setConversations((current) => {
      const index = current.findIndex((c) => c._id === message.conversation);
      if (index === -1) return current;
      const updated: Conversation = {
        ...current[index],
        lastMessage: message.message,
        lastMessageAt: message.createdAt,
        unreadCount: 0,
      };
      const next = [...current];
      next.splice(index, 1);
      next.unshift(updated);
      return next;
    });
  };

  const handleConversationDeleted = () => {
    if (!selected) return;
    setConversations((current) =>
      current.filter((c) => c._id !== selected._id)
    );
    setSelected(null);
  };

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    /*
     * `overflow-hidden` on main prevents the page itself from ever scrolling.
     * `h-dvh` uses the dynamic viewport height so mobile browser chrome is
     * accounted for correctly (avoids the classic 100vh iOS issue).
     */
    <div className="flex h-dvh flex-col overflow-hidden bg-[#F8F4EA]">
      <Navbar />

      {/* Chat shell — grows to fill the remaining viewport */}
      <div className="flex min-h-0 flex-1 px-0 py-0 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <div
          className="
            mx-auto flex w-full max-w-[1400px] min-h-0 overflow-hidden
            border-y border-[#1C1B18]/10
            bg-[#FFFDF8]
            sm:rounded-[18px] sm:border
          "
        >
          {/* ── LEFT SIDEBAR ── */}
          <div
            className={`
              h-full w-full shrink-0 min-w-0
              border-r border-[#1C1B18]/10
              md:w-[340px] lg:w-[380px]
              ${selected ? "hidden md:flex md:flex-col" : "flex flex-col"}
            `}
          >
            <ConversationList
              conversations={conversations}
              selectedId={selected?._id}
              loading={loading}
              onSelect={setSelected}
              confirmRemoveId={confirmRemoveId}
              onRemoveRequest={setConfirmRemoveId}
              onRemoveCancel={() => setConfirmRemoveId(null)}
              onRemoveConfirm={executeRemoveConversation}
              removeLoading={removeLoading}
            />
          </div>

          {/* ── RIGHT CHAT ── */}
          <div
            className={`
              min-w-0 flex-1 flex-col
              ${selected ? "flex" : "hidden md:flex"}
            `}
          >
            {selected ? (
              <ChatWindow
                conversation={selected}
                currentUser={user}
                onBack={() => setSelected(null)}
                onUpdated={updateConversation}
                onDeleted={handleConversationDeleted}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center bg-[#F8F4EA] px-6">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#174D35]/[0.08]">
                    <MessageSquare
                      size={20}
                      strokeWidth={1.5}
                      className="text-[#174D35]"
                    />
                  </div>
                  <h2 className="font-serif text-[28px] tracking-[-0.035em] text-[#1C1B18]">
                    Your messages
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#756B60]">
                    Conversations about your next place will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global error toast — sits outside the chat shell */}
      {error && (
        <div className="fixed left-1/2 top-4 z-[300] -translate-x-1/2 px-4 pointer-events-none w-full max-w-sm">
          <div
            role="alert"
            className="mx-auto flex w-max items-center gap-2 rounded-[16px] border border-[#E8E3D6] bg-[#FFFDF8] px-4 py-2.5 shadow-[0_8px_30px_rgba(28,27,24,0.12)] animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <AlertCircle size={16} className="text-[#A53B32] shrink-0" />
            <p className="text-[13px] font-medium text-[#1C1B18]">{error}</p>
          </div>
        </div>
      )}


    </div>
  );
}
