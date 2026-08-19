"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants, shouldReduceMotion } from "@/lib/animations";

export default function LocalDiscovery() {
  const reduceMotion = shouldReduceMotion();

  return (
    <section className="w-full overflow-hidden bg-[#F8F4EA] px-4 py-12 sm:px-6 md:py-16">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainerVariants}
      >
        <motion.div
          variants={fadeUpVariants}
          className="overflow-hidden rounded-[32px] sm:rounded-[36px] border border-[#174D35]/15 bg-[#FAF7F0] p-6 shadow-sm shadow-[#174D35]/5 sm:p-10 md:p-12 lg:p-14"
        >
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">

            {/* Left Column Content */}
            <div className="flex flex-col justify-between md:col-span-5">
              <div>
                {/* Eyebrow */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#174D35]">
                  LOCAL LIVING
                </p>

                {/* Decorative horizontal accent line */}
                <div className="mt-2 mb-6 h-[2px] w-7 rounded-full bg-[#174D35]/40" />

                {/* Headline */}
                <h2 className="font-serif text-3xl font-normal leading-[1.1] tracking-[-0.03em] text-[#1C1B18] sm:text-4xl lg:text-5xl">
                  Made for life in
                  <br />
                  <em className="font-serif italic text-[#174D35]">Jharsuguda.</em>
                </h2>

                {/* Description */}
                <p className="mt-5 max-w-xs text-xs sm:text-sm leading-relaxed text-[#756A5C]">
                  Discover homes around the places you already know and love.
                </p>

                {/* Primary CTA */}
                <div className="mt-8 sm:mt-10">
                  <Link
                    href="/rentals"
                    className="group inline-flex items-center gap-3 rounded-full bg-[#174D35] px-7 py-3.5 text-xs sm:text-sm font-medium !text-[#F8F4EA] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123d2a]"
                  >
                    <span>Explore local rentals</span>
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </div>
              </div>

              {/* Desktop Decorative Bottom Footer Tag */}
              <div className="hidden md:flex items-center gap-3 mt-14 pt-2">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#756A5C]/70 shrink-0">
                  ROOM / LOCAL LIVING
                </span>
                <div className="flex-1 flex items-center">
                  <div className="h-[1px] w-full bg-[#174D35]/25" />
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#174D35]" />
                </div>
              </div>
            </div>

            {/* Right Column Image */}
            <div className="md:col-span-7">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] md:aspect-[1.15/1] lg:aspect-[4/3] w-full overflow-hidden rounded-[24px] sm:rounded-[28px] border border-[#174D35]/10 bg-[#F8F4EA]">
                <Image
                  src="/images/local_discovery.jpg"
                  alt="Life in Jharsuguda"
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                  priority
                />
              </div>
            </div>

            {/* Mobile Decorative Bottom Footer Tag */}
            <div className="flex md:hidden items-center gap-3 mt-2 pt-2 col-span-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#756A5C]/70 shrink-0">
                ROOM / LOCAL LIVING
              </span>
              <div className="flex-1 flex items-center">
                <div className="h-[1px] w-full bg-[#174D35]/25" />
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#174D35]" />
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
