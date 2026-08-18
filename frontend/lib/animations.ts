import { Variants } from "framer-motion";

// Default easing curve for a premium, smooth feel
export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const easeInOutExpo: [number, number, number, number] = [0.87, 0, 0.13, 1];
export const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1];

// Base duration
export const duration = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.8,
};

// 1. Page Transition Variants (Tier 1)
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: duration.normal, ease: easeOutQuart } 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    transition: { duration: duration.fast, ease: easeOutQuart } 
  },
};

// 2. Hero / Section Reveal Variants (Tier 1)
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: duration.slow, ease: easeOutExpo } 
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: duration.normal, ease: easeOutExpo } 
  },
};

// 3. Typography Reveals (Tier 2)
// For line/word reveals (assumes words are split and wrapped in motion.span)
export const wordRevealVariants: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: "0%",
    transition: { duration: duration.slow, ease: easeOutExpo }
  }
};

// 4. Room Card Hover Micro-interactions (Tier 1)
export const cardHoverVariants = {
  initial: { y: 0 },
  hover: { 
    y: -4, 
    transition: { duration: duration.fast, ease: easeOutQuart } 
  }
};

export const imageHoverVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.03, 
    transition: { duration: duration.normal, ease: easeOutQuart } 
  }
};

// 5. Success State Variants (Tier 1)
export const successCheckVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { duration: duration.normal, ease: easeOutExpo } 
  }
};

export const successPopVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 300, damping: 20 } 
  }
};

// Utility to respect reduced motion (use in hooks if needed)
export const shouldReduceMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
