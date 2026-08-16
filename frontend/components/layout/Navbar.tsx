"use client";

import Link from "next/link";
import { UserRound, LogOut, User as UserIcon, Edit2, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  return (
    <header className="w-full border-b border-[#DED7C9] bg-[#F8F4EA] relative z-50">
      <nav className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-2xl md:text-3xl tracking-tight text-[#1C1B18]"
        >
          room.
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:gap-10 md:flex">
          <Link
            href="/rentals"
            className="text-sm md:text-[16px] text-[#756A5C] transition-colors hover:text-[#174D35]"
          >
            Find a home
          </Link>

          <Link
            href="/owner"
            className="text-sm md:text-[16px] text-[#756A5C] transition-colors hover:text-[#174D35]"
          >
            For owners
          </Link>

          <Link
            href="/messages"
            className="text-sm md:text-[16px] text-[#756A5C] transition-colors hover:text-[#174D35]"
          >
            Messages
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:gap-5">
          {loading ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-20 h-4 rounded bg-gray-200 animate-pulse"></div>
            </div>
          ) : isAuthenticated && user ? (
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm md:text-[16px] text-[#1C1B18] hover:opacity-80 transition-opacity"
              >
                {user.avatar?.url ? (
                  <Image
                    src={user.avatar.url}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="rounded-full object-cover w-8 h-8"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#174D35] flex items-center justify-center text-white font-medium">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium max-w-[120px] truncate">{user.username}</span>
                <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Desktop Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-[#DED7C9] bg-white shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-gray-100 mb-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#174D35] transition-colors"
                  >
                    <UserIcon size={16} />
                    Profile
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#174D35] transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-gray-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-2 text-sm md:text-[16px] text-[#1C1B18] sm:flex"
            >
              <UserRound size={18} strokeWidth={1.8} />
              Sign in
            </Link>
          )}

          <Link
            href="/owner/add-rental"
            className="rounded-full bg-[#174D35] px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-[15px] font-medium !text-[#F8F4EA] transition-all hover:bg-[#2D6047]"
          >
            List a home
          </Link>

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
          <Link href="/rentals" onClick={() => setMobileMenuOpen(false)} className="text-[#1C1B18] font-medium">Find a home</Link>
          <Link href="/owner" onClick={() => setMobileMenuOpen(false)} className="text-[#1C1B18] font-medium">For owners</Link>
          <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="text-[#1C1B18] font-medium">Messages</Link>
          
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
