import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
} from "lucide-react";

import type { Room } from "@/features/rental/types/rental";

type RentalCardProps = {
  room: Room;
};

export default function RentalCard({
  room,
}: RentalCardProps) {
  const roomTypeLabel =
    room.roomType === "1BHK"
      ? "1 BHK"
      : room.roomType === "2BHK"
        ? "2 BHK"
        : room.roomType.charAt(0).toUpperCase() +
          room.roomType.slice(1);

  const image =
    room.images && room.images.length > 0
      ? room.images[0].url
      : null;

  return (
    <article className="group overflow-hidden rounded-[2px] border border-[#1C1B18]/15 bg-transparent transition-all duration-300 hover:border-[#174D35]/30">

      {/* ================================
          IMAGE
      ================================= */}

      <div className="relative aspect-[4/3] overflow-hidden bg-[#1C1B18]/5 border-b border-[#1C1B18]/15">

        {image ? (
          <img
            src={image}
            alt={room.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5F554A]">
            No image
          </div>
        )}

        {/* Room Type */}

        <span className="absolute left-3 top-3 rounded-[2px] bg-[#F8F4EA] px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-[#174D35] shadow-sm">
          {roomTypeLabel}
        </span>

        {/* Availability */}

        <span
          className={`absolute right-3 top-3 rounded-[2px] px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.16em] shadow-sm ${
            room.availability
              ? "bg-[#174D35] text-[#F8F4EA]"
              : "bg-[#1C1B18] text-white"
          }`}
        >
          {room.availability
            ? "Available"
            : "Unavailable"}
        </span>

        {/* View Button */}

        <Link
          href={`/rentals/${room._id}`}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35] shadow-sm opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#174D35] hover:text-[#F8F4EA]"
          aria-label={`View ${room.title}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* ================================
          CONTENT
      ================================= */}

      <div className="p-4 sm:p-5">

        <div className="flex items-start justify-between gap-3">

          {/* Title + Location */}

          <div className="min-w-0">

            <h3 className="font-serif text-lg leading-tight tracking-[-0.02em] text-[#1C1B18]">
              {room.title}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.15em] text-[#5F554A]">

              <MapPin
                size={12}
                className="shrink-0"
              />

              <span className="truncate">
                {room.location}
              </span>

            </div>
          </div>

          {/* Rent */}

          <div className="shrink-0 text-right">

            <p className="font-serif text-[18px] tracking-tight text-[#174D35]">
              ₹{room.rent.toLocaleString("en-IN")}
            </p>

            <p className="mt-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.15em] text-[#5F554A]">
              / month
            </p>

          </div>
        </div>

        {/* ================================
            FACILITIES
        ================================= */}

        {room.facilities &&
          room.facilities.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5 border-t border-[#1C1B18]/10 pt-4">

              {room.facilities
                .slice(0, 3)
                .map((facility) => (
                  <span
                    key={facility}
                    className="rounded-[2px] border border-[#1C1B18]/15 bg-transparent px-2 py-1 font-sans text-[8px] font-semibold uppercase tracking-[0.15em] text-[#5F554A]"
                  >
                    {facility}
                  </span>
                ))}

              {room.facilities.length > 3 && (
                <span className="rounded-[2px] border border-[#1C1B18]/15 bg-transparent px-2 py-1 font-sans text-[8px] font-semibold uppercase tracking-[0.15em] text-[#5F554A]">
                  +{room.facilities.length - 3}
                </span>
              )}
            </div>
          )}
      </div>
    </article>
  );
}