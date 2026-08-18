"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Loader2, MoreVertical, Send } from "lucide-react";
import type { User } from "@/types/auth.types";
import type { Conversation, Message } from "../types/conversation";
import { getRoomInfo } from "../types/conversation";
import {
  deleteConversationMessage,
  getConversationMessages,
  getUserId,
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
  onDeleted,
}: {
  conversation: Conversation;
  currentUser: User;
  onBack?: () => void;
  onUpdated?: (message: Message) => void;
  onDeleted?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isTypingState, setIsTypingState] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef(new Set<string>());
  // Track whether the user is near the bottom so we don't force-scroll mid-read.
  const isNearBottom = useRef(true);

  const other = useMemo(() => getOtherUser(conversation), [conversation]);

  // ── Scroll helper ──────────────────────────────────────────────────────

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 120; // px from bottom
    isNearBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  }, []);

  // ── Socket ─────────────────────────────────────────────────────────────

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

        if (getUserId(message.sender) !== currentUser._id) {
          markRead();
        }

        // Auto-scroll only if already near the bottom.
        if (isNearBottom.current) {
          requestAnimationFrame(() => scrollToBottom("smooth"));
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [conversation._id, currentUser._id, onUpdated, scrollToBottom]
    ),

    onRead: useCallback(
      (payload: { conversationId: string; readAt: string }) => {
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

    onMessageDeleted: useCallback(
      (payload: { conversationId: string; messageId: string }) => {
        if (payload.conversationId !== conversation._id) return;
        setMessages((current) =>
          current.map((m) =>
            m._id === payload.messageId ? { ...m, isDeleted: true } : m
          )
        );
      },
      [conversation._id]
    ),

    onError: useCallback((msg: string) => setError(msg), []),
  });

  // ── Load messages on conversation change ───────────────────────────────

  useEffect(() => {
    chatStore.activeConversationId = conversation._id;
    let active = true;

    setMessages([]);
    seenIds.current.clear();
    setLoading(true);
    setError("");
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
        setError(msg);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (chatStore.activeConversationId === conversation._id) {
        chatStore.activeConversationId = null;
      }
      // Clean up typing timer
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
        typingTimer.current = null;
      }
    };
  }, [conversation._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when messages first load.
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
    setError("");

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
      setError(errMsg);
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

  // ── Delete ─────────────────────────────────────────────────────────────

  const handleDeleteForMe = useCallback(
    async (messageId: string) => {
      try {
        await deleteConversationMessage(conversation._id, messageId);
        setMessages((current) =>
          current.map((m) =>
            m._id === messageId ? { ...m, isDeleted: true } : m
          )
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Failed to delete message";
        setError(msg);
      }
    },
    [conversation._id]
  );

  const handleDeleteForEveryone = useCallback(
    async (messageId: string) => {
      try {
        await deleteConversationMessage(conversation._id, messageId);
        setMessages((current) =>
          current.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, isDeletedForEveryone: true }
              : m
          )
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Failed to delete message";
        setError(msg);
      }
    },
    [conversation._id]
  );

  // ── Render ─────────────────────────────────────────────────────────────

  // ── Derived room info ───────────────────────────────────────────────────
  const roomInfo = getRoomInfo(conversation);
  const roomId =
    roomInfo?._id ??
    (typeof conversation.room === "string" ? conversation.room : null);

  const roomLabel = roomInfo?.title ?? getRoomName(conversation);

  const roomMeta = [
    roomInfo?.rent
      ? `₹${roomInfo.rent.toLocaleString("en-IN")}/mo`
      : null,
    roomInfo?.location ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Chat window">
      {/* ── Header — shrink-0 so it never compresses ── */}
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

        <div className="mt-0.5 shrink-0">
          <Avatar user={other} size={38} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Tenant / owner name */}
          <p className="truncate text-[13px] font-semibold text-[#1C1B18]">
            {other?.username || "User"}
          </p>

          {/* ── Room context — the key new element ── */}
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

          {/* Typing indicator */}
          {typingUserId && (
            <p className="mt-0.5 text-[10px] text-[#756B60]" aria-live="polite">
              typing…
            </p>
          )}
        </div>

        <button
          type="button"
          aria-label="More options"
          className="mt-0.5 shrink-0 rounded-full p-2 text-[#756B60] hover:bg-[#1C1B18]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D35]/50"
        >
          <MoreVertical size={18} aria-hidden />
        </button>
      </header>

      {/* ── Messages — the ONLY scrolling area ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#F8F4EA] px-3 py-5 sm:px-5"
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
            className="mx-auto flex max-w-2xl flex-col gap-1.5"
            aria-live="polite"
            aria-label="Messages"
          >
            {messages.map((message, i) => {
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
              const sameSenderAsPrev =
                prevMsg && getUserId(prevMsg.sender) === getUserId(message.sender);
              const sameSenderAsNext =
                nextMsg && getUserId(nextMsg.sender) === getUserId(message.sender);
              const isMine =
                getUserId(message.sender) === currentUser._id;

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  mine={isMine}
                  isGroupStart={!sameSenderAsPrev}
                  isGroupEnd={!sameSenderAsNext}
                  onDeleteForMe={() => handleDeleteForMe(message._id)}
                  onDeleteForEveryone={() => handleDeleteForEveryone(message._id)}
                />
              );
            })}

            {typingUserId && (
              <div className="flex items-center gap-1.5 px-1 py-1" aria-live="polite">
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

      {/* ── Error banner ── */}
      {error && (
        <div
          role="alert"
          className="shrink-0 border-t border-red-200 bg-red-50 px-4 py-2 text-center text-[10px] text-red-700"
        >
          {error}
        </div>
      )}

      {/* ── Composer — shrink-0 so it stays anchored ── */}
      <div
        className="shrink-0 border-t border-[#1C1B18]/10 bg-[#FFFDF8] p-3 sm:p-4"
        /*
         * safe-area-inset-bottom ensures the composer isn't hidden behind
         * the iOS home indicator or Android gesture bar.
         */
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
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D35]/50
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
          <span className="hidden sm:inline">Enter to send · Shift + Enter for new line</span>
          <span className="sm:hidden">Shift+Enter for newline</span>
          <span>{text.length}/1000</span>
        </div>
      </div>
    </section>
  );
}