"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InitialLoader() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if this is the first visit in the current session
    const hasVisited = sessionStorage.getItem("livansa_intro_played");
    
    if (!hasVisited) {
      setShow(true);
      // Let the animation play, then remove it
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("livansa_intro_played", "true");
      }, 1800);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8F4EA]"
        >
          <div className="relative flex flex-col items-center">
            {/* Logo Reveal */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="font-serif text-5xl md:text-6xl italic tracking-tight text-[#1C1B18]"
            >
              livansa
            </motion.h1>

            {/* Progress Line */}
            <div className="mt-6 h-[1px] w-48 overflow-hidden bg-[#1C1B18]/10 sm:w-64">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}
                className="h-full w-full bg-[#174D35]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
