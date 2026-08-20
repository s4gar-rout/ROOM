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
    <Link href={`/rentals/${room._id}`} className="block focus:outline-none w-full max-w-full">
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        variants={staggerItemVariants}
        initial={reduceMotion ? undefined : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.15 }}
        whileHover={reduceMotion ? {} : cardHoverVariants.hover}
        whileTap={{ scale: 0.98 }}
        className="group overflow-hidden rounded-[16px] sm:rounded-[2px] border border-[#1C1B18]/12 bg-[#FFFDF8] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#174D35]/40 hover:shadow-[0_18px_40px_rgba(28,27,24,0.09)] cursor-pointer shadow-[0_2px_12px_rgba(28,27,24,0.03)] sm:shadow-none w-full flex flex-col h-full"
      >
        {/* ================================
            IMAGE CONTAINER & CINEMATIC MOTION
        ================================= */}
        <div className="relative aspect-[1/1] sm:aspect-[4/3] w-full overflow-hidden bg-[#E8E3D8] border-b border-[#1C1B18]/10 shrink-0">
          {/* Subtle Hover Dark/Green Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B18]/30 via-transparent to-[#1C1B18]/10 sm:bg-none sm:group-hover:bg-[#174D35]/8 pointer-events-none z-10 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />

          {image ? (
            <Image
              src={image}
              alt={room.title}
              fill
              onLoad={() => setIsLoaded(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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

          {/* Badges Container Top */}
          <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 z-20 flex justify-between items-start">
            {/* Room Type Tag */}
            <span className="rounded-[4px] sm:rounded-[2px] bg-[#F8F4EA]/95 backdrop-blur-md px-2 py-1 sm:px-2.5 sm:py-1 font-sans text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-[#174D35] shadow-sm">
              {roomTypeLabel}
            </span>

            {/* Availability */}
            <span
              className={`rounded-[4px] sm:rounded-[2px] px-2 py-1 sm:px-2.5 sm:py-1 font-sans text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] shadow-sm ${
                room.availability
                  ? "bg-[#174D35] text-[#F8F4EA]"
                  : "bg-[#1C1B18] text-white"
              }`}
            >
              {room.availability ? "Available" : "Sold Out"}
            </span>
          </div>

          {/* Badges Container Bottom (Desktop Only) */}
          <div className="hidden sm:flex absolute bottom-3 inset-x-3 z-20 justify-between items-end">
            {/* Photo Count */}
            {room.images && room.images.length > 0 ? (
              <span className="rounded-full bg-[#1C1B18]/70 backdrop-blur-md px-2.5 py-1 font-sans text-[8px] font-medium text-white shadow-sm">
                {room.images.length} {room.images.length === 1 ? "photo" : "photos"}
              </span>
            ) : <div />}

            {/* View Indicator Button */}
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35] shadow-md opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:bg-[#174D35] group-hover:text-[#F8F4EA] group-hover:translate-y-0 translate-y-1 delay-75"
              aria-label={`View ${room.title}`}
            >
              <ArrowUpRight
                size={20}
                className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
              />
            </div>
          </div>
        </div>

        {/* ================================
            CONTENT
        ================================= */}
        <div className="p-3 sm:p-5 flex flex-col gap-2 sm:gap-0 flex-1 justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2.5">
            {/* Title + Location */}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-[13px] sm:text-lg font-medium leading-snug tracking-[-0.02em] text-[#1C1B18] transition-colors duration-300 group-hover:text-[#174D35] line-clamp-1">
                {room.title}
              </h3>

              <div className="mt-0.5 sm:mt-1 flex items-center gap-1 font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5F554A]">
                <MapPin size={10} className="shrink-0 text-[#174D35] sm:w-[11px] sm:h-[11px]" />
                <span className="truncate">{room.location}</span>
              </div>
            </div>

            {/* Rent Badge */}
            <div className="shrink-0 sm:text-right flex items-baseline gap-1 sm:block border-[#1C1B18]/5 sm:border-none pt-0.5 sm:pt-0">
              <span className="inline-block font-serif text-[15px] sm:text-[19px] font-bold tracking-tight text-[#174D35]">
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
            <>
              {/* Mobile (max 1) */}
              <div className="flex sm:hidden flex-wrap gap-1 mt-1 pt-1 border-t border-[#1C1B18]/5">
                {room.facilities.slice(0, 1).map((facility) => (
                  <span
                    key={facility}
                    className="rounded-[4px] border border-[#174D35]/15 bg-[#174D35]/5 px-1.5 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.12em] text-[#174D35]"
                  >
                    {facility}
                  </span>
                ))}
                {room.facilities.length > 1 && (
                  <span className="rounded-[4px] border border-[#174D35]/15 bg-[#174D35]/5 px-1.5 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.12em] text-[#174D35]">
                    +{room.facilities.length - 1}
                  </span>
                )}
              </div>

              {/* Desktop (max 3) */}
              <div className="hidden sm:flex flex-wrap gap-1 sm:border-t sm:border-[#1C1B18]/8 sm:pt-2.5 sm:mt-4">
                {room.facilities.slice(0, 3).map((facility) => (
                  <span
                    key={facility}
                    className="rounded-[2px] border border-[#174D35]/15 bg-[#174D35]/5 px-2 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.12em] text-[#174D35]"
                  >
                    {facility}
                  </span>
                ))}

                {room.facilities.length > 3 && (
                  <span className="rounded-[2px] border border-[#174D35]/15 bg-[#174D35]/5 px-2 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.12em] text-[#174D35]">
                    +{room.facilities.length - 3}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </motion.article>
    </Link>
  );
}