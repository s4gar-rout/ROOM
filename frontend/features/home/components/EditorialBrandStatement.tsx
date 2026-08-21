"use client";

import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants, shouldReduceMotion } from "@/lib/animations";

export default function EditorialBrandStatement() {
  const reduceMotion = shouldReduceMotion();

  return (
    <section className="w-full overflow-hidden bg-[#F8F4EA] px-4 py-16 sm:px-6 sm:py-20 md:py-24 border-t border-[#1C1B18]/10">
      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainerVariants}
      >
        <motion.p
          variants={fadeUpVariants}
          className="mb-3 text-xs md:text-[10px] font-semibold uppercase tracking-[0.3em] text-[#174D35]"
        >
          OUR PHILOSOPHY
        </motion.p>

        <motion.h2
          variants={fadeUpVariants}
          className="font-serif text-3xl font-normal leading-tight tracking-[-0.03em] text-[#1C1B18] sm:text-4xl md:text-5xl lg:text-6xl"
        >
          A room is more than{" "}
          <em className="text-[#174D35] not-italic font-serif">four walls.</em>
        </motion.h2>

        <motion.p
          variants={fadeUpVariants}
          className="mx-auto mt-6 max-w-xl font-serif text-base italic leading-relaxed text-[#756A5C] sm:text-lg md:text-xl"
        >
          It's the morning light, the neighbourhood,
          <br className="hidden sm:block" />
          and the feeling of coming home.
        </motion.p>

        <motion.div
          variants={fadeUpVariants}
          className="mt-8 flex justify-center"
        >
          <div className="h-0.5 w-12 bg-[#174D35]/30 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
