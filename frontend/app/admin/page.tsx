"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/features/admin/services/admin.service";
import { Users, Home, UserCheck, UserX, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error: unknown) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-white p-6 shadow-sm border border-[#1C1B18]/10 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-[#1C1B18]/5"></div>
            <div className="mt-4 h-4 w-24 rounded bg-[#1C1B18]/5"></div>
            <div className="mt-2 h-6 w-12 rounded bg-[#1C1B18]/5"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-red-600">Failed to load statistics.</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm text-[#174D35] underline hover:text-[#174D35]/80">Try Again</button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users },
    { label: "Owners", value: stats.owners, icon: UserCheck },
    { label: "Tenants", value: stats.tenants, icon: UserX },
    { label: "Total Rooms", value: stats.rooms, icon: Home },
    { label: "Available Rooms", value: stats.availableRooms, icon: CheckCircle },
    { label: "Sold Out Rooms", value: stats.unavailableRooms, icon: XCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Section Intro */}
      <div>
        <div className="mb-2.5 flex items-center gap-3">
          <span className="h-px w-8 bg-[#174D35]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35]">
            Platform Overview
          </span>
        </div>
        <h1 className="font-serif text-[40px] font-normal leading-none tracking-[-0.03em] text-[#1C1B18] sm:text-[44px]">
          Dashboard <span className="italic text-[#174D35]">metrics.</span>
        </h1>
        <p className="mt-2.5 text-[11px] font-medium leading-5 text-[#5F554A]">
          Real-time metrics, user statistics, and room inventory across ROOM marketplace.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="group rounded-[22px] border border-[#174D35]/12 bg-[#FAF7F0] p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#174D35]/30 hover:shadow-[0_12px_32px_rgba(28,27,24,0.06)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={20} />
                </div>
                <span className="font-serif text-[38px] font-normal leading-none text-[#1C1B18]">
                  {stat.value}
                </span>
              </div>

              <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#756A5C]">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
