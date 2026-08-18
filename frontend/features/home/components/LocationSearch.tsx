"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { useRouter } from "next/navigation";

const suggestions = [
  "Near Railway Station",
  "Near Bus Stand",
  "Shanti Nagar",
];

export default function LocationSearch() {
  const [location, setLocation] = useState("");
  const router = useRouter();

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
      <div className="mx-auto w-full max-w-5xl">

        {/* Search Bar */}
        <div className="flex w-full flex-col gap-2 rounded-2xl bg-[#174D35] p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-2">

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
            className="h-12 sm:h-14 w-full shrink-0 rounded-xl sm:rounded-full bg-[#F8F4EA] px-6 sm:px-8 text-xs sm:text-sm font-medium !text-[#174D35] transition-colors duration-300 hover:bg-white sm:ml-1 sm:w-auto"
          >
            Search homes
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-2 text-[11px] sm:text-xs text-[#756A5C]">

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

        </div>
      </div>
    </section>
  );
}
