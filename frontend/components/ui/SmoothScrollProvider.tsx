"use client";

import { ReactNode, useEffect, useState } from "react";
import Lenis from "lenis";

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Respect accessibility settings
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const _lenis = new Lenis({
      lerp: 0.1, // Subtle, refined easing
      smoothWheel: true,
      syncTouch: false, // Leave mobile touch scrolling native
    });

    setLenis(_lenis);

    let rafId: number;

    function raf(time: number) {
      _lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      _lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
