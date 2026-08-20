import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you were looking for could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F8F4EA] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#174D35]">
        livansa / 404
      </p>

      <h1 className="mt-4 font-serif text-6xl sm:text-8xl font-normal leading-none tracking-[-0.04em] text-[#1C1B18]">
        Lost?
      </h1>

      <p className="mt-6 max-w-sm font-serif italic text-lg text-[#756A5C] leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#1C1B18] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#F8F4EA] transition hover:bg-[#174D35]"
        >
          Back to Home
        </Link>
        <Link
          href="/rentals"
          className="inline-flex items-center gap-2 rounded-full border border-[#1C1B18]/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#1C1B18] transition hover:border-[#174D35] hover:text-[#174D35]"
        >
          Browse Rooms
        </Link>
      </div>
    </main>
  );
}
