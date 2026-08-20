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
        initial={reduceMotion ? undefined : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.15 }}
        whileHover={reduceMotion ? {} : cardHoverVariants.hover}
        className="group overflow-hidden rounded-2xl sm:rounded-[2px] border border-[#1C1B18]/12 bg-[#FFFDF8] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#174D35]/40 hover:shadow-[0_18px_40px_rgba(28,27,24,0.09)] cursor-pointer shadow-sm sm:shadow-none"
      >
        {/* ================================
            IMAGE CONTAINER & CINEMATIC MOTION
        ================================= */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-[#E8E3D8] border-b border-[#1C1B18]/10">
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
          <span className="absolute left-3 top-3 z-20 rounded-full sm:rounded-[2px] bg-[#F8F4EA]/95 backdrop-blur-xs px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-[#174D35] shadow-xs">
            {roomTypeLabel}
          </span>

          {/* Availability */}
          <span
            className={`absolute right-3 top-3 z-20 rounded-full sm:rounded-[2px] px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.16em] shadow-xs ${
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
            className="absolute bottom-3 right-3 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35] shadow-sm opacity-90 sm:opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:bg-[#174D35] group-hover:text-[#F8F4EA] group-hover:translate-y-0 translate-y-1 sm:delay-75"
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
        <div className="p-3.5 sm:p-5">
          <div className="flex items-start justify-between gap-2.5">
            {/* Title + Location */}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-base sm:text-lg font-medium leading-snug tracking-[-0.02em] text-[#1C1B18] transition-colors duration-300 group-hover:text-[#174D35] line-clamp-1">
                {room.title}
              </h3>

              <div className="mt-1 flex items-center gap-1 font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5F554A]">
                <MapPin size={11} className="shrink-0 text-[#174D35]" />
                <span className="truncate">{room.location}</span>
              </div>
            </div>

            {/* Rent Badge */}
            <div className="shrink-0 text-right">
              <span className="inline-block font-serif text-base sm:text-[19px] font-bold tracking-tight text-[#174D35]">
                ₹{room.rent.toLocaleString("en-IN")}
              </span>

              <p className="font-sans text-[8px] font-bold uppercase tracking-[0.15em] text-[#756A5C]">
                / month
              </p>
            </div>
          </div>

          {/* ================================
              FACILITIES BADGES
          ================================= */}
          {room.facilities && room.facilities.length > 0 && (
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1 border-t border-[#1C1B18]/8 pt-2.5">
              {room.facilities.slice(0, 3).map((facility) => (
                <span
                  key={facility}
                  className="rounded-full sm:rounded-[2px] border border-[#174D35]/15 bg-[#174D35]/5 px-2 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.12em] text-[#174D35]"
                >
                  {facility}
                </span>
              ))}

              {room.facilities.length > 3 && (
                <span className="rounded-full sm:rounded-[2px] border border-[#174D35]/15 bg-[#174D35]/5 px-2 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.12em] text-[#174D35]">
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