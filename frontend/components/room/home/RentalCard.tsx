"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { staggerItemVariants, cardHoverVariants, shouldReduceMotion } from "@/lib/animations";
import type { Rental } from "@/types/rental";

type RentalCardProps = {
  rental: Rental;
};

export default function RentalCard({ rental }: RentalCardProps) {
  const reduceMotion = shouldReduceMotion();

  return (
    <motion.article 
      variants={staggerItemVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? false : "visible"}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={reduceMotion ? {} : cardHoverVariants.hover}
      className="group overflow-hidden rounded-3xl border border-[#174D35]/15 bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#174D35]/35 hover:shadow-[0_16px_36px_rgba(28,27,24,0.08)]"
    >
      {/* Image Placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#E8E3D8]">
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#174D35]/50">
          Rental Image
        </div>

        {/* Subtle Hover Dark/Green Tint Overlay */}
        <div className="absolute inset-0 bg-[#174D35]/0 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#174D35]/8 pointer-events-none z-10" />

        {/* Property Type */}
        <span className="absolute left-4 top-4 z-20 rounded-full bg-[#F8F4EA] px-3 py-1.5 text-xs font-medium text-[#174D35]">
          {rental.propertyType}
        </span>

        {/* View Button */}
        <Link
          href={`/rental/${rental.id}`}
          className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F4EA] !text-[#174D35] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 hover:!bg-[#174D35] hover:!text-[#F8F4EA]"
          aria-label={`View ${rental.title}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-base sm:text-[18px] leading-tight text-[#1C1B18] transition-colors duration-300 group-hover:text-[#174D35]">
              {rental.title}
            </h3>

            <div className="mt-1.5 flex items-center gap-1 text-xs sm:text-sm text-[#756A5C]">
              <MapPin size={13} className="shrink-0 text-[#174D35]" />
              <span className="truncate max-w-[120px] sm:max-w-none">
                {rental.area}, {rental.location}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base sm:text-lg font-semibold text-[#174D35]">
              ₹{rental.rent.toLocaleString("en-IN")}
            </p>

            <p className="text-[10px] sm:text-xs text-[#756A5C]">/ month</p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#174D35]/10 pt-3">
          <span className="rounded-full bg-[#F8F4EA] px-2.5 py-1 text-[10px] sm:text-xs text-[#756A5C]">
            {rental.furnished}
          </span>

          <span className="rounded-full bg-[#F8F4EA] px-2.5 py-1 text-[10px] sm:text-xs text-[#756A5C]">
            ₹{rental.deposit.toLocaleString("en-IN")} deposit
          </span>
        </div>
      </div>
    </motion.article>
  );
}