"use client";

import { Sparkles, ArrowUpRight, ArrowDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants, shouldReduceMotion } from "@/lib/animations";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import BecomeOwnerModal from "@/features/auth/components/BecomeOwnerModal";

export default function Home() {
  const reduceMotion = shouldReduceMotion();
  const { user, isAuthenticated } = useAuth();
  const [becomeOwnerModalOpen, setBecomeOwnerModalOpen] = useState(false);

  return (
    <>
      <div className="overflow-x-hidden bg-[#F8F4EA] text-[#1C1B18]">

      {/* HERO */}
      <section className="px-5 pb-6 pt-8 sm:px-8 sm:pb-10 sm:pt-24 md:px-12 md:pt-28 lg:px-16 lg:pt-32">
        <div className="mx-auto max-w-[1400px]">

          {/* Mobile Compact Hero (< md) */}
          <div className="block md:hidden text-center py-2">
            <p className="text-xs md:text-[10px] font-semibold uppercase tracking-[0.25em] text-[#174D35]">
              livansa / RENTALS
            </p>
            <h1 className="mt-2 font-serif text-2xl font-normal leading-tight tracking-[-0.02em] text-[#1C1B18] sm:text-3xl">
              Thoughtfully listed homes for long-term living.
            </h1>
            <div className="mt-4 inline-flex flex-col items-center gap-1 rounded-full border border-[#174D35]/15 bg-[#174D35]/5 px-4 py-2 text-xs">
              <span className="text-xs md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#174D35]">
                JHARSUGUDA • ODISHA
              </span>
              <span className="text-[#756A5C]">Built for local living.</span>
            </div>
          </div>

          {/* Desktop Hero Content (>= md) */}
          <motion.div 
            className="hidden md:block text-center"
            variants={staggerContainerVariants}
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "visible"}
          >

            {/* Eyebrow */}
            <motion.div variants={fadeUpVariants} className="mb-7 flex items-center justify-center gap-3">
              <Sparkles
                size={20}
                strokeWidth={1.5}
                className="text-[#174D35]"
              />

              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#174D35] sm:text-xs">
                A better way to rent
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={fadeUpVariants}
              className="mx-auto max-w-[1250px] font-serif text-[3.3rem] leading-[0.95] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[7.5rem]"
            >
              Find a place{" "}
              <em className="font-serif text-[#174D35]">
                to belong.
              </em>
            </motion.h1>

            {/* Small Supporting Heading */}
            <motion.p 
              variants={fadeUpVariants}
              className="mx-auto mt-7 max-w-[650px] font-serif text-lg italic leading-7 text-[#756A5C] sm:text-xl"
            >
              Rent somewhere that feels like home,
              <br className="hidden sm:block" />
              not just somewhere you can stay.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={staggerItemVariants} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">

              {/* Primary */}
              <Link
                href="/rentals"
                className="flex h-14 min-w-[200px] items-center justify-center gap-3 rounded-full bg-[#174D35] px-7 text-sm font-medium !text-[#F8F4EA] hover:scale-[1.02] transition-transform duration-300 group"
              >
                Explore rentals

                <ArrowUpRight
                  size={18}
                  strokeWidth={1.7}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              {/* Secondary */}
              <Link
                href="/owner-dashboard/add-room"
                onClick={(e) => {
                  if (isAuthenticated && user?.role === "tenant") {
                    e.preventDefault();
                    setBecomeOwnerModalOpen(true);
                  }
                }}
                className="flex h-14 min-w-[200px] items-center justify-center rounded-full border border-[#174D35]/45 bg-[#F8F4EA] px-7 text-sm font-medium !text-[#1C1B18] transition-all duration-300 hover:bg-[#174D35] hover:!text-[#F8F4EA] hover:scale-[1.02]"
              >
                List your property
              </Link>
            </motion.div>

            {/* Trust Points */}
            <motion.div variants={fadeUpVariants} className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#756A5C]">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#174D35]" />
                Verified listings
              </span>

              <span className="text-[#B7AA99]">·</span>

              <span>Local owners</span>

              <span className="text-[#B7AA99]">·</span>

              <span>Monthly rentals</span>
            </motion.div>

            {/* Explore Indicator */}
            <motion.div 
              variants={fadeUpVariants}
              className="mt-12 flex flex-col items-center gap-1 text-[#B7AA99]"
            >
              <span className="text-[9px] font-medium uppercase tracking-[0.3em]">
                Explore
              </span>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDown
                  size={15}
                  strokeWidth={1.3}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Desktop Bottom Section Label */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="hidden md:block mt-16 border-t border-[#D8D0C3] pt-7 sm:mt-20 md:mt-24"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

              {/* Left */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#8B7D6D]">
                  Room / Rentals
                </p>

                <p className="mt-2 text-sm text-[#756A5C]">
                  Thoughtfully listed homes for long-term living.
                </p>
              </div>

              {/* Right */}
              <div className="sm:text-right">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#8B7D6D]">
                  Jharsuguda • Odisha
                </p>

                <p className="mt-2 text-sm text-[#756A5C]">
                  Built for local living.
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

    </div>

    <BecomeOwnerModal
      isOpen={becomeOwnerModalOpen}
      onClose={() => setBecomeOwnerModalOpen(false)}
    />
  </>
);
}
