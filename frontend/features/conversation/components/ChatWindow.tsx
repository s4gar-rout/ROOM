"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ArrowLeft, Loader2, Send, MoreVertical } from "lucide-react";
import type { User } from "@/types/auth.types";
import type { Conversation, Message } from "../types/conversation";
import { getConversationMessages, getUserId, markConversationRead, sendConversationMessage } from "../services/conversation.service";
import { useConversationSocket } from "../hooks/useConversationSocket";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import { chatStore } from "../store";

function otherUser(conversation: Conversation): User | null {
  return conversation.otherUser && typeof conversation.otherUser !== "string" ? conversation.otherUser : null;
}

function roomName(conversation: Conversation) {
  if (!conversation.room || typeof conversation.room === "string") return "Room conversation";
  return conversation.room.title || "Room conversation";
}

export default function ChatWindow({ conversation, currentUser, onBack, onUpdated }: {
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
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef(new Set<string>());

  const other = useMemo(() => otherUser(conversation), [conversation]);

  const appendMessage = (message: Message) => {
    if (message.conversation !== conversation._id) return;
    setMessages((current) => {
      if (current.some((item) => item._id === message._id)) return current;
      seenIds.current.add(message._id);
      return [...current, message];
    });
    onUpdated?.(message);

    if (getUserId(message.sender) !== currentUser._id) {
      markRead();
    }
  };

  const [isTypingState, setIsTypingState] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { send: socketSend, markRead, setTyping } = useConversationSocket({
    conversationId: conversation._id,
    onMessage: appendMessage,
    onRead: (payload) => {
      if (payload.conversationId !== conversation._id) return;
      setMessages((current) => current.map((message) => {
        if (getUserId(message.sender) === currentUser._id) return { ...message, read: true, readAt: payload.readAt };
        return message;
      }));
    },
    onTyping: (typing, userId) => {
      if (userId === currentUser._id) return;
      setTypingUserId(typing ? userId : null);
    },
    onMessageDeleted: (payload) => {
      if (payload.conversationId !== conversation._id) return;
      setMessages((current) => current.map((msg) =>
        msg._id === payload.messageId ? { ...msg, isDeleted: true } : msg
      ));
    },
    onError: (message) => setError(message),
  });

  useEffect(() => {
    chatStore.activeConversationId = conversation._id;
    let active = true;
    setMessages([]);
    seenIds.current.clear();
    setLoading(true);
    setError("");
    setTypingUserId(null);

    getConversationMessages(conversation._id, 1, 50)
      .then((response) => {
        if (!active) return;
        const incoming = response.messages || [];
        incoming.forEach((message) => seenIds.current.add(message._id));
        setMessages(incoming);
        markConversationRead(conversation._id).catch(() => undefined);
        markRead();
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || "Unable to load messages");
      })
      .finally(() => active && setLoading(false));

    return () => { 
      active = false; 
      if (chatStore.activeConversationId === conversation._id) {
        chatStore.activeConversationId = null;
      }
    };
  }, [conversation._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingUserId]);

  const handleSubmit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError("");
    setTyping(false);
    setIsTypingState(false);

    const sentBySocket = socketSend(value);
    if (sentBySocket) {
      setText("");
      setSending(false);
      return;
    }

    try {
      const response = await sendConversationMessage(conversation._id, value);
      appendMessage(response.message);
      setText("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Message could not be sent");
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

  const handleDelete = async (messageId: string) => {
    try {
      setDeletingId(messageId);
      await import("../services/conversation.service").then(m => m.deleteConversationMessage(conversation._id, messageId));
      setMessages((current) => current.map((msg) =>
        msg._id === messageId ? { ...msg, isDeleted: true } : msg
      ));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#F8F4EA]">
      <header className="flex items-center gap-3 border-b border-[#1C1B18]/10 bg-[#FFFDF8] px-4 py-3 sm:px-6">
        {onBack ? <button onClick={onBack} className="rounded-full p-2 text-[#1C1B18] hover:bg-[#1C1B18]/5 md:hidden"><ArrowLeft size={18} /></button> : null}
        <Avatar user={other} size={42} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-[#1C1B18]">{other?.username || "User"}</h1>
          <p className="truncate text-[9px] font-medium uppercase tracking-[0.14em] text-[#174D35]">{roomName(conversation)}</p>
          {typingUserId ? <p className="mt-0.5 text-[10px] text-[#756B60]">typing…</p> : null}
        </div>
        <button className="rounded-full p-2 text-[#756B60] hover:bg-[#1C1B18]/5"><MoreVertical size={18} /></button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {loading ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#174D35]" size={24} /></div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center"><div><p className="font-serif text-2xl text-[#1C1B18]">Start the conversation</p><p className="mt-2 text-xs text-[#756B60]">Ask about availability, rent, facilities or viewing.</p></div></div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((message) => <MessageBubble key={message._id} message={message} mine={getUserId(message.sender) === currentUser._id} onDelete={handleDelete} />)}
            {typingUserId ? <div className="px-10 text-xs text-[#756B60]">typing…</div> : null}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error ? <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-center text-[10px] text-red-700">{error}</div> : null}

      <div className="border-t border-[#1C1B18]/10 bg-[#FFFDF8] p-3 sm:p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-[#1C1B18]/10 bg-[#F8F4EA] p-2">
          <textarea
            value={text}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={1000}
            placeholder="Write a message…"
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#1C1B18] outline-none placeholder:text-[#9A9186]"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174D35] text-[#F8F4EA] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="mx-auto mt-1 flex max-w-3xl items-center justify-between px-2 text-[8px] uppercase tracking-[0.12em] text-[#8A8177]">
          <span>Enter to send · Shift + Enter for new line</span>
          <span>{text.length}/1000</span>
        </div>
      </div>
    </section>
  );
}
