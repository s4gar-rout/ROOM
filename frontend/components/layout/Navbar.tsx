"use client";

import Link from "next/link";
import {
  UserRound,
  LogOut,
  User as UserIcon,
  Edit2,
  ChevronDown,
  Menu,
  Bell,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { getUnreadCount } from "@/features/conversation/services/conversation.service";
import { getMyNotifications } from "@/features/notifications/services/notification.service";
import { useConversationSocket } from "@/features/conversation/hooks/useConversationSocket";
import { chatStore } from "@/features/conversation/store";
import MobileDrawer from "./MobileDrawer";
import NotificationDrawer from "@/features/notifications/components/NotificationDrawer";
import BecomeOwnerModal from "@/features/auth/components/BecomeOwnerModal";

export default function Navbar() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [becomeOwnerModalOpen, setBecomeOwnerModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const fetchUnreadCounts = useCallback(() => {
    if (!isAuthenticated) {
      setUnreadMessages(0);
      setUnreadNotifications(0);
      return;
    }
    getUnreadCount()
      .then((data) => setUnreadMessages(data.unreadCount || 0))
      .catch(() => undefined);

    getMyNotifications()
      .then((data) => setUnreadNotifications(data.unreadCount || 0))
      .catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  useConversationSocket({
    enabled: isAuthenticated,
    onConversationUpdated: (payload: any) => {
      if (payload.conversationId === chatStore.activeConversationId) return;
      fetchUnreadCounts();
    },
    onNotification: () => {
      fetchUnreadCounts();
    },
    onConversationRead: () => {
      fetchUnreadCounts();
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileDrawerOpen(false);
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  const getDesktopLinkClass = (path: string) => {
    const active = isActive(path);
    return `relative flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors py-1 ${
      active ? "text-[#174D35]" : "text-[#5F554A] hover:text-[#174D35]"
    } after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-[#174D35] after:transition-all after:duration-300 ${
      active ? "after:w-full" : "after:w-0 hover:after:w-full"
    }`;
  };

  return (
    <>
      <motion.header
        className={`w-full border-b bg-[#F8F4EA] relative z-40 transition-all duration-300 ${
          scrolled ? "border-[#1C1B18]/10 shadow-sm" : "border-[#1C1B18]/5"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-10 transition-all duration-300 ${
            scrolled ? "h-[60px]" : "h-[72px]"
          }`}
        >
          {/* Left section: Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-serif italic text-[24px] sm:text-[28px] md:text-[30px] font-normal tracking-[-0.03em] text-[#1C1B18] leading-none select-none"
              aria-label="livansa home"
            >
              livansa
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-9 md:flex">
            <Link href="/" className={getDesktopLinkClass("/")}>
              Home
            </Link>

            <Link href="/rentals" className={getDesktopLinkClass("/rentals")}>
              Rooms
            </Link>

            <Link
              href="/owner-dashboard/add-room"
              onClick={(e) => {
                if (isAuthenticated && user?.role === "tenant") {
                  e.preventDefault();
                  setBecomeOwnerModalOpen(true);
                }
              }}
              className={getDesktopLinkClass("/owner-dashboard/add-room")}
            >
              List Room
            </Link>

            {isAuthenticated && user?.role === "owner" && (
              <Link
                href="/owner-dashboard"
                className={getDesktopLinkClass("/owner-dashboard")}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                className={getDesktopLinkClass("/admin")}
              >
                Admin
              </Link>
            )}

            <Link href="/messages" className={getDesktopLinkClass("/messages")}>
              Messages
              {unreadMessages > 0 ? (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#174D35] px-1 text-[8px] font-bold tracking-normal text-[#F8F4EA]">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              ) : null}
            </Link>
          </div>

          {/* Right side: Notification → Profile → Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Notification Bell Button (Desktop & Mobile) */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setNotificationDrawerOpen(true)}
                aria-label="Open notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5F554A] hover:bg-[#1C1B18]/5 hover:text-[#174D35] transition-colors"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-[#174D35]" />
                )}
              </button>
            )}

            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1C1B18]/5 animate-pulse" />
                <div className="hidden sm:block w-16 h-4 rounded bg-[#1C1B18]/5 animate-pulse" />
              </div>
            ) : isAuthenticated && user ? (
              <>
                {/* Desktop Profile Dropdown */}
                <div className="hidden md:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5F554A] transition-colors hover:text-[#174D35]"
                  >
                    {user.avatar?.url ? (
                      <Image
                        src={user.avatar.url}
                        alt={user.username}
                        width={28}
                        height={28}
                        className="rounded-full object-cover w-7 h-7 border border-[#174D35]/20"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#174D35] flex items-center justify-center text-[#F8F4EA] font-sans text-xs font-semibold">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[120px] truncate">{user.username}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-[2px] border border-[#1C1B18]/10 bg-[#F8F4EA] shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#1C1B18]/10 mb-2">
                        <p className="text-sm font-medium text-[#1C1B18] truncate">
                          {user.username}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-[#5F554A] truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#5F554A] hover:bg-[#1C1B18]/5 hover:text-[#174D35] transition-colors"
                      >
                        <UserIcon size={14} />
                        Profile
                      </Link>

                      <Link
                        href="/profile/edit"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#5F554A] hover:bg-[#1C1B18]/5 hover:text-[#174D35] transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit Profile
                      </Link>

                      {user.role === "owner" && (
                        <Link
                          href="/owner-dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#174D35] hover:bg-[#174D35]/5 transition-colors"
                        >
                          <LayoutDashboard size={14} />
                          Owner Dashboard
                        </Link>
                      )}

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-amber-900 hover:bg-amber-50 transition-colors"
                        >
                          <ShieldAlert size={14} />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-[#1C1B18]/10"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Avatar Button (taps open mobile drawer) */}
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  aria-label="Open user menu"
                  className="flex items-center md:hidden"
                >
                  {user.avatar?.url ? (
                    <Image
                      src={user.avatar.url}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="rounded-full object-cover w-8 h-8 border border-[#174D35]/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#174D35] flex items-center justify-center text-[#F8F4EA] font-sans text-xs font-semibold">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#174D35] transition-colors"
                >
                  <UserRound size={15} strokeWidth={1.8} />
                  <span>Sign in</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Button (placed on far right) */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#1C1B18] hover:bg-[#1C1B18]/5 transition-colors md:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Side Drawer (Secondary Navigation & User Portal) */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onOpenBecomeOwnerModal={() => setBecomeOwnerModalOpen(true)}
        unreadMessagesCount={unreadMessages}
      />

      {/* Slide-over Notification Panel */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onUnreadCountChange={(count) => setUnreadNotifications(count)}
      />

      {/* Tenant -> Owner Role Conversion Modal */}
      <BecomeOwnerModal
        isOpen={becomeOwnerModalOpen}
        onClose={() => setBecomeOwnerModalOpen(false)}
      />
    </>
  );
}
