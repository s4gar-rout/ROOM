"use client";

import Image from "next/image";
import type { User } from "@/types/auth.types";

export default function Avatar({ user, size = 40 }: { user?: User | null; size?: number }) {
  const label = user?.username?.charAt(0).toUpperCase() || "U";
  if (user?.avatar?.url) {
    return (
      <Image
        src={user.avatar.url}
        alt={user.username || "User"}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#174D35] font-serif text-[#F8F4EA]"
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.38) }}
    >
      {label}
    </div>
  );
}
