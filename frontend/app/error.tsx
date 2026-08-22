"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, Home } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally for monitoring without exposing stack traces to user
    console.error("Application runtime error caught by error boundary:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#F8F4EA] flex flex-col items-center justify-center px-6 py-12 text-center text-[#1C1B18]">
      <p className="text-xs md:text-[10px] font-semibold uppercase tracking-[0.3em] text-[#174D35]">
        livansa / SYSTEM NOTICE
      </p>

      <h1 className="mt-4 font-serif text-3xl sm:text-5xl font-normal leading-tight tracking-[-0.03em] text-[#1C1B18]">
        Something went <em className="text-[#174D35] not-italic font-serif">wrong.</em>
      </h1>

      <p className="mt-4 max-w-md font-serif italic text-base sm:text-lg text-[#756A5C] leading-relaxed">
        We encountered an unexpected issue while loading this page. Please try again or return to the homepage.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full bg-[#174D35] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] !text-[#F8F4EA] shadow-md transition-all duration-300 hover:bg-[#123d2a]"
        >
          <RotateCw size={14} className="shrink-0" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#174D35]/30 bg-transparent px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1C1B18] transition-all duration-300 hover:border-[#174D35] hover:text-[#174D35]"
        >
          <Home size={14} className="shrink-0 text-[#174D35]" />
          <span>Return Home</span>
        </Link>
      </div>
    </main>
  );
}
