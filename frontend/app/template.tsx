"use client";

import { motion } from "framer-motion";
import { pageTransitionVariants, shouldReduceMotion } from "@/lib/animations";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = shouldReduceMotion();

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial={reduceMotion ? false : "initial"}
      animate={reduceMotion ? false : "animate"}
      // We don't use exit here because AnimatePresence requires custom setup in app router,
      // and a clean entrance is usually enough for a subtle premium feel.
      className="flex-1 flex flex-col min-h-0"
    >
      {children}
    </motion.div>
  );
}
