"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Loader2, Send, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import type { User } from "@/types/auth.types";
import type { Conversation, Message } from "../types/conversation";
import { getRoomInfo, getUserId } from "../types/conversation";
import {
  clearConversation,
  deleteConversationMessage,
  getConversationMessages,
  markConversationRead,
  sendConversationMessage,
} from "../services/conversation.service";
import { useConversationSocket } from "../hooks/useConversationSocket";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import { chatStore } from "../store";

// ── Helpers ────────────────────────────────────────────────────────────────

function getOtherUser(conversation: Conversation): User | null {
  return conversation.otherUser &&
    typeof conversation.otherUser !== "string"
    ? conversation.otherUser
    : null;
}

function getRoomName(conversation: Conversation): string {
  if (!conversation.room || typeof conversation.room === "string")
    return "Room conversation";
  return conversation.room.title || "Room conversation";
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ChatWindow({
  conversation,
  currentUser,
  onBack,
  onUpdated,
}: {
  conversation: Conversation;
  currentUser: User;
  onBack?: () => void;
  onUpdated?: (message: Message) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [isTypingState, setIsTypingState] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [profileImageOpen, setProfileImageOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef(new Set<string>());
  const isNearBottom = useRef(true);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const moreTriggerRef = useRef<HTMLButtonElement | null>(null);

  const other = useMemo(() => getOtherUser(conversation), [conversation]);

  // Derived room info
  const roomInfo = getRoomInfo(conversation);
  const roomId =
    roomInfo?._id ??
    (typeof conversation.room === "string" ? conversation.room : null);
  const roomLabel = roomInfo?.title ?? getRoomName(conversation);
  const roomMeta = [
    roomInfo?.rent ? `₹${roomInfo.rent.toLocaleString("en-IN")}/mo` : null,
    roomInfo?.location ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  // ── Scroll ─────────────────────────────────────────────────────────────

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isNearBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= 120;
  }, []);

  // ── More header menu — outside click close ──────────────────────────────

  useEffect(() => {
    if (!showMoreMenu) return;
    const handle = (e: PointerEvent) => {
      const t = e.target as Node;
      if (
        !moreMenuRef.current?.contains(t) &&
        !moreTriggerRef.current?.contains(t)
      ) {
        setShowMoreMenu(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMoreMenu(false);
    };
    document.addEventListener("pointerdown", handle);
    document.addEventListener("keydown", esc as unknown as EventListener);
    return () => {
      document.removeEventListener("pointerdown", handle);
      document.removeEventListener("keydown", esc as unknown as EventListener);
    };
  }, [showMoreMenu]);

  // ── Socket ─────────────────────────────────────────────────────────────

  const markReadRef = useRef<(() => void) | null>(null);

  const { send: socketSend, markRead, setTyping } = useConversationSocket({
    conversationId: conversation._id,

    onMessage: useCallback(
      (message: Message) => {
        if (message.conversation !== conversation._id) return;
        setMessages((current) => {
          if (current.some((m) => m._id === message._id)) return current;
          seenIds.current.add(message._id);
          return [...current, message];
        });
        onUpdated?.(message);
        if (getUserId(message.sender) !== currentUser._id) markReadRef.current?.();
        if (isNearBottom.current) {
          requestAnimationFrame(() => scrollToBottom("smooth"));
        }
      },
      [conversation._id, currentUser._id, onUpdated, scrollToBottom]
    ),

    onRead: useCallback(
      (payload: { conversationId: string; readBy: string; readAt: string }) => {
        if (payload.conversationId !== conversation._id) return;
        setMessages((current) =>
          current.map((m) =>
            getUserId(m.sender) === currentUser._id
              ? { ...m, read: true, readAt: payload.readAt }
              : m
          )
        );
      },
      [conversation._id, currentUser._id]
    ),

    onTyping: useCallback(
      (typing: boolean, userId: string) => {
        if (userId === currentUser._id) return;
        setTypingUserId(typing ? userId : null);
      },
      [currentUser._id]
    ),

    // Legacy: treat the same as "delete for everyone".
    onMessageDeleted: useCallback(
      (payload: { conversationId: string; messageId: string }) => {
        if (payload.conversationId !== conversation._id) return;
        setMessages((current) =>
          current.map((m) =>
            m._id === payload.messageId
              ? { ...m, isDeletedForEveryone: true }
              : m
          )
        );
      },
      [conversation._id]
    ),

    // "Delete for me" — only this user receives this event.
    onMessageDeletedForMe: useCallback(
      (payload: { conversationId: string; messageId: string }) => {
        if (payload.conversationId !== conversation._id) return;
        // Remove from local state entirely (it's invisible to this user).
        setMessages((current) =>
          current.filter((m) => m._id !== payload.messageId)
        );
      },
      [conversation._id]
    ),

    // "Delete for everyone" — both users receive this event.
    onMessageDeletedForEveryone: useCallback(
      (payload: { conversationId: string; messageId: string }) => {
        if (payload.conversationId !== conversation._id) return;
        setMessages((current) =>
          current.map((m) =>
            m._id === payload.messageId
              ? { ...m, isDeletedForEveryone: true }
              : m
          )
        );
      },
      [conversation._id]
    ),

    // "Conversation cleared" — only this user receives this, clears messages.
    onConversationCleared: useCallback(
      (payload: { conversationId: string; clearedAt: string }) => {
        if (payload.conversationId !== conversation._id) return;
        // Remove all messages that were sent before clearedAt.
        const clearedAt = new Date(payload.clearedAt).getTime();
        setMessages((current) =>
          current.filter(
            (m) => new Date(m.createdAt).getTime() > clearedAt
          )
        );
      },
      [conversation._id]
    ),

    onError: useCallback((msg: string) => showToast(msg, "error"), [showToast]),
  });

  useEffect(() => {
    markReadRef.current = markRead;
  }, [markRead]);

  // ── Load messages ─────────────────────────────────────────────────────

  useEffect(() => {
    chatStore.activeConversationId = conversation._id;
    let active = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
    seenIds.current.clear();
    setLoading(true);
    setTypingUserId(null);
    setText("");
    setIsTypingState(false);

    getConversationMessages(conversation._id, 1, 50)
      .then((response) => {
        if (!active) return;
        const incoming = response.messages || [];
        incoming.forEach((m) => seenIds.current.add(m._id));
        setMessages(incoming);
        markConversationRead(conversation._id).catch(() => undefined);
        markRead();
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Unable to load messages";
        showToast(msg, "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (chatStore.activeConversationId === conversation._id) {
        chatStore.activeConversationId = null;
      }
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
        typingTimer.current = null;
      }
    };
  }, [conversation._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const value = text.trim();
    if (!value || sending) return;

    setSending(true);

    if (typingTimer.current) clearTimeout(typingTimer.current);
    setTyping(false);
    setIsTypingState(false);

    const sentBySocket = socketSend(value);
    if (sentBySocket) {
      setText("");
      setSending(false);
      requestAnimationFrame(() => scrollToBottom("smooth"));
      return;
    }

    try {
      const response = await sendConversationMessage(conversation._id, value);
      const msg = response.message;
      setMessages((current) => {
        if (current.some((m) => m._id === msg._id)) return current;
        seenIds.current.add(msg._id);
        return [...current, msg];
      });
      onUpdated?.(msg);
      setText("");
      requestAnimationFrame(() => scrollToBottom("smooth"));
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Message could not be sent";
      showToast(errMsg, "error");
    } finally {
      setSending(false);
    }
  };

  const handleChange = (value: string) => {
    setText(value);
    const isCurrentlyTyping = Boolean(value.trim());
    if (isCurrentlyTyping && !isTypingState) {
      setIsTypingState(true);
      setTyping(true);
    } else if (!isCurrentlyTyping && isTypingState) {
      setIsTypingState(false);
      setTyping(false);
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (isCurrentlyTyping) {
      typingTimer.current = setTimeout(() => {
        setIsTypingState(false);
        setTyping(false);
      }, 2000);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  // ── Delete for me ──────────────────────────────────────────────────────

  const handleDeleteForMe = useCallback(
    async (messageId: string) => {
      // Optimistic: remove from local state immediately.
      setMessages((current) =>
        current.filter((m) => m._id !== messageId)
      );
      try {
        await deleteConversationMessage(conversation._id, messageId, "me");
        showToast("Message deleted for me", "success");
      } catch (err: unknown) {
        // Rollback is complex — for now just show the error.
        const msg =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Failed to delete message";
        showToast(msg, "error");
      }
    },
    [conversation._id, showToast]
  );

  // ── Delete for everyone ────────────────────────────────────────────────

  const handleDeleteForEveryone = useCallback(
    async (messageId: string) => {
      // Optimistic: show tombstone immediately.
      setMessages((current) =>
        current.map((m) =>
          m._id === messageId ? { ...m, isDeletedForEveryone: true } : m
        )
      );
      try {
        await deleteConversationMessage(conversation._id, messageId, "everyone");
      } catch (err: unknown) {
        // Rollback tombstone on error.
        setMessages((current) =>
          current.map((m) =>
            m._id === messageId ? { ...m, isDeletedForEveryone: false } : m
          )
        );
        const msg =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Failed to delete message";
        showToast(msg, "error");
      }
    },
    [conversation._id, showToast]
  );

  // ── Clear conversation ─────────────────────────────────────────────────

  const handleClearConversation = async () => {
    setClearLoading(true);
    setClearConfirmOpen(false);
    setShowMoreMenu(false);
    try {
      const result = await clearConversation(conversation._id);
      // Remove all messages before the clearedAt timestamp.
      const clearedAt = new Date(result.clearedAt).getTime();
      setMessages((current) =>
        current.filter(
          (m) => new Date(m.createdAt).getTime() > clearedAt
        )
      );
      showToast("Conversation cleared", "success");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to clear conversation";
      showToast(msg, "error");
    } finally {
      setClearLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Chat window">

      {/* ── Header ── */}
      <header className="flex shrink-0 items-start gap-3 border-b border-[#1C1B18]/10 bg-[#FFFDF8] px-3 py-3 sm:px-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="mt-0.5 shrink-0 rounded-full p-2 text-[#1C1B18] hover:bg-[#1C1B18]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D35]/50 md:hidden"
          >
            <ArrowLeft size={18} aria-hidden />
          </button>
        )}

        <button
          type="button"
          onClick={() => setProfileImageOpen(true)}
          className="mt-0.5 shrink-0 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D35]/50 rounded-full"
          aria-label="View profile image"
        >
          <Avatar user={other} size={38} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#1C1B18]">
            {other?.username || "User"}
          </p>

          {/* Room context link */}
          {roomId ? (
            <Link
              href={`/rentals/${roomId}`}
              aria-label={`View listing: ${roomLabel}`}
              className="
                mt-0.5 flex min-w-0 items-center gap-1
                rounded text-[10px]
                hover:underline
                focus-visible:outline-none focus-visible:ring-1
                focus-visible:ring-[#174D35]/40
              "
            >
              <Home size={9} className="shrink-0 text-[#174D35]" aria-hidden />
              <span className="truncate font-medium text-[#174D35]">
                {roomLabel}
              </span>
              {roomMeta && (
                <span className="shrink-0 text-[#8A8177]">· {roomMeta}</span>
              )}
            </Link>
          ) : (
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] text-[#174D35]">
              <Home size={9} className="shrink-0" aria-hidden />
              <span className="truncate font-medium">{roomLabel}</span>
            </p>
          )}

          {typingUserId && (
            <p className="mt-0.5 text-[10px] text-[#756B60]" aria-live="polite">
              typing…
            </p>
          )}
        </div>

        {/* Remove chat / Clear conversation */}
        <div className="relative flex items-center">
          <button
            type="button"
            aria-label="Remove conversation"
            onClick={() => setClearConfirmOpen(true)}
            disabled={clearLoading}
            className="mt-0.5 shrink-0 rounded-full p-2 text-[#756B60] hover:bg-[#1C1B18]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D35]/50 disabled:opacity-50"
          >
            <Trash2 size={18} aria-hidden />
          </button>

          {clearConfirmOpen && (
            <>
              {/* Invisible backdrop */}
              <div 
                className="fixed inset-0 z-[200]" 
                onClick={() => setClearConfirmOpen(false)} 
              />
              {/* Popover */}
              <div className="absolute right-0 top-full mt-2 z-[210] w-[240px] rounded-xl border border-[#E8E3D6] bg-[#FFFDF8] p-4 shadow-[0_4px_20px_rgba(28,27,24,0.1)] animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[14px] font-semibold text-[#1C1B18]">Clear this chat?</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#756B60]">Messages will be removed from your view.</p>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setClearConfirmOpen(false)}
                    className="rounded-full border border-[#E8E3D6] bg-transparent px-4 py-1.5 text-[12px] font-medium text-[#756B60] hover:bg-[#1C1B18]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D35]/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearConversation}
                    disabled={clearLoading}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#174D35] px-4 py-1.5 text-[12px] font-medium text-[#FFFDF8] hover:bg-[#14422D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D35]/50 disabled:opacity-50"
                  >
                    {clearLoading && <Loader2 size={14} className="animate-spin" />}
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>



      {/* ── Profile Image Modal ── */}
      {profileImageOpen && (
        <div 
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[#1C1B18]/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setProfileImageOpen(false)}
          role="dialog"
          aria-label="Profile image"
        >
          <button
            type="button"
            onClick={() => setProfileImageOpen(false)}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 z-10 rounded-full bg-[#1C1B18]/40 p-2.5 text-[#FFFDF8] backdrop-blur-md hover:bg-[#1C1B18]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFDF8]"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <div 
            className="relative w-[80vw] max-w-[320px] sm:max-w-[400px] aspect-square overflow-hidden rounded-full border border-[#E8E3D6] bg-[#FFFDF8] shadow-[0_12px_40px_rgba(28,27,24,0.15)] animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {other?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={typeof other.avatar === 'string' ? other.avatar : (other.avatar as { url?: string })?.url || ""} 
                alt={`${other.username}'s profile`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#E8E3D6]">
                <span className="text-6xl font-semibold text-[#756B60]">
                  {other?.username?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── Messages — the ONLY scrolling area ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#F8F4EA] px-3 py-5 sm:px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        data-lenis-prevent="true"
      >
        {loading ? (
          <div className="flex h-full min-h-[200px] items-center justify-center">
            <Loader2
              className="animate-spin text-[#174D35]"
              size={24}
              aria-label="Loading messages"
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-center">
            <div>
              <p className="font-serif text-2xl text-[#1C1B18]">
                Start the conversation
              </p>
              <p className="mt-2 text-xs text-[#756B60]">
                Ask about availability, rent, facilities or viewing.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="mx-auto flex max-w-2xl flex-col gap-0"
            aria-live="polite"
            aria-label="Messages"
          >
            {messages.map((message, i) => {
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
              const sameSenderAsPrev =
                prevMsg &&
                getUserId(prevMsg.sender) === getUserId(message.sender);
              const sameSenderAsNext =
                nextMsg &&
                getUserId(nextMsg.sender) === getUserId(message.sender);
              const isMine = getUserId(message.sender) === currentUser._id;

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  mine={isMine}
                  isGroupStart={!sameSenderAsPrev}
                  isGroupEnd={!sameSenderAsNext}
                  onDeleteForMe={() => handleDeleteForMe(message._id)}
                  onDeleteForEveryone={
                    isMine
                      ? () => handleDeleteForEveryone(message._id)
                      : undefined
                  }
                />
              );
            })}

            {typingUserId && (
              <div
                className="flex items-center gap-1.5 px-1 py-1"
                aria-live="polite"
              >
                <span className="text-[11px] text-[#756B60]">typing</span>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1 w-1 animate-bounce rounded-full bg-[#756B60]"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            )}

            <div ref={bottomRef} className="h-px" />
          </div>
        )}
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className="absolute left-1/2 top-4 z-[300] -translate-x-1/2 px-4 pointer-events-none w-full max-w-sm">
          <div
            className={`
              mx-auto flex w-max items-center gap-2 rounded-[16px] border border-[#E8E3D6] bg-[#FFFDF8] px-4 py-2.5 shadow-[0_8px_30px_rgba(28,27,24,0.12)]
              animate-in fade-in slide-in-from-top-4 duration-300
            `}
            role="alert"
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} className="text-[#174D35] shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-[#A53B32] shrink-0" />
            )}
            <p className="text-[13px] font-medium text-[#1C1B18]">{toast.message}</p>
          </div>
        </div>
      )}

      {/* ── Composer ── */}
      <div
        className="shrink-0 border-t border-[#1C1B18]/10 bg-[#FFFDF8] p-3 sm:p-4"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-[#1C1B18]/10 bg-[#F8F4EA] p-2">
          <label htmlFor="message-input" className="sr-only">
            Write a message
          </label>
          <textarea
            id="message-input"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={1000}
            placeholder="Write a message…"
            aria-label="Write a message"
            className="
              max-h-28 min-h-[40px] flex-1
              resize-none bg-transparent
              px-2 py-2
              text-sm text-[#1C1B18]
              outline-none
              placeholder:text-[#9A9186]
            "
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || sending}
            aria-label="Send message"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-full bg-[#174D35] text-[#F8F4EA]
              transition-opacity
              disabled:cursor-not-allowed disabled:opacity-40
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[#174D35]/50
            "
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Send size={16} aria-hidden />
            )}
          </button>
        </div>

        <div className="mx-auto mt-1.5 flex max-w-2xl items-center justify-between px-2 text-[8px] uppercase tracking-[0.12em] text-[#8A8177]">
          <span className="hidden sm:inline">
            Enter to send · Shift + Enter for new line
          </span>
          <span className="sm:hidden">Shift+Enter for newline</span>
          <span>{text.length}/1000</span>
        </div>
      </div>
    </section>
  );
}