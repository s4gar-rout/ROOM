"use client";

import { motion } from "framer-motion";

export default function ButtonLoader({ color = "currentColor" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-[3px] px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="h-[3px] w-[3px] rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
