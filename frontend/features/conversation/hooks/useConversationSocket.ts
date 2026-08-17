"use client";

import { useEffect, useRef } from "react";
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
  onMessageDeleted?: (payload: { conversationId: string; messageId: string }) => void;
  onError?: (message: string) => void;
  onConversationUpdated?: (payload: any) => void;
  onConversationRead?: (payload: any) => void;
  onNotification?: (payload: any) => void;
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
  onMessageDeleted,
  onError,
  onConversationUpdated,
  onConversationRead,
  onNotification,
}: Options) {
  const socketRef = useRef<SocketLike | null>(null);
  const conversationRef = useRef(conversationId);
  const handlersRef = useRef({ onMessage, onRead, onTyping, onMessageDeleted, onError, onConversationUpdated, onConversationRead, onNotification });

  conversationRef.current = conversationId;
  handlersRef.current = { onMessage, onRead, onTyping, onMessageDeleted, onError, onConversationUpdated, onConversationRead, onNotification };

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    getSocket()
      .then((socket) => {
        if (cancelled) return;
        socketRef.current = socket;

        const handleConnectError = (error: Error) => handlersRef.current.onError?.(error.message);
        const handleMessage = (message: Message) => handlersRef.current.onMessage?.(message);
        const handleRead = (payload: any) => handlersRef.current.onRead?.(payload);
        const handleTypingStart = (payload: any) => handlersRef.current.onTyping?.(true, payload.userId);
        const handleTypingStop = (payload: any) => handlersRef.current.onTyping?.(false, payload.userId);
        const handleConversationUpdated = (payload: any) => handlersRef.current.onConversationUpdated?.(payload);
        const handleConversationRead = (payload: any) => handlersRef.current.onConversationRead?.(payload);
        const handleNotification = (payload: any) => handlersRef.current.onNotification?.(payload);

        const handleMessageDeleted = (payload: any) => handlersRef.current.onMessageDeleted?.(payload);

        socket.on("connect_error", handleConnectError);
        socket.on("message:new", handleMessage);
        socket.on("message:read:update", handleRead);
        socket.on("message:deleted", handleMessageDeleted);
        socket.on("typing:start", handleTypingStart);
        socket.on("typing:stop", handleTypingStop);
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
          socket.off("typing:start", handleTypingStart);
          socket.off("typing:stop", handleTypingStop);
          socket.off("conversation:updated", handleConversationUpdated);
          socket.off("conversation:read", handleConversationRead);
          socket.off("notification:new", handleNotification);
        };
      })
      .catch((error) => {
        if (!cancelled) handlersRef.current.onError?.(error?.message || "Unable to connect to chat");
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

  const send = (message: string) => {
    if (!socketRef.current || !conversationId) return false;
    socketRef.current.emit("message:send", { conversationId, message });
    return true;
  };

  const markRead = () => {
    if (!socketRef.current || !conversationId) return false;
    socketRef.current.emit("message:read", conversationId);
    return true;
  };

  const setTyping = (typing: boolean) => {
    if (!socketRef.current || !conversationId) return false;
    socketRef.current.emit(typing ? "typing:start" : "typing:stop", conversationId);
    return true;
  };

  return { send, markRead, setTyping };
}
