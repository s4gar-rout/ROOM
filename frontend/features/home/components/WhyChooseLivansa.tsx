"use client";

import { Wallet, SlidersHorizontal, MessageCircle, Home } from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeUpVariants,
  staggerContainerVariants,
  shouldReduceMotion,
} from "@/lib/animations";

const usps = [
  {
    number: "01",
    icon: Wallet,
    title: "Zero Broker Fees",
    description:
      "Find your next place without paying unnecessary brokerage fees.",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Simple Search",
    description:
      "Search rooms by location, budget, and your preferences without wasting time.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Direct Connections",
    description:
      "Connect directly with property owners and get the information you need before making a decision.",
  },
  {
    number: "04",
    icon: Home,
    title: "Made for You",
    description:
      "Whether you're a student, professional, or simply looking for a new place, Livansa makes finding the right space easier.",
  },
];

export default function WhyChooseLivansa() {
  const reduceMotion = shouldReduceMotion();

  return (
    <section className="bg-[#F8F4EA] px-4 py-12 sm:px-6 md:py-16">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainerVariants}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <motion.div variants={fadeUpVariants} className="max-w-2xl">
            <p className="mb-1 text-xs md:text-[10px] font-medium uppercase tracking-[0.3em] text-[#174D35]">
              Why Livansa
            </p>

            <h2 className="font-serif text-2xl leading-tight tracking-[-0.025em] text-[#1C1B18] sm:text-3xl md:text-4xl">
              Why Choose{" "}
              <em className="text-[#174D35] not-italic font-serif">Livansa?</em>
            </h2>

            <p className="mt-2 text-xs sm:text-sm leading-6 text-[#756A5C]">
              Finding a place to stay shouldn&apos;t be complicated. Livansa makes
              it easier to discover spaces that fit your needs, connect with
              property owners, and find a place that feels like home.
            </p>
          </motion.div>

          {/* Editorial Accent Note */}
          <motion.div
            variants={fadeUpVariants}
            className="hidden md:flex items-center gap-2 text-xs font-serif italic text-[#756A5C]/80 pb-1"
          >
            <span>&ldquo;Your space. Your choice. Your way.&rdquo;</span>
          </motion.div>
        </div>

        {/* Feature Cards Grid - Uniform and Cohesive */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {usps.map((usp) => {
            const Icon = usp.icon;

            return (
              <motion.div
                key={usp.title}
                variants={fadeUpVariants}
                className="group flex flex-col justify-between rounded-3xl border border-[#174D35]/15 bg-[#FAF7F0] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#174D35]/35 hover:shadow-lg hover:shadow-[#174D35]/5"
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#174D35] text-[#F8F4EA] transition-transform duration-300 group-hover:scale-105">
                      <Icon size={20} strokeWidth={1.75} />
                    </div>

                    <span className="font-mono text-xs md:text-[10px] tracking-[0.25em] text-[#756A5C]/60">
                      {usp.number}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-6 font-serif text-xl sm:text-2xl text-[#1C1B18] tracking-[-0.01em]">
                    {usp.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs sm:text-sm leading-6 text-[#756A5C]">
                    {usp.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Editorial Statement Tag */}
        <motion.div
          variants={fadeUpVariants}
          className="mt-6 flex md:hidden items-center justify-between border-t border-[#174D35]/10 pt-3"
        >
          <span className="text-xs font-serif italic text-[#756A5C]">
            &ldquo;Your space. Your choice. Your way.&rdquo;
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#756A5C]/60">
            livansa
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
