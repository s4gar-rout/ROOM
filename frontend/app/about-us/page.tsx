import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Heart, Sparkles, Building2, Users, Compass } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About Us | ROOM",
  description: "Learn about ROOM — simplifying long-term rental discovery through thoughtful editorial design and direct owner connections.",
};

const values = [
  {
    icon: Compass,
    title: "Thoughtful Curation",
    description: "Every listing is presented with clarity and accuracy, eliminating cluttered interfaces and misleading descriptions.",
  },
  {
    icon: ShieldCheck,
    title: "Direct & Transparent",
    description: "We connect tenants directly with verified property owners without unnecessary middlemen or hidden platform markups.",
  },
  {
    icon: Heart,
    title: "Tenants & Owners First",
    description: "Built to foster trust, smooth communication, and long-term peace of mind for both home seekers and property owners.",
  },
  {
    icon: Sparkles,
    title: "Editorial Design",
    description: "Inspired by modern high-end architectural publications, combining spacious layouts with serene color palettes.",
  },
];

const highlights = [
  { value: "0%", label: "Brokerage Fees" },
  { value: "Direct", label: "Owner Messaging" },
  { value: "100%", label: "Free Listing" },
  { value: "Verified", label: "Property Quality" },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#F8F4EA] text-[#1C1B18]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        {/* ========================================================
            HERO SECTION
        ======================================================== */}
        <section className="text-center max-w-3xl mx-auto">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#174D35]">
            ABOUT ROOM
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.1] tracking-[-0.035em] text-[#1C1B18]">
            Refining how people find <em className="text-[#174D35] not-italic">home.</em>
          </h1>

          <p className="mt-6 font-serif text-lg sm:text-xl italic text-[#756A5C] leading-relaxed">
            ROOM is an editorial-grade long-term rental platform designed to make discovering your next sanctuary simple, transparent, and beautiful.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="h-0.5 w-16 bg-[#174D35]/30 rounded-full" />
          </div>
        </section>

        {/* ========================================================
            MISSION & PHILOSOPHY
        ======================================================== */}
        <section className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rounded-3xl border border-[#1C1B18]/12 bg-[#FAF7F0] p-8 sm:p-10 shadow-sm">
            <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[#174D35] mb-3">
              OUR PHILOSOPHY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1B18] leading-tight">
              A room is more than four walls. It’s where life happens.
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-[#514A42]">
              Finding long-term accommodation shouldn’t feel like navigating an advertising billboard. We set out to create a peaceful digital sanctuary—where property photos take center stage, details are straightforward, and contacting property owners takes just one click.
            </p>
          </div>

          <div className="rounded-3xl border border-[#174D35]/20 bg-[#174D35] p-8 sm:p-10 text-[#F8F4EA] shadow-md">
            <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[#C8D5CA] mb-3">
              OUR MISSION
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F8F4EA] leading-tight">
              Empowering direct, trustworthy renting across cities.
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-[#C8D5CA]">
              We bridge the gap between verified room owners and prospective tenants. By focusing on quality over noise, we build lasting connections and hassle-free rental experiences.
            </p>
          </div>
        </section>

        {/* ========================================================
            CORE VALUES
        ======================================================== */}
        <section className="mt-20 sm:mt-28">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#174D35]">
              WHAT GUIDES US
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1C1B18]">
              Built on core values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#1C1B18]/12 bg-[#FAF7F0] p-6 transition-all duration-300 hover:border-[#174D35]/40 hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-[#1C1B18]">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-sans text-xs leading-relaxed text-[#62594F]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            PLATFORM HIGHLIGHTS & PROMISES
        ======================================================== */}
        <section className="mt-20 sm:mt-28 rounded-3xl border border-[#1C1B18]/12 bg-[#FAF7F0] px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, idx) => (
              <div key={idx}>
                <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#174D35]">
                  {item.value}
                </div>
                <div className="mt-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#756A5C]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            CTA SECTION
        ======================================================== */}
        <section className="mt-20 sm:mt-28 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1C1B18]">
            Ready to find your sanctuary?
          </h2>
          <p className="mt-3 font-sans text-sm text-[#62594F]">
            Browse our curated collection of verified room rentals or list your property in minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/rentals"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#174D35] bg-[#174D35] px-8 font-sans text-xs font-bold uppercase tracking-[0.2em] !text-[#F8F4EA] shadow-md transition-all duration-300 hover:bg-[#123d2a]"
            >
              <span className="!text-[#F8F4EA]">Explore Rentals</span>
              <ArrowUpRight size={14} className="!text-[#F8F4EA]" />
            </Link>

            <Link
              href="/owner-dashboard/add-room"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#174D35]/30 bg-white/40 px-8 font-sans text-xs font-bold uppercase tracking-[0.2em] !text-[#174D35] shadow-sm transition-all duration-300 hover:bg-[#174D35] hover:!text-[#F8F4EA]"
            >
              <span>List a Room</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
