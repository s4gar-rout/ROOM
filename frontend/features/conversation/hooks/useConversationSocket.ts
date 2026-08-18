"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Message } from "../types/conversation";

interface SocketLike {
  connected: boolean;
  on: (event: string, listener: (...args: any[]) => void) => void;
  off: (event: string, listener?: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
  disconnect: () => void;
}

interface Options {
  conversationId?: string;
  enabled?: boolean;
  onMessage?: (message: Message) => void;
  onRead?: (payload: { conversationId: string; readBy: string; readAt: string }) => void;
  onTyping?: (typing: boolean, userId: string) => void;
  onUserOnline?: (payload: { userId: string }) => void;
  onUserOffline?: (payload: { userId: string }) => void;
  /** Legacy: message globally deleted (isDeleted or isDeletedForEveryone via old code) */
  onMessageDeleted?: (payload: { conversationId: string; messageId: string }) => void;
  /** message:deleted:forme — only the requesting user receives this */
  onMessageDeletedForMe?: (payload: { conversationId: string; messageId: string }) => void;
  /** message:deleted:foreveryone — both participants receive this */
  onMessageDeletedForEveryone?: (payload: { conversationId: string; messageId: string; lastMessage?: string; lastMessageAt?: string; deletedFor?: string }) => void;
  /** conversation:cleared — only the requesting user receives this */
  onConversationCleared?: (payload: { conversationId: string; clearedAt: string }) => void;
  onError?: (message: string) => void;
  onConversationUpdated?: (payload: unknown) => void;
  onConversationRead?: (payload: unknown) => void;
  onNotification?: (payload: unknown) => void;
}

let socketPromise: Promise<SocketLike> | null = null;

async function getSocket(): Promise<SocketLike> {
  if (!socketPromise) {
    socketPromise = import("socket.io-client").then(async ({ io }) => {
      const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:3000";
      const { getAccessToken } = await import("@/lib/axios");
      return io(baseURL, {
        auth: {
          token: getAccessToken()
        },
        transports: ["websocket", "polling"],
        autoConnect: true,
      }) as unknown as SocketLike;
    });
  }
  return socketPromise;
}

export function useConversationSocket({
  conversationId,
  enabled = true,
  onMessage,
  onRead,
  onTyping,
  onUserOnline,
  onUserOffline,
  onMessageDeleted,
  onMessageDeletedForMe,
  onMessageDeletedForEveryone,
  onConversationCleared,
  onError,
  onConversationUpdated,
  onConversationRead,
  onNotification,
}: Options) {
  const socketRef = useRef<SocketLike | null>(null);
  const conversationRef = useRef(conversationId);
  const handlersRef = useRef({
    onMessage,
    onRead,
    onTyping,
    onUserOnline,
    onUserOffline,
    onMessageDeleted,
    onMessageDeletedForMe,
    onMessageDeletedForEveryone,
    onConversationCleared,
    onError,
    onConversationUpdated,
    onConversationRead,
    onNotification,
  });

  useEffect(() => {
    conversationRef.current = conversationId;
    handlersRef.current = {
      onMessage,
      onRead,
      onTyping,
      onUserOnline,
      onUserOffline,
      onMessageDeleted,
      onMessageDeletedForMe,
      onMessageDeletedForEveryone,
      onConversationCleared,
      onError,
      onConversationUpdated,
      onConversationRead,
      onNotification,
    };
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    getSocket()
      .then((socket) => {
        if (cancelled) return;
        socketRef.current = socket;

        const handleConnectError = (error: Error) =>
          handlersRef.current.onError?.(error.message);
        const handleMessage = (message: Message) =>
          handlersRef.current.onMessage?.(message);
        const handleRead = (payload: { conversationId: string; readBy: string; readAt: string }) =>
          handlersRef.current.onRead?.(payload);
        const handleTypingStart = (payload: { userId: string }) =>
          handlersRef.current.onTyping?.(true, payload.userId);
        const handleTypingStop = (payload: { userId: string }) =>
          handlersRef.current.onTyping?.(false, payload.userId);
        const handleUserOnline = (payload: { userId: string }) =>
          handlersRef.current.onUserOnline?.(payload);
        const handleUserOffline = (payload: { userId: string }) =>
          handlersRef.current.onUserOffline?.(payload);
        const handleConversationUpdated = (payload: unknown) =>
          handlersRef.current.onConversationUpdated?.(payload);
        const handleConversationRead = (payload: unknown) =>
          handlersRef.current.onConversationRead?.(payload);
        const handleNotification = (payload: unknown) =>
          handlersRef.current.onNotification?.(payload);

        // Legacy: kept for backward compat with any old socket events.
        const handleMessageDeleted = (payload: { conversationId: string; messageId: string }) =>
          handlersRef.current.onMessageDeleted?.(payload);

        // New granular delete events.
        const handleMessageDeletedForMe = (payload: { conversationId: string; messageId: string }) =>
          handlersRef.current.onMessageDeletedForMe?.(payload);
        const handleMessageDeletedForEveryone = (payload: { conversationId: string; messageId: string; lastMessage?: string; lastMessageAt?: string; deletedFor?: string }) =>
          handlersRef.current.onMessageDeletedForEveryone?.(payload);

        // Conversation cleared for this user.
        const handleConversationCleared = (payload: { conversationId: string; clearedAt: string }) =>
          handlersRef.current.onConversationCleared?.(payload);

        socket.on("connect_error", handleConnectError);
        socket.on("message:new", handleMessage);
        socket.on("message:read:update", handleRead);
        socket.on("message:deleted", handleMessageDeleted);
        socket.on("message:deleted:forme", handleMessageDeletedForMe);
        socket.on("message:deleted:foreveryone", handleMessageDeletedForEveryone);
        socket.on("conversation:cleared", handleConversationCleared);
        socket.on("typing:start", handleTypingStart);
        socket.on("typing:stop", handleTypingStop);
        socket.on("user:online", handleUserOnline);
        socket.on("user:offline", handleUserOffline);
        socket.on("conversation:updated", handleConversationUpdated);
        socket.on("conversation:read", handleConversationRead);
        socket.on("notification:new", handleNotification);

        if (conversationRef.current) {
          socket.emit("conversation:join", conversationRef.current);
        }

        cleanup = () => {
          socket.off("connect_error", handleConnectError);
          socket.off("message:new", handleMessage);
          socket.off("message:read:update", handleRead);
          socket.off("message:deleted", handleMessageDeleted);
          socket.off("message:deleted:forme", handleMessageDeletedForMe);
          socket.off("message:deleted:foreveryone", handleMessageDeletedForEveryone);
          socket.off("conversation:cleared", handleConversationCleared);
          socket.off("typing:start", handleTypingStart);
          socket.off("typing:stop", handleTypingStop);
          socket.off("user:online", handleUserOnline);
          socket.off("user:offline", handleUserOffline);
          socket.off("conversation:updated", handleConversationUpdated);
          socket.off("conversation:read", handleConversationRead);
          socket.off("notification:new", handleNotification);
        };
      })
      .catch((error) => {
        if (!cancelled)
          handlersRef.current.onError?.(
            error?.message || "Unable to connect to chat"
          );
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enabled]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;
    socket.emit("conversation:join", conversationId);
    return () => socket.emit("conversation:leave", conversationId);
  }, [conversationId]);

  const send = useCallback((message: string) => {
    if (!socketRef.current || !conversationId) return false;
    socketRef.current.emit("message:send", { conversationId, message });
    return true;
  }, [conversationId]);

  const markRead = useCallback(() => {
    if (!socketRef.current || !conversationId) return false;
    socketRef.current.emit("message:read", conversationId);
    return true;
  }, [conversationId]);

  const setTyping = useCallback((typing: boolean) => {
    if (!socketRef.current || !conversationId) return false;
    socketRef.current.emit(
      typing ? "typing:start" : "typing:stop",
      conversationId
    );
    return true;
  }, [conversationId]);

  return { send, markRead, setTyping };
}
