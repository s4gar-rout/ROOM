"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  X,
  CheckCheck,
  ArrowUpRight,
  MessageSquare,
  Home,
  Trash2,
  Sparkles,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
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
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, onUnreadCountChange]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && isAuthenticated) {
      getMyNotifications()
        .then((data) => {
          if (isMounted && data.success) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
            onUnreadCountChange?.(data.unreadCount || 0);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, isAuthenticated, onUnreadCountChange]);

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

    const convId =
      typeof notif.conversation === "object"
        ? notif.conversation?._id
        : notif.conversation;
    const targetRoom =
      notif.room ||
      (typeof notif.conversation === "object"
        ? notif.conversation?.room
        : null);

    if (convId) {
      router.push(`/messages/${convId}`);
    } else if (targetRoom?._id) {
      router.push(`/rentals/${targetRoom._id}`);
    } else {
      router.push(`/messages`);
    }
  };

  const handleMarkAllRead = async () => {
    if (isMarkingRead) return;
    setIsMarkingRead(true);
    try {
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
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notifId: string
  ) => {
    e.stopPropagation();
    setDeletingIds((prev) => new Set(prev).add(notifId));
    try {
      await deleteNotification(notifId);
      setNotifications((prev) => {
        const updated = prev.filter((n) => n._id !== notifId);
        const newUnread = updated.filter((n) => !n.isRead).length;
        setUnreadCount(newUnread);
        onUnreadCountChange?.(newUnread);
        return updated;
      });
    } catch {
      // Silently handle error
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(notifId);
        return next;
      });
    }
  };

  const handleClearAll = async () => {
    if (isClearingAll) return;
    setIsClearingAll(true);
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    } catch {
      // Silently handle error
    } finally {
      setIsClearingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end animate-in fade-in duration-200">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-[#1C1B18]/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* SLIDE-IN DRAWER */}
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#174D35]/15 bg-[#FAF7F0] text-[#1C1B18] shadow-[0_24px_60px_rgba(28,27,24,0.18)] animate-in slide-in-from-right duration-300"
        aria-label="Notifications"
      >
        {/* HEADER */}
        <div className="border-b border-[#1C1B18]/10 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
                <Bell size={20} />
              </div>
              <div>
                <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35]">
                  Activity Log
                </span>
                <h2 className="font-serif text-2xl font-normal leading-tight tracking-[-0.02em] text-[#1C1B18]">
                  Notifications
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#174D35]/5 text-[#5F554A] transition-all hover:bg-[#174D35]/15 hover:text-[#174D35]"
            >
              <X size={18} />
            </button>
          </div>

          {/* ACTION SUB-HEADER */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1C1B18]/8 pt-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#174D35]/5 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#174D35] shrink-0">
              <span className={`h-1.5 w-1.5 rounded-full ${unreadCount > 0 ? "bg-[#174D35] animate-pulse" : "bg-[#756A5C]"}`} />
              {unreadCount > 0 ? `${unreadCount} New Unread` : "All Caught Up"}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isMarkingRead}
                  title="Mark all as read"
                  className="inline-flex h-8 min-w-[105px] items-center justify-center gap-1.5 rounded-full border border-[#174D35]/30 bg-transparent px-3 font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-[#174D35] transition-all hover:bg-[#174D35] hover:text-[#F8F4EA] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap leading-none shrink-0"
                >
                  {isMarkingRead ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent shrink-0" />
                      <span>Marking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck size={13} className="shrink-0" />
                      <span>Mark Read</span>
                    </>
                  )}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isClearingAll}
                  title="Clear all notifications"
                  className="inline-flex h-8 min-w-[105px] items-center justify-center gap-1.5 rounded-full border border-[#A53B32]/30 bg-transparent px-3 font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-[#A53B32] transition-all hover:bg-[#A53B32] hover:text-[#F8F4EA] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap leading-none shrink-0"
                >
                  {isClearingAll ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent shrink-0" />
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} className="shrink-0" />
                      <span>Clear All</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS LIST CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#756A5C]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#174D35]/20 border-t-[#174D35] mb-3" />
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#174D35]">
                Fetching updates...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
                <Bell size={28} />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#1C1B18]">
                No notifications yet
              </h3>
              <p className="mt-2 max-w-xs font-sans text-xs text-[#62594F] leading-relaxed">
                When you receive room inquiry messages, property status updates, or account alerts, they will appear right here.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const targetRoom =
                item.room ||
                (typeof item.conversation === "object"
                  ? item.conversation?.room
                  : null);

              const messageText =
                item.body ||
                (typeof item.message === "string" && item.message.trim()
                  ? item.message
                  : typeof item.message === "object" && item.message?.message
                  ? item.message.message
                  : item.messageRef?.message ||
                    (item.conversation
                      ? "Inquiry message received regarding a room listing."
                      : "New activity on your account"));

              return (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-300 ${
                    item.isRead
                      ? "border-[#1C1B18]/10 bg-[#FAF7F0]/60 opacity-85 hover:bg-[#FFFDF8] hover:opacity-100 hover:border-[#174D35]/20 shadow-xs"
                      : "border-[#174D35]/30 bg-[#FFFDF8] shadow-sm hover:border-[#174D35] hover:shadow-md"
                  }`}
                >
                  {/* Left Accent indicator for unread */}
                  {!item.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#174D35]" />
                  )}

                  <div className="flex items-start gap-3.5 pl-1">
                    {/* AVATAR OR ROOM THUMBNAIL */}
                    {item.sender?.avatar?.url ? (
                      <Image
                        src={item.sender.avatar.url}
                        alt={item.sender.username || "User"}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#174D35]/15"
                      />
                    ) : targetRoom?.images?.[0]?.url ? (
                      <Image
                        src={targetRoom.images[0].url}
                        alt={targetRoom.title || "Room"}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-[#1C1B18]/10"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
                        {item.conversation ? (
                          <MessageSquare size={18} />
                        ) : (
                          <Home size={18} />
                        )}
                      </div>
                    )}

                    {/* TEXT & ROOM DETAILS */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-sans text-xs font-semibold text-[#1C1B18] truncate">
                          {item.sender?.username
                            ? `Message from ${item.sender.username}`
                            : item.title || "New Message"}
                        </h4>
                        <span className="font-sans text-[9px] font-semibold text-[#756A5C] shrink-0">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="font-sans text-xs text-[#514A42] leading-relaxed line-clamp-2">
                        {messageText}
                      </p>

                      {/* TARGET PROPERTY BADGE */}
                      {targetRoom?.title && (
                        <div className="mt-2.5 flex items-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#174D35]/25 bg-[#174D35]/5 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-[#174D35] transition-all duration-300 group-hover:bg-[#174D35] group-hover:text-[#F8F4EA]">
                            <Home size={11} className="shrink-0" />
                            <span className="truncate max-w-[170px]">
                              {targetRoom.title}
                            </span>
                            <ArrowUpRight
                              size={11}
                              className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* DELETE ACTION BUTTON */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(e, item._id)}
                        disabled={deletingIds.has(item._id)}
                        title="Delete notification"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#756A5C] opacity-50 hover:opacity-100 hover:bg-[#A53B32]/10 hover:text-[#A53B32] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingIds.has(item._id) ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
