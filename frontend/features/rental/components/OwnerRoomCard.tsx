"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import type { Room } from "../types/rental";

interface OwnerRoomCardProps {
  room: Room;
  onAvailabilityChange: (
    roomId: string,
    availability: boolean
  ) => void;
  onDelete: (roomId: string) => void;
  onEdit: (roomId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function OwnerRoomCard({
  room,
  onAvailabilityChange,
  onDelete,
  onEdit,
  isUpdating = false,
  isDeleting = false,
}: OwnerRoomCardProps) {
  const image =
    room.images?.[0]?.url ||
    "/images/room-placeholder.jpg";

  const roomType =
    room.roomType === "1BHK"
      ? "1 BHK"
      : room.roomType === "2BHK"
        ? "2 BHK"
        : room.roomType;

  const visibleFacilities =
    room.facilities?.slice(0, 3) || [];

  return (
    <article className="group overflow-hidden rounded-[18px] border border-[#1C1B18]/10 bg-[#F8F4EA] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#174D35]/20 hover:shadow-[0_12px_35px_rgba(28,27,24,0.06)]">

      {/* =====================================
          IMAGE
      ===================================== */}

      <div className="relative aspect-[16/10] overflow-hidden bg-[#E8E3D8]">

        <Image
          src={image}
          alt={room.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025]"
        />

        {/* Availability */}

        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm ${
              room.availability
                ? "bg-[#F8F4EA]/95 text-[#174D35]"
                : "bg-[#F8F4EA]/95 text-[#756A5C]"
            }`}
          >
            {room.availability
              ? "Available"
              : "Unavailable"}
          </span>
        </div>

        {/* Room type */}

        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-[#F8F4EA]/95 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#1C1B18] backdrop-blur-sm">
            {roomType}
          </span>
        </div>

      </div>

      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="p-4">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h3 className="truncate font-serif text-[19px] font-medium leading-tight text-[#1C1B18]">
              {room.title}
            </h3>

            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-[#756A5C]">
              <MapPin size={11} />

              <span className="truncate">
                {room.location}
              </span>
            </div>

          </div>

          {/* Rent */}

          <div className="shrink-0 text-right">

            <p className="font-serif text-[19px] font-medium leading-none text-[#174D35]">
              ₹{Number(room.rent ?? 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.15em] text-[#756A5C]">
              / month
            </p>

          </div>

        </div>

        {/* =====================================
            FACILITIES
        ===================================== */}

        {visibleFacilities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">

            {visibleFacilities.map((facility) => (
              <span
                key={facility}
                className="rounded-full border border-[#1C1B18]/8 bg-white/70 px-2.5 py-1.5 text-[8px] font-semibold text-[#756A5C]"
              >
                {facility}
              </span>
            ))}

            {room.facilities &&
              room.facilities.length > 3 && (
                <span className="rounded-full bg-[#174D35]/5 px-2.5 py-1.5 text-[8px] font-semibold text-[#174D35]">
                  +{room.facilities.length - 3}
                </span>
              )}

          </div>
        )}

        {/* =====================================
            ACTIONS
        ===================================== */}

        <div className="mt-4 flex items-center gap-2 border-t border-[#1C1B18]/8 pt-4">

          {/* Availability */}

          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              onAvailabilityChange(
                room._id,
                !room.availability
              )
            }
            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border text-[9px] font-bold uppercase tracking-[0.12em] transition ${
              room.availability
                ? "border-[#174D35] bg-[#174D35] text-[#F8F4EA] hover:bg-transparent hover:text-[#174D35]"
                : "border-[#174D35]/35 bg-transparent text-[#174D35] hover:bg-[#174D35] hover:text-[#F8F4EA]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {room.availability ? (
              <Check size={12} />
            ) : (
              <X size={12} />
            )}

            {isUpdating
              ? "Updating"
              : room.availability
                ? "Available"
                : "Unavailable"}
          </button>

          {/* Edit */}

          <button
            type="button"
            onClick={() => onEdit(room._id)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1C1B18]/10 bg-white text-[#174D35] transition hover:border-[#174D35]/30 hover:bg-[#174D35] hover:text-[#F8F4EA]"
            aria-label="Edit room"
          >
            <Pencil size={13} />
          </button>

          {/* Delete */}

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onDelete(room._id)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/10 bg-white text-red-500 transition hover:border-red-500/20 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Delete room"
          >
            <Trash2 size={13} />
          </button>

          {/* Open */}

          <button
            type="button"
            onClick={() =>
              window.open(
                `/rooms/${room._id}`,
                "_self"
              )
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1C1B18]/10 bg-white !text-[#174D35] transition hover:border-[#174D35]/30 hover:!bg-[#174D35] hover:!text-[#F8F4EA]"
            aria-label="View room"
          >
            <ArrowUpRight size={14} />
          </button>

        </div>

      </div>
    </article>
  );
}