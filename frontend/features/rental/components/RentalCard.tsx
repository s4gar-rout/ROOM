import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Rental } from "@/features/rental/types/rental";

type RentalCardProps = {
  rental: Rental;
};

export default function RentalCard({ rental }: RentalCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[#174D35]/10 bg-white">
      {/* Image Placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#DDE7DD]">
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#174D35]/50">
          Rental Image
        </div>

        {/* Property Type */}
        <span className="absolute left-4 top-4 rounded-full bg-[#F8F4EA] px-3 py-1.5 text-xs font-medium text-[#174D35]">
          {rental.propertyType}
        </span>

        {/* View Button */}
        <Link
          href={`/rental/${rental.id}`}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35] opacity-0 transition-all duration-300 group-hover:opacity-100"
          aria-label={`View ${rental.title}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-base sm:text-[18px] leading-tight text-[#1C1B18]">
              {rental.title}
            </h3>

            <div className="mt-1.5 flex items-center gap-1 text-xs sm:text-sm text-[#756A5C]">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">
                {rental.area}, {rental.location}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base sm:text-lg font-semibold text-[#174D35]">
              ₹{rental.rent.toLocaleString("en-IN")}
            </p>

            <p className="text-[10px] sm:text-xs text-[#756A5C]">/ month</p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#174D35]/10 pt-3">
          <span className="rounded-full bg-[#F8F4EA] px-2.5 py-1 text-[10px] sm:text-xs text-[#756A5C]">
            {rental.furnished}
          </span>

          <span className="rounded-full bg-[#F8F4EA] px-2.5 py-1 text-[10px] sm:text-xs text-[#756A5C]">
            ₹{rental.deposit.toLocaleString("en-IN")} deposit
          </span>
        </div>
      </div>
    </article>
  );
}
