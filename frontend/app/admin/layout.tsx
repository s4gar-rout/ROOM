"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { 
  LayoutDashboard, 
  Users, 
  Home as HomeIcon, 
  LogOut, 
  Menu, 
  X,
  AlertCircle,
  MessageSquare
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8F4EA]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#174D35] border-t-transparent"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Rooms", href: "/admin/rooms", icon: HomeIcon },
    { label: "Issues", href: "/admin/issues", icon: AlertCircle },
    { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F4EA] text-[#1C1B18] font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#1C1B18]/50 backdrop-blur-xs md:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[#1C1B18]/8 bg-[#FAF7F0] transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#1C1B18]/8 px-6">
          <Link href="/admin" className="flex items-center gap-2 font-serif text-2xl italic tracking-tight text-[#174D35]">
            <span>livansa</span>
            <span className="rounded-full bg-[#174D35]/10 px-2.5 py-0.5 font-sans text-[8px] font-bold uppercase tracking-[0.2em] text-[#174D35]">ADMIN</span>
          </Link>
          <button className="md:hidden text-[#756A5C] hover:text-[#1C1B18]" onClick={() => setIsMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 p-4">
          <p className="px-3 pb-2 pt-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#174D35]">
            Management
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 ${
                  isActive 
                    ? "bg-[#174D35] !text-[#F8F4EA] shadow-sm" 
                    : "text-[#5F554A] hover:bg-[#174D35]/8 hover:text-[#174D35]"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full border-t border-[#1C1B18]/8 p-4 bg-[#FAF7F0]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-red-600 transition-colors hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1C1B18]/8 bg-[#FAF7F0] px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              className="rounded-full p-2 text-[#5F554A] hover:bg-[#174D35]/10 md:hidden"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#174D35]" />
              <span className="font-serif text-xl font-normal capitalize text-[#1C1B18]">
                {pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden flex-col text-right md:flex">
              <span className="text-xs font-semibold text-[#1C1B18]">{user.username}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#174D35]">{user.role}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#174D35] text-xs font-bold !text-[#F8F4EA] shadow-xs">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div 
          className="flex-1 overflow-y-auto p-5 md:p-8"
          data-lenis-prevent="true"
        >
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
