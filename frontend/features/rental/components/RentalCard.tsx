"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { staggerItemVariants, cardHoverVariants, shouldReduceMotion } from "@/lib/animations";

import type { Room } from "@/features/rental/types/rental";

type RentalCardProps = {
  room: Room;
};

export default function RentalCard({ room }: RentalCardProps) {
  const reduceMotion = shouldReduceMotion();
  const cardRef = useRef<HTMLElement>(null);
  const rafId = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const roomTypeLabel =
    room.roomType === "1BHK"
      ? "1 BHK"
      : room.roomType === "2BHK"
        ? "2 BHK"
        : room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1);

  const image =
    room.images && room.images.length > 0
      ? room.images[0].url
      : null;

  // Cinematic Cursor Parallax Effect (Desktop only, zero React state re-renders)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduceMotion || !cardRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty("--parallax-x", `${(x * -10).toFixed(2)}px`);
        cardRef.current.style.setProperty("--parallax-y", `${(y * -10).toFixed(2)}px`);
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.setProperty("--parallax-x", "0px");
      cardRef.current.style.setProperty("--parallax-y", "0px");
    }
  };

  return (
    <Link href={`/rentals/${room._id}`} className="block focus:outline-none">
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        variants={staggerItemVariants}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? false : "visible"}
        viewport={{ once: true, amount: 0.15 }}
        whileHover={reduceMotion ? {} : cardHoverVariants.hover}
        className="group overflow-hidden rounded-2xl sm:rounded-[2px] border border-[#1C1B18]/15 bg-[#F8F4EA] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#174D35]/35 hover:shadow-[0_16px_36px_rgba(28,27,24,0.08)] cursor-pointer shadow-sm sm:shadow-none"
      >
        {/* ================================
            IMAGE CONTAINER & CINEMATIC MOTION
        ================================= */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E8E3D8] border-b border-[#1C1B18]/15">
          {/* Subtle Hover Dark/Green Tint Overlay */}
          <div className="absolute inset-0 bg-[#174D35]/0 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#174D35]/8 pointer-events-none z-10" />

          {image ? (
            <Image
              src={image}
              alt={room.title}
              fill
              onLoad={() => setIsLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] ${
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
              }`}
              style={{
                transform: `scale(var(--img-scale, 1)) translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0px)`,
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5F554A]">
              No image
            </div>
          )}

          {/* Room Type Tag */}
          <span className="absolute left-3 top-3 z-20 rounded-full sm:rounded-[2px] bg-[#F8F4EA]/95 backdrop-blur-xs px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-[#174D35] shadow-sm">
            {roomTypeLabel}
          </span>

          {/* Availability */}
          <span
            className={`absolute right-3 top-3 z-20 rounded-full sm:rounded-[2px] px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.16em] shadow-sm ${
              room.availability
                ? "bg-[#174D35] text-[#F8F4EA]"
                : "bg-[#1C1B18] text-white"
            }`}
          >
            {room.availability ? "Available" : "Sold Out"}
          </span>

          {/* Photo Count */}
          {room.images && room.images.length > 0 && (
            <span className="absolute bottom-3 left-3 z-20 rounded-full bg-[#1C1B18]/70 backdrop-blur-xs px-2.5 py-1 font-sans text-[8px] font-medium text-white shadow-xs">
              {room.images.length} {room.images.length === 1 ? "photo" : "photos"}
            </span>
          )}

          {/* View Indicator Button (Subtle Staggered Reveal) */}
          <div
            className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35] shadow-sm opacity-90 sm:opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:bg-[#174D35] group-hover:text-[#F8F4EA] group-hover:translate-y-0 translate-y-1 sm:delay-75"
            aria-label={`View ${room.title}`}
          >
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
            />
          </div>
        </div>

        {/* ================================
            CONTENT
        ================================= */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            {/* Title + Location */}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-base sm:text-lg font-normal leading-tight tracking-[-0.02em] text-[#1C1B18] transition-colors duration-300 group-hover:text-[#174D35]">
                {room.title}
              </h3>

              <div className="mt-1.5 flex items-center gap-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.15em] text-[#5F554A]">
                <MapPin size={12} className="shrink-0 text-[#174D35]" />
                <span className="truncate">{room.location}</span>
              </div>
            </div>

            {/* Rent */}
            <div className="shrink-0 text-right">
              <p className="font-serif text-base sm:text-[18px] font-normal tracking-tight text-[#174D35]">
                ₹{room.rent.toLocaleString("en-IN")}
              </p>

              <p className="mt-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.15em] text-[#5F554A]">
                / mo
              </p>
            </div>
          </div>

          {/* ================================
              FACILITIES
          ================================= */}
          {room.facilities && room.facilities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#1C1B18]/10 pt-3">
              {room.facilities.slice(0, 3).map((facility) => (
                <span
                  key={facility}
                  className="rounded-full sm:rounded-[2px] border border-[#1C1B18]/15 bg-[#174D35]/5 sm:bg-transparent px-2.5 py-1 font-sans text-[8px] font-semibold uppercase tracking-[0.15em] text-[#174D35] sm:text-[#5F554A]"
                >
                  {facility}
                </span>
              ))}

              {room.facilities.length > 3 && (
                <span className="rounded-full sm:rounded-[2px] border border-[#1C1B18]/15 bg-[#174D35]/5 sm:bg-transparent px-2.5 py-1 font-sans text-[8px] font-semibold uppercase tracking-[0.15em] text-[#174D35] sm:text-[#5F554A]">
                  +{room.facilities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  );
}