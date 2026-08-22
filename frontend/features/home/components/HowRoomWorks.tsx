"use client";

import { Search, MessageCircle, Home } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants, shouldReduceMotion } from "@/lib/animations";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find a place",
    description:
      "Search rooms and homes around your preferred area and budget.",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Connect with owner",
    description:
      "Chat with owners, ask questions and schedule a visit.",
  },
  {
    number: "03",
    icon: Home,
    title: "Move in",
    description:
      "Choose the place that feels right and make it your home.",
  },
];

export default function HowRoomWorks() {
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
        <motion.div variants={staggerItemVariants} className="max-w-xl">
          <p className="mb-1 text-xs md:text-[10px] font-medium uppercase tracking-[0.3em] text-[#174D35]">
            How livansa works
          </p>

          <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-[-0.025em] text-[#1C1B18] md:text-4xl">
            Renting made{" "}
            <em className="text-[#174D35]">simple.</em>
          </h2>

          <p className="mt-2 text-xs sm:text-sm leading-6 text-[#756A5C]">
            From finding a place to connecting with the owner,
            livansa keeps the process simple.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={fadeUpVariants}
                className="group flex flex-col justify-between rounded-3xl border border-[#174D35]/15 bg-[#FAF7F0] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#174D35]/35 hover:shadow-lg hover:shadow-[#174D35]/5"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#174D35] text-[#F8F4EA] transition-transform duration-300 group-hover:scale-105">
                      <Icon size={20} strokeWidth={1.75} />
                    </div>

                    <span className="font-mono text-xs md:text-[10px] tracking-[0.25em] text-[#756A5C]/60">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 font-serif text-xl sm:text-2xl text-[#1C1B18] tracking-[-0.01em]">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm leading-6 text-[#756A5C]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </motion.div>
    </section>
  );
}
