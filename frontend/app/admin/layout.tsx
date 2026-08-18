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
  X
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
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F4EA] text-[#1C1B18] font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[#1C1B18]/10 bg-[#FFFDF8] transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#1C1B18]/10 px-6">
          <Link href="/admin" className="font-serif text-2xl italic tracking-tight text-[#174D35]">
            room. <span className="font-sans text-xs not-italic tracking-widest text-[#5F554A]">ADMIN</span>
          </Link>
          <button className="md:hidden" onClick={() => setIsMobileOpen(false)}>
            <X size={20} className="text-[#5F554A]" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <p className="px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-wider text-[#756A5C]">
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
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#174D35] text-[#F8F4EA]" 
                    : "text-[#5F554A] hover:bg-[#1C1B18]/5 hover:text-[#174D35]"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full border-t border-[#1C1B18]/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1C1B18]/10 bg-[#FFFDF8] px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              className="rounded-lg p-2 text-[#5F554A] hover:bg-[#1C1B18]/5 md:hidden"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-lg capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden md:flex">
                <span className="text-sm font-medium text-[#1C1B18]">{user.username}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#5F554A]">{user.role}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#174D35] text-sm font-semibold text-[#F8F4EA]">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
