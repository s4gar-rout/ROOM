"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, Building2, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUnreadCount } from "@/features/conversation/services/conversation.service";
import { useConversationSocket } from "@/features/conversation/hooks/useConversationSocket";
import { chatStore } from "@/features/conversation/store";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Listen to active mobile chat state
  useEffect(() => {
    const handleChatState = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      setIsChatOpen(Boolean(customEvent.detail?.open));
    };
    window.addEventListener("room:chat-state", handleChatState);
    return () => window.removeEventListener("room:chat-state", handleChatState);
  }, []);

  // Fetch real unread message count
  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadMessages(0);
      return;
    }
    getUnreadCount()
      .then((data) => setUnreadMessages(data.unreadCount || 0))
      .catch(() => undefined);
  }, [isAuthenticated, pathname]);

  // Real-time socket updates for unread counts
  useConversationSocket({
    enabled: isAuthenticated,
    onConversationUpdated: (payload: any) => {
      if (payload.conversationId === chatStore.activeConversationId) return;
      getUnreadCount()
        .then((data) => setUnreadMessages(data.unreadCount || 0))
        .catch(() => undefined);
    },
    onNotification: (payload: any) => {
      if (payload.conversation === chatStore.activeConversationId) return;
      getUnreadCount()
        .then((data) => setUnreadMessages(data.unreadCount || 0))
        .catch(() => undefined);
    },
    onConversationRead: () => {
      getUnreadCount()
        .then((data) => setUnreadMessages(data.unreadCount || 0))
        .catch(() => undefined);
    },
  });

  // Hide bottom nav on admin routes or when inside an active conversation on mobile
  if (pathname?.startsWith("/admin") || isChatOpen) {
    return null;
  }

  const isHomeActive = pathname === "/";
  const isRentalsActive = pathname?.startsWith("/rentals");
  const isMessagesActive = pathname?.startsWith("/messages");
  const isProfileActive =
    pathname?.startsWith("/profile") || (!isAuthenticated && pathname === "/login");

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1C1B18]/10 bg-[#F8F4EA]/95 backdrop-blur-md transition-all duration-200 md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {/* 1. HOME */}
        <Link
          href="/"
          aria-label="Go to home"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
            isHomeActive
              ? "text-[#174D35] font-semibold"
              : "text-[#5F554A] hover:text-[#1C1B18]"
          }`}
        >
          <div
            className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
              isHomeActive ? "bg-[#174D35]/12" : "bg-transparent"
            }`}
          >
            <Home size={19} strokeWidth={isHomeActive ? 2.4 : 1.8} />
          </div>
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. ROOMS */}
        <Link
          href="/rentals"
          aria-label="Open rooms"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
            isRentalsActive
              ? "text-[#174D35] font-semibold"
              : "text-[#5F554A] hover:text-[#1C1B18]"
          }`}
        >
          <div
            className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
              isRentalsActive ? "bg-[#174D35]/12" : "bg-transparent"
            }`}
          >
            <Building2 size={19} strokeWidth={isRentalsActive ? 2.4 : 1.8} />
          </div>
          <span className="text-[10px] tracking-tight">Rooms</span>
        </Link>

        {/* 3. MESSAGES */}
        <Link
          href="/messages"
          aria-label="Open messages"
          className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
            isMessagesActive
              ? "text-[#174D35] font-semibold"
              : "text-[#5F554A] hover:text-[#1C1B18]"
          }`}
        >
          <div
            className={`relative flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
              isMessagesActive ? "bg-[#174D35]/12" : "bg-transparent"
            }`}
          >
            <MessageCircle size={19} strokeWidth={isMessagesActive ? 2.4 : 1.8} />
            {isAuthenticated && unreadMessages > 0 && (
              <span className="absolute -top-0.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#174D35] px-1 text-[8px] font-bold text-[#F8F4EA]">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Messages</span>
        </Link>

        {/* 4. PROFILE / SIGN IN */}
        <Link
          href={isAuthenticated ? "/profile" : "/login"}
          aria-label={isAuthenticated ? "Open profile" : "Sign in"}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
            isProfileActive
              ? "text-[#174D35] font-semibold"
              : "text-[#5F554A] hover:text-[#1C1B18]"
          }`}
        >
          <div
            className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
              isProfileActive ? "bg-[#174D35]/12" : "bg-transparent"
            }`}
          >
            {!loading && isAuthenticated && user?.avatar?.url ? (
              <Image
                src={user.avatar.url}
                alt={user.username}
                width={20}
                height={20}
                className={`rounded-full object-cover w-5 h-5 ${
                  isProfileActive ? "ring-2 ring-[#174D35]" : ""
                }`}
              />
            ) : (
              <User size={19} strokeWidth={isProfileActive ? 2.4 : 1.8} />
            )}
          </div>
          <span className="text-[10px] tracking-tight">
            {isAuthenticated ? "Profile" : "Sign In"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
