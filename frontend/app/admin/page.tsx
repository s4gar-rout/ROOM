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
      } catch (error) {
        console.error("Failed to fetch stats", error);
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
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Owners", value: stats.owners, icon: UserCheck, color: "text-green-600", bg: "bg-green-100" },
    { label: "Tenants", value: stats.tenants, icon: UserX, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Total Rooms", value: stats.rooms, icon: Home, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Available Rooms", value: stats.availableRooms, icon: CheckCircle, color: "text-teal-600", bg: "bg-teal-100" },
    { label: "Unavailable Rooms", value: stats.unavailableRooms, icon: XCircle, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1C1B18]">Overview</h1>
        <p className="text-sm text-[#5F554A]">Platform statistics and metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-2xl border border-[#1C1B18]/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#5F554A]">{stat.label}</p>
                  <p className="font-serif text-2xl font-semibold text-[#1C1B18]">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
