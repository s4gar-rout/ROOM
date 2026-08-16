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
    <article className="group overflow-hidden rounded-3xl border border-[#174D35]/10 bg-white">

      {/* ================================
          IMAGE
      ================================= */}

      <div className="relative aspect-[4/3] overflow-hidden bg-[#DDE7DD]">

        {image ? (
          <img
            src={image}
            alt={room.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[#174D35]/50">
            No image available
          </div>
        )}

        {/* Room Type */}

        <span className="absolute left-4 top-4 rounded-full bg-[#F8F4EA] px-3 py-1.5 text-xs font-semibold text-[#174D35]">
          {roomTypeLabel}
        </span>

        {/* Availability */}

        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-semibold ${
            room.availability
              ? "bg-[#174D35] text-[#F8F4EA]"
              : "bg-[#1C1B18]/75 text-white"
          }`}
        >
          {room.availability
            ? "Available"
            : "Unavailable"}
        </span>

        {/* View Button */}

        <Link
          href={`/rental/${room._id}`}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35] opacity-0 transition-all duration-300 group-hover:opacity-100"
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

            <h3 className="font-serif text-base leading-tight text-[#1C1B18] sm:text-[18px]">
              {room.title}
            </h3>

            <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#756A5C] sm:text-sm">

              <MapPin
                size={13}
                className="shrink-0"
              />

              <span className="truncate">
                {room.location}
              </span>

            </div>
          </div>

          {/* Rent */}

          <div className="shrink-0 text-right">

            <p className="text-base font-bold text-[#174D35] sm:text-lg">
              ₹{room.rent.toLocaleString("en-IN")}
            </p>

            <p className="text-[10px] font-medium text-[#756A5C] sm:text-xs">
              / month
            </p>

          </div>
        </div>

        {/* ================================
            FACILITIES
        ================================= */}

        {room.facilities &&
          room.facilities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#174D35]/10 pt-3">

              {room.facilities
                .slice(0, 3)
                .map((facility) => (
                  <span
                    key={facility}
                    className="rounded-full bg-[#F8F4EA] px-2.5 py-1 text-[10px] font-medium text-[#756A5C] sm:text-xs"
                  >
                    {facility}
                  </span>
                ))}

              {room.facilities.length > 3 && (
                <span className="rounded-full bg-[#F8F4EA] px-2.5 py-1 text-[10px] font-medium text-[#756A5C] sm:text-xs">
                  +{room.facilities.length - 3}
                </span>
              )}
            </div>
          )}
      </div>
    </article>
  );
}