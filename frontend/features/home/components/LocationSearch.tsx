"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants, shouldReduceMotion } from "@/lib/animations";

const suggestions = [
  "Near Railway Station",
  "Near Bus Stand",
  "Shanti Nagar",
];

export default function LocationSearch() {
  const [location, setLocation] = useState("");
  const router = useRouter();
  const reduceMotion = shouldReduceMotion();

  const handleSearch = () => {
    if (!location.trim()) return;

    router.push(`/rentals?location=${encodeURIComponent(location.trim())}`);
  };

  const handleSuggestion = (value: string) => {
    setLocation(value);
    router.push(`/rentals?location=${encodeURIComponent(value.trim())}`);
  };

  return (
    <section className="w-full overflow-hidden bg-[#F8F4EA] px-4 pb-8 sm:pb-10 sm:px-6">
      <motion.div 
        className="mx-auto w-full max-w-5xl"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainerVariants}
      >

        {/* Mobile Search Card (< md) */}
        <motion.div 
          variants={fadeUpVariants} 
          className="block md:hidden rounded-2xl border border-[#174D35]/15 bg-[#FFFDF8] p-4 shadow-sm shadow-[#174D35]/5"
        >
          {/* Location Input */}
          <div className="flex h-13 w-full items-center gap-3 rounded-xl border border-[#174D35]/15 bg-[#F8F4EA]/60 px-3.5">
            <MapPin
              size={18}
              strokeWidth={1.8}
              className="shrink-0 text-[#174D35]"
            />

            <div className="min-w-0 flex-1">
              <label
                htmlFor="mobile-location"
                className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]"
              >
                Location
              </label>

              <input
                id="mobile-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Area, landmark or locality"
                className="w-full min-w-0 truncate bg-transparent text-sm text-[#1C1B18] outline-none placeholder:text-[#8B7D6D]"
              />
            </div>
          </div>

          {/* Primary Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-[#174D35] text-sm font-semibold !text-[#F8F4EA] transition-colors hover:bg-[#123d2a] active:bg-[#0d2e1f]"
          >
            Search homes
          </button>

          {/* Search Suggestion Chips */}
          <div className="mt-4 border-t border-[#1C1B18]/10 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[#756A5C]">
              Try searching near
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className="rounded-full border border-[#174D35]/20 bg-[#174D35]/5 px-3 py-1.5 text-xs font-medium text-[#174D35] transition-colors hover:bg-[#174D35]/10 active:bg-[#174D35]/20"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Desktop Search Bar (>= md) */}
        <motion.div variants={fadeUpVariants} className="hidden md:flex w-full flex-col gap-2 rounded-2xl bg-[#174D35] p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-2">

          {/* Input */}
          <div className="flex h-12 sm:h-14 min-w-0 flex-1 items-center gap-3 sm:gap-4 rounded-xl sm:rounded-full bg-[#2D6047] px-4 sm:px-6">

            <Search
              size={18}
              strokeWidth={1.7}
              className="shrink-0 text-[#F8F4EA]"
            />

            <div className="min-w-0 flex-1 flex items-center gap-3">
              <label
                htmlFor="location"
                className="shrink-0 text-[8px] font-medium uppercase tracking-[0.3em] text-[#C8D5CA] sm:text-[9px]"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Area, landmark or locality"
                className="w-full min-w-0 truncate bg-transparent text-xs text-[#F8F4EA] outline-none placeholder:text-[#B8C5BA] sm:text-sm"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="h-12 sm:h-14 w-full shrink-0 rounded-xl sm:rounded-full bg-[#F8F4EA] px-6 sm:px-8 text-xs sm:text-sm font-medium !text-[#174D35] transition-colors duration-300 hover:bg-white sm:ml-1 sm:w-auto hover:scale-[1.02]"
          >
            Search homes
          </button>
        </motion.div>

        {/* Desktop Suggestions (>= md) */}
        <motion.div variants={fadeUpVariants} className="hidden md:flex mt-3 flex-wrap items-center justify-center gap-x-4 gap-y-1 px-2 text-[11px] sm:text-xs text-[#756A5C]">

          <span>Try:</span>

          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestion(suggestion)}
              className="whitespace-nowrap transition-colors duration-200 hover:text-[#174D35]"
            >
              {suggestion}
            </button>
          ))}

        </motion.div>
      </motion.div>
    </section>
  );
}

