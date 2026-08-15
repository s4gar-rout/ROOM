import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import RentalCard from "./RentalCard";
import { featuredRentals } from "@/lib/room/mock-data";

export default function FeaturedRentals() {
  return (
    <section className="bg-[#F8F4EA] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-lg">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-[#174D35]">
              Featured rentals
            </p>

            <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-[-0.025em] text-[#1C1B18] md:text-4xl">
              Places worth{" "}
              <em className="text-[#174D35]">calling home.</em>
            </h2>

            <p className="mt-2 max-w-md text-xs sm:text-sm leading-6 text-[#756A5C]">
              Explore comfortable rooms and homes from local owners,
              available for long-term living.
            </p>
          </div>

          <Link
            href="/rentals"
            className="group flex w-fit items-center gap-1.5 text-xs sm:text-sm font-medium text-[#174D35]"
          >
            View all rentals

            <ArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* 4 Rental Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredRentals.map((rental) => (
            <RentalCard key={rental.id} rental={rental} />
          ))}
        </div>

      </div>
    </section>
  );
}