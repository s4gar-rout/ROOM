"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  X,
  Home,
  Building2,
  MessageCircle,
  User,
  Edit2,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  AlertCircle,
  MessageSquare,
  FileText,
  Lock,
  LogOut,
  UserRound,
  Info,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBecomeOwnerModal?: () => void;
  unreadMessagesCount: number;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } },
};

const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1], // cubic-bezier(0.16, 1, 0.3, 1)
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
  exit: {
    x: "100%",
    transition: {
      duration: 0.28,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function MobileDrawer({
  isOpen,
  onClose,
  onOpenBecomeOwnerModal,
  unreadMessagesCount,
}: MobileDrawerProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const pathname = usePathname();

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Dark Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-[#1C1B18]/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex h-full w-[84%] max-w-[340px] flex-col border-l border-[#1C1B18]/15 bg-[#F8F4EA] shadow-2xl"
            aria-label="Navigation Menu"
          >
            {/* Drawer Header with User Profile / Guest State */}
            <motion.div variants={itemVariants} className="border-b border-[#1C1B18]/10 p-5 bg-[#FFFDF8]">
              <div className="flex items-center justify-between mb-4">
                <Link
                  href="/"
                  onClick={onClose}
                  className="font-serif text-2xl italic tracking-tight text-[#174D35]"
                >
                  room.
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#5F554A] hover:bg-[#1C1B18]/5 hover:text-[#1C1B18] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {!loading && isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  {user.avatar?.url ? (
                    <Image
                      src={user.avatar.url}
                      alt={user.username}
                      width={44}
                      height={44}
                      className="rounded-full object-cover w-11 h-11 border border-[#174D35]/25 shrink-0"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#174D35] text-sm font-semibold text-[#F8F4EA]">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-[#1C1B18] truncate">
                      {user.username}
                    </p>
                    <p className="text-[11px] text-[#5F554A] truncate">
                      {user.email}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-[#174D35]/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#174D35]">
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "owner"
                        ? "Property Owner"
                        : "Tenant"}
                    </span>
                  </div>
                </div>
              ) : !loading && (
                <div>
                  <p className="text-xs font-medium text-[#5F554A] mb-3">
                    Find a place that feels like home.
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex-1 flex h-9 items-center justify-center rounded-full bg-[#174D35] text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] hover:bg-[#174D35]/90 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={onClose}
                      className="flex-1 flex h-9 items-center justify-center rounded-full border border-[#1C1B18]/20 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1C1B18] hover:bg-[#1C1B18]/5 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Scrollable Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {/* Main Exploration */}
              <motion.div variants={itemVariants}>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#5F554A] px-2 mb-2">
                  Explore
                </span>
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive("/") && pathname === "/"
                        ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                        : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home size={16} />
                      <span>Home</span>
                    </div>
                  </Link>

                  <Link
                    href="/rentals"
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive("/rentals")
                        ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                        : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 size={16} />
                      <span>Find Rooms</span>
                    </div>
                  </Link>

                  <Link
                    href="/about-us"
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive("/about-us")
                        ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                        : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Info size={16} />
                      <span>About Us</span>
                    </div>
                  </Link>

                  <Link
                    href="/owner-dashboard/add-room"
                    onClick={(e) => {
                      if (isAuthenticated && user?.role === "tenant") {
                        e.preventDefault();
                        onClose();
                        onOpenBecomeOwnerModal?.();
                      } else {
                        onClose();
                      }
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive("/owner-dashboard/add-room")
                        ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                        : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PlusCircle size={16} />
                      <span>List a Room</span>
                    </div>
                  </Link>

                  {isAuthenticated && (
                    <Link
                      href="/messages"
                      onClick={onClose}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive("/messages")
                          ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                          : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle size={16} />
                        <span>Messages</span>
                      </div>
                      {unreadMessagesCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#174D35] px-1.5 text-[9px] font-bold text-[#F8F4EA]">
                          {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* Account Section */}
              {isAuthenticated && (
                <motion.div variants={itemVariants}>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#5F554A] px-2 mb-2">
                    Account
                  </span>
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive("/profile") && pathname === "/profile"
                          ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                          : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                      }`}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/profile/edit"
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive("/profile/edit")
                          ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                          : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                      }`}
                    >
                      <Edit2 size={16} />
                      <span>Edit Profile</span>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Owner Dashboard Links (for Owners) */}
              {isAuthenticated && user?.role === "owner" && (
                <motion.div variants={itemVariants}>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#174D35] px-2 mb-2">
                    Owner Portal
                  </span>
                  <div className="space-y-1">
                    <Link
                      href="/owner-dashboard"
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive("/owner-dashboard") && pathname === "/owner-dashboard"
                          ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                          : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                      }`}
                    >
                      <LayoutDashboard size={16} />
                      <span>Owner Dashboard</span>
                    </Link>

                    <Link
                      href="/owner-dashboard/add-room"
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive("/owner-dashboard/add-room")
                          ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                          : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                      }`}
                    >
                      <PlusCircle size={16} />
                      <span>List a New Room</span>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Admin Dashboard Links (for Admins only) */}
              {isAuthenticated && user?.role === "admin" && (
                <motion.div variants={itemVariants}>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-amber-900 px-2 mb-2">
                    Administration
                  </span>
                  <div className="space-y-1">
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive("/admin") && pathname === "/admin"
                          ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                          : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                      }`}
                    >
                      <ShieldAlert size={16} />
                      <span>Admin Dashboard</span>
                    </Link>

                    <Link
                      href="/admin/users"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    >
                      <User size={16} />
                      <span>Users Management</span>
                    </Link>

                    <Link
                      href="/admin/rooms"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    >
                      <Building2 size={16} />
                      <span>Rooms Management</span>
                    </Link>

                    <Link
                      href="/admin/issues"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    >
                      <AlertCircle size={16} />
                      <span>User Issues</span>
                    </Link>

                    <Link
                      href="/admin/feedback"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    >
                      <MessageSquare size={16} />
                      <span>Feedback Records</span>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Support & Legal */}
              <motion.div variants={itemVariants}>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#5F554A] px-2 mb-2">
                  Support &amp; Legal
                </span>
                <div className="space-y-1">
                  <Link
                    href="/report-issue"
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive("/report-issue")
                        ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                        : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    }`}
                  >
                    <AlertCircle size={16} />
                    <span>Report an Issue</span>
                  </Link>

                  <Link
                    href="/feedback"
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive("/feedback")
                        ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                        : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    }`}
                  >
                    <MessageSquare size={16} />
                    <span>Feedback &amp; Suggestions</span>
                  </Link>

                  <Link
                    href="/privacy-policy"
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive("/privacy-policy")
                        ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                        : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    }`}
                  >
                    <Lock size={16} />
                    <span>Privacy Policy</span>
                  </Link>

                  <Link
                    href="/terms-and-conditions"
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive("/terms-and-conditions")
                        ? "bg-[#174D35]/10 text-[#174D35] font-semibold"
                        : "text-[#1C1B18] hover:bg-[#1C1B18]/5"
                    }`}
                  >
                    <FileText size={16} />
                    <span>Terms &amp; Conditions</span>
                  </Link>
                </div>
              </motion.div>
            </nav>

            {/* Drawer Footer with Luxury Logout Button */}
            <motion.div variants={itemVariants} className="border-t border-[#1C1B18]/10 p-4 bg-[#FFFDF8]">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-[#A53B32]/30 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#A53B32] transition-all duration-300 hover:bg-[#A53B32]/10 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#A53B32]/30"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#174D35] py-2.5 text-xs font-semibold uppercase tracking-[0.15em] !text-[#F8F4EA] transition-colors hover:bg-[#174D35]/90"
                >
                  <UserRound size={14} />
                  Sign in to ROOM
                </Link>
              )}
            </motion.div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
