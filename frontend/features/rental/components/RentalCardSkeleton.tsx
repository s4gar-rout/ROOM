import React from "react";

export default function RentalCardSkeleton() {
  return (
    <article className="group overflow-hidden rounded-[2px] border border-[#1C1B18]/10 bg-transparent">
      {/* IMAGE PLACEHOLDER */}
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[#1C1B18]/10 bg-[#1C1B18]/5">
        <div className="absolute inset-0 animate-pulse bg-[#E8E3D9]/50" />
      </div>

      {/* CONTENT PLACEHOLDER */}
      <div className="flex flex-col p-4 sm:p-5">
        
        {/* Title */}
        <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-[#E8E3D9]/60" />
        
        {/* Location Row */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 animate-pulse rounded bg-[#E8E3D9]/60" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-[#E8E3D9]/60" />
        </div>

        {/* Divider */}
        <div className="my-2 h-[1px] w-full bg-[#1C1B18]/5" />

        {/* Details Row */}
        <div className="flex items-center justify-between py-2">
          <div className="flex gap-4">
            <div className="h-3 w-10 animate-pulse rounded bg-[#E8E3D9]/60" />
            <div className="h-3 w-10 animate-pulse rounded bg-[#E8E3D9]/60" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-[#E8E3D9]/60" />
        </div>

      </div>
    </article>
  );
}
