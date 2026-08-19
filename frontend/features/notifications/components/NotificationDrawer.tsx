"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, X, CheckCheck, ArrowUpRight, MessageSquare, Home, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getMyNotifications,
  markNotificationAsRead,
  NotificationItem,
} from "../services/notification.service";
import { useConversationSocket } from "@/features/conversation/hooks/useConversationSocket";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationDrawerProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await getMyNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        onUnreadCountChange?.(data.unreadCount || 0);
      }
    } catch {
      // Silently fail if unable to fetch
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, onUnreadCountChange]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useConversationSocket({
    enabled: isAuthenticated,
    onNotification: () => {
      fetchNotifications();
    },
  });

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        onUnreadCountChange?.(Math.max(0, unreadCount - 1));
      } catch {
        // Continue navigation
      }
    }

    onClose();

    if (notif.conversation) {
      router.push(`/messages`);
    } else if (notif.room?._id) {
      router.push(`/rentals/${notif.room._id}`);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    for (const item of unread) {
      try {
        await markNotificationAsRead(item._id);
      } catch {
        // continue
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    onUnreadCountChange?.(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1B18]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#1C1B18]/10 bg-[#F8F4EA] shadow-2xl animate-in slide-in-from-right duration-300"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1B18]/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-normal text-[#1C1B18]">
                Notifications
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5F554A]">
                {unreadCount > 0 ? `${unreadCount} Unread` : "All caught up"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#174D35] hover:bg-[#174D35]/10 transition-colors"
              >
                <CheckCheck size={13} />
                Mark all
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#5F554A] hover:bg-[#1C1B18]/5 hover:text-[#1C1B18] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#5F554A]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#174D35] border-t-transparent mb-3" />
              <p className="text-xs uppercase tracking-wider">Loading updates...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#5F554A]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1C1B18]/5 text-[#5F554A]">
                <Bell size={24} />
              </div>
              <h3 className="font-serif text-lg text-[#1C1B18]">No notifications yet</h3>
              <p className="mt-1 max-w-xs text-xs text-[#756A5C]">
                When you receive inquiry messages, room alerts, or updates, they will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative cursor-pointer border p-4 transition-all duration-200 ${
                  item.isRead
                    ? "border-[#1C1B18]/10 bg-white/40 hover:bg-white/80"
                    : "border-[#174D35]/30 bg-white shadow-xs hover:border-[#174D35]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Sender or Icon Avatar */}
                  {item.sender?.avatar?.url ? (
                    <Image
                      src={item.sender.avatar.url}
                      alt={item.sender.username || "User"}
                      width={36}
                      height={36}
                      className="rounded-full object-cover w-9 h-9 shrink-0 border border-[#1C1B18]/10"
                    />
                  ) : item.room?.images?.[0]?.url ? (
                    <Image
                      src={item.room.images[0].url}
                      alt={item.room.title || "Room"}
                      width={36}
                      height={36}
                      className="rounded-sm object-cover w-9 h-9 shrink-0 border border-[#1C1B18]/10"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
                      {item.conversation ? <MessageSquare size={16} /> : <Home size={16} />}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-[#1C1B18] truncate">
                        {item.title || "ROOM Alert"}
                      </p>
                      <span className="text-[9px] font-medium text-[#756A5C] shrink-0">
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-[#5F554A] line-clamp-2 leading-relaxed">
                      {item.body || item.message?.message || "New activity on your account"}
                    </p>

                    {item.room?.title && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[#174D35]">
                        <Home size={11} />
                        {item.room.title}
                        <ArrowUpRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </div>

                  {!item.isRead && (
                    <span className="h-2 w-2 rounded-full bg-[#174D35] shrink-0 mt-1" />
                  )}
                </div>

                {/* Subtle corner accents */}
                {!item.isRead && (
                  <>
                    <span className="absolute -left-0.5 -top-0.5 h-1.5 w-1.5 border-l border-t border-[#174D35]" />
                    <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 border-r border-t border-[#174D35]" />
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1C1B18]/10 p-4 bg-[#F8F4EA]/80">
          <Link
            href="/rentals"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#174D35] hover:underline"
          >
            Explore available rooms
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </aside>
    </div>
  );
}
