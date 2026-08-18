"use client";

import Link from "next/link";
import { UserRound, LogOut, User as UserIcon, Edit2, ChevronDown, Menu, MessageCircle } from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { getUnreadCount } from "@/features/conversation/services/conversation.service";
import { useConversationSocket } from "@/features/conversation/hooks/useConversationSocket";
import { chatStore } from "@/features/conversation/store";

export default function Navbar() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    getUnreadCount().then((data) => setUnreadCount(data.unreadCount || 0)).catch(() => undefined);
  }, [isAuthenticated]);

  useConversationSocket({
    enabled: isAuthenticated,
    onConversationUpdated: (payload) => {
      if (payload.conversationId === chatStore.activeConversationId) return;
      getUnreadCount().then((data) => setUnreadCount(data.unreadCount || 0)).catch(() => undefined);
    },
    onNotification: (payload) => {
      if (payload.conversation === chatStore.activeConversationId) return;
      getUnreadCount().then((data) => setUnreadCount(data.unreadCount || 0)).catch(() => undefined);
    },
    onConversationRead: () => {
      getUnreadCount().then((data) => setUnreadCount(data.unreadCount || 0)).catch(() => undefined);
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
    setMobileMenuOpen(false);
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

  const getMobileLinkClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-2 font-medium transition-colors w-max pb-1 border-b-2 ${
      active ? "text-[#174D35] border-[#174D35]" : "text-[#1C1B18] border-transparent hover:border-[#1C1B18]/20"
    }`;
  };

  return (
    <header className="w-full border-b border-[#1C1B18]/10 bg-[#F8F4EA] relative z-50">
      <nav className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 sm:px-10">
        
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-2xl italic tracking-tight text-[#174D35]"
        >
          room.
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 md:flex">
          <Link href="/" className={getDesktopLinkClass("/")}>
            Home
          </Link>

          <Link href="/rentals" className={getDesktopLinkClass("/rentals")}>
            Rooms
          </Link>

          {isAuthenticated && user?.role === "owner" && (
            <Link href="/owner-dashboard" className={getDesktopLinkClass("/owner-dashboard")}>
              Dashboard
            </Link>
          )}

          <Link href="/messages" className={getDesktopLinkClass("/messages")}>
            Messages
            {unreadCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#174D35] px-1 text-[8px] font-bold tracking-normal text-[#F8F4EA]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {loading ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1C1B18]/5 animate-pulse"></div>
              <div className="w-20 h-4 rounded bg-[#1C1B18]/5 animate-pulse"></div>
            </div>
          ) : isAuthenticated && user ? (
            <div className="hidden sm:block relative" ref={dropdownRef}>
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
                    className="rounded-full object-cover w-7 h-7"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#174D35] flex items-center justify-center text-[#F8F4EA] font-sans text-xs font-semibold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[120px] truncate">{user.username}</span>
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Desktop Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-[2px] border border-[#1C1B18]/10 bg-[#F8F4EA] shadow-xl py-2">
                  <div className="px-4 py-2 border-b border-[#1C1B18]/10 mb-2">
                    <p className="text-sm font-medium text-[#1C1B18] truncate">{user.username}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#5F554A] truncate mt-0.5">{user.email}</p>
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
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5F554A] transition-colors hover:text-[#174D35] sm:flex"
            >
              <UserRound size={15} strokeWidth={1.8} />
              Sign in
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-[#1C1B18]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#F8F4EA] border-b border-[#DED7C9] shadow-md flex flex-col py-4 px-4 gap-4 z-40">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass("/")}>Home</Link>
          <Link href="/rentals" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass("/rentals")}>Rooms</Link>
          {isAuthenticated && user?.role === "owner" && (
            <Link href="/owner-dashboard" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass("/owner-dashboard")}>Dashboard</Link>
          )}
          <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass("/messages")}>
            <MessageCircle size={17} /> Messages
            {unreadCount > 0 ? <span className="rounded-full bg-[#174D35] px-2 py-0.5 text-[9px] font-bold text-[#F8F4EA]">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
          </Link>
          
          <div className="w-full h-px bg-[#DED7C9] my-2"></div>

          {!loading && isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                {user.avatar?.url ? (
                  <Image src={user.avatar.url} alt={user.username} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#174D35] flex items-center justify-center text-white font-medium text-lg">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-[#1C1B18]">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-[#1C1B18] py-2">
                <UserIcon size={18} /> Profile
              </Link>
              <Link href="/profile/edit" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-[#1C1B18] py-2">
                <Edit2 size={18} /> Edit Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 py-2 w-full text-left">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : !loading && (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-[#1C1B18] py-2 font-medium">
              <UserRound size={18} /> Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
