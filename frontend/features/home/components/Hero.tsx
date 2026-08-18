import { Sparkles, ArrowUpRight, ArrowDown } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8F4EA] text-[#1C1B18]">

      {/* HERO */}
      <section className="px-5 pb-10 pt-20 sm:px-8 sm:pt-24 md:px-12 md:pt-28 lg:px-16 lg:pt-32">
        <div className="mx-auto max-w-[1400px]">

          {/* Hero Content */}
          <div className="text-center">

            {/* Eyebrow */}
            <div className="mb-7 flex items-center justify-center gap-3">
              <Sparkles
                size={20}
                strokeWidth={1.5}
                className="text-[#174D35]"
              />

              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#174D35] sm:text-xs">
                A better way to rent
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mx-auto max-w-[1250px] font-serif text-[3.3rem] leading-[0.95] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[7.5rem]">
              Find a place{" "}
              <em className="font-serif text-[#174D35]">
                to belong.
              </em>
            </h1>

            {/* Small Supporting Heading */}
            <p className="mx-auto mt-7 max-w-[650px] font-serif text-lg italic leading-7 text-[#756A5C] sm:text-xl">
              Rent somewhere that feels like home,
              <br className="hidden sm:block" />
              not just somewhere you can stay.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">

              {/* Primary */}
              <Link
                href="/rentals"
                className="
                  group flex h-14 min-w-[200px] items-center justify-center
                  gap-3 rounded-full
                  bg-[#174D35] px-7
                  text-sm font-medium text-[#F8F4EA]
                  transition-all duration-300
                  hover:-translate-y-0.5
                "
              >
                Explore rentals

                <ArrowUpRight
                  size={18}
                  strokeWidth={1.7}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              {/* Secondary */}
              <Link
                href="/owner-dashboard/add-room"
                className="
                  flex h-14 min-w-[200px] items-center justify-center rounded-full
                  border border-[#174D35]/45
                  bg-transparent px-7
                  text-sm font-medium text-[#174D35]
                  transition-all duration-300
                  hover:bg-[#174D35]
                  hover:text-[#F8F4EA]
                "
              >
                List your property
              </Link>
            </div>

            {/* Trust Points */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#756A5C]">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#174D35]" />
                Verified listings
              </span>

              <span className="text-[#B7AA99]">·</span>

              <span>Local owners</span>

              <span className="text-[#B7AA99]">·</span>

              <span>Monthly rentals</span>
            </div>

            {/* Explore Indicator */}
            <div className="mt-12 flex flex-col items-center gap-1 text-[#B7AA99]">
              <span className="text-[9px] font-medium uppercase tracking-[0.3em]">
                Explore
              </span>

              <ArrowDown
                size={15}
                strokeWidth={1.3}
              />
            </div>
          </div>

          {/* Bottom Section Label */}
          <div className="mt-16 border-t border-[#D8D0C3] pt-7 sm:mt-20 md:mt-24">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

              {/* Left */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#8B7D6D]">
                  Room / Rentals
                </p>

                <p className="mt-2 text-sm text-[#756A5C]">
                  Thoughtfully listed homes for long-term living.
                </p>
              </div>

              {/* Right */}
              <div className="sm:text-right">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#8B7D6D]">
                  Jharsuguda • Odisha
                </p>

                <p className="mt-2 text-sm text-[#756A5C]">
                  Built for local living.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
