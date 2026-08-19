"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowUpRight,
  Check,
  Home,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";

import {
  deleteRoom,
  getMyRooms,
  updateRoomAvailability,
} from "@/features/rental/services/rental.service";

import type { Room } from "@/features/rental/types/rental";

import OwnerRoomCard from "@/features/rental/components/OwnerRoomCard";
import ButtonLoader from "@/components/ui/ButtonLoader";

export default function OwnerDashboardPage() {
  const router = useRouter();

  const { user, loading: authLoading, isAuthenticated, logout: globalLogout } = useAuth();

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [roomsLoading, setRoomsLoading] =
    useState(false);

  const [updatingRoom, setUpdatingRoom] =
    useState<string | null>(null);

  const [deletingRoom, setDeletingRoom] =
    useState<string | null>(null);

  const [serverError, setServerError] =
    useState("");

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
    try {
      setServerError("");
      const myRooms = await getMyRooms();
      setRooms(myRooms);
    } catch (error: unknown) {
      console.error("Dashboard error:", error);
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        router.replace(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      setServerError(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    if (!authLoading && isAuthenticated && user?.role !== "owner") {
      router.replace("/");
      return;
    }

    if (isAuthenticated && user?.role === "owner") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user?.role, router]);

  // ==========================================
  // STATS
  // ==========================================

  const totalRooms = rooms.length;

  const availableRooms = useMemo(
    () =>
      rooms.filter(
        (room) => room.availability
      ).length,
    [rooms]
  );

  const unavailableRooms =
    totalRooms - availableRooms;

  // ==========================================
  // AVAILABILITY
  // ==========================================

  const handleAvailabilityChange = async (
    roomId: string,
    availability: boolean
  ) => {
    try {
      setUpdatingRoom(roomId);
      const response =
        await updateRoomAvailability(
          roomId,
          availability
        );

      setRooms((prev) =>
        prev.map((room) =>
          room._id === roomId
            ? {
                ...room,
                ...(response.room || {}),
                availability: response.room?.availability ?? availability,
              }
            : room
        )
      );
    } catch (error: unknown) {
      console.error(
        "Availability update error:",
        error
      );

      setServerError(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Unable to update availability."
      );
    } finally {
      setUpdatingRoom(null);
    }
  };

  const [roomToDelete, setRoomToDelete] =
    useState<string | null>(null);

  // ==========================================
  // DELETE
  // ==========================================

  const handleDeleteClick = (roomId: string) => {
    setRoomToDelete(roomId);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;

    try {
      setDeletingRoom(roomToDelete);
      setServerError("");
      await deleteRoom(roomToDelete);

      setRooms((prev) =>
        prev.filter(
          (room) => (room._id || (room as any).id) !== roomToDelete
        )
      );
      setRoomToDelete(null);
    } catch (error: unknown) {
      console.error(
        "Delete room error:",
        error
      );

      setServerError(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Unable to delete room."
      );
    } finally {
      setDeletingRoom(null);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogout = async () => {
    try {
      await globalLogout();
      router.replace("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      router.replace("/login");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F8F4EA] px-5 py-8">
          <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-5 w-20 rounded-full bg-[#174D35]/10" />
          <div className="mt-12 h-12 w-64 rounded-full bg-[#174D35]/10" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-[20px] bg-[#174D35]/5" />
            <div className="h-28 rounded-[20px] bg-[#174D35]/5" />
            <div className="h-28 rounded-[20px] bg-[#174D35]/5" />
          </div>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EA] text-[#1C1B18] pb-24 md:pb-12">

        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-7 lg:px-8">

          {/* ======================================
              INTRO
        ====================================== */}

        <section className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-3">

              <span className="h-px w-8 bg-[#174D35]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35]">
                Owner Dashboard
              </span>

            </div>

            <h1 className="font-serif text-[42px] font-medium leading-none tracking-[-0.035em] sm:text-[48px]">
              Your{" "}
              <span className="italic text-[#174D35]">
                rooms.
              </span>
            </h1>

            <p className="mt-3 max-w-md text-[11px] font-medium leading-5 text-[#5F554A]">
              Manage your listings, update availability,
              and keep your rooms ready for tenants.
            </p>

          </div>

          {/* ADD ROOM */}

          <div>

            <button
              onClick={() => {
                router.push("/owner-dashboard/add-room");
              }}
              className="group inline-flex h-10 items-center gap-2 rounded-full px-5 text-[9px] font-bold uppercase tracking-[0.16em] transition bg-[#174D35] text-[#F8F4EA] hover:bg-[#F8F4EA] hover:text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40"
            >

              Add a room

              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />

            </button>

          </div>

        </section>

        {/* ======================================
            ERROR
        ====================================== */}

        {serverError && (
          <div className="mt-5 flex items-center justify-between rounded-[12px] border border-red-500/10 bg-red-500/5 px-4 py-3 text-[10px] font-semibold text-red-600">

            <span>{serverError}</span>

            <button
              onClick={() =>
                setServerError("")
              }
            >
              <X size={14} />
            </button>

          </div>
        )}

        {/* ======================================
            STATS
        ====================================== */}

        <section className="mt-7 grid gap-3 md:grid-cols-3">

          <StatCard
            icon={<Home size={15} />}
            value={totalRooms}
            label="Total rooms"
          />

          <StatCard
            icon={<Check size={15} />}
            value={availableRooms}
            label="Available rooms"
          />

          <StatCard
            icon={<X size={15} />}
            value={unavailableRooms}
            label="Sold out rooms"
          />

        </section>

        {/* ======================================
            LISTINGS & MESSAGES
        ====================================== */}

        <section className="mt-10">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#174D35]">
                Your listings
              </p>

              <p className="mt-1 text-[10px] font-medium text-[#756A5C]">
                {totalRooms}{" "}
                {totalRooms === 1
                  ? "room"
                  : "rooms"}{" "}
                listed
              </p>

            </div>

            <button
              onClick={() => {
                setRoomsLoading(true);
                loadDashboard();
              }}
              disabled={roomsLoading}
              className="group flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#756A5C] transition hover:text-[#174D35] disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={
                  roomsLoading
                    ? "animate-spin"
                    : "transition-transform group-hover:rotate-180"
                }
              />

              Refresh
            </button>

          </div>

          {/* ======================================
              ROOMS GRID
          ====================================== */}

          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

              {rooms.map((room, index) => (
                <OwnerRoomCard
                  key={room._id || index}
                  room={room}
                  onAvailabilityChange={
                    handleAvailabilityChange
                  }
                  onDelete={handleDeleteClick}
                  onEdit={(roomId: string) =>
                    router.push(
                      `/owner-dashboard/rooms/${roomId}/edit`
                    )
                  }
                  isUpdating={
                    updatingRoom === room._id
                  }
                  isDeleting={
                    deletingRoom === room._id
                  }
                />
              ))}

            </div>
          ) : (
            /* ====================================
                EMPTY STATE
            ==================================== */

            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#1C1B18]/10 bg-[#F5F0E5] px-5 text-center">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#174D35]/5 text-[#174D35]">
                <Home size={17} />
              </div>

              <h2 className="mt-4 font-serif text-[23px] font-medium">
                No rooms yet.
              </h2>

              <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#756A5C]">
                Start by adding your first room listing.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/owner-dashboard/add-room"
                  )
                }
                className="mt-4 flex h-9 items-center gap-2 rounded-full bg-[#174D35] px-5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#F8F4EA]"
              >
                Add your first room

                <ArrowUpRight size={13} />
              </button>

            </div>
          )}

        </section>

        {/* ======================================
            FOOTER
        ====================================== */}

        <footer className="mt-12 border-t border-[#1C1B18]/8 py-5">

          <div className="flex items-center justify-between">

            <p className="text-[9px] font-medium text-[#756A5C]">
              © {new Date().getFullYear()} room.
            </p>

            <p className="text-[9px] font-medium text-[#756A5C]">
              Built for better renting.
            </p>

          </div>

        </footer>

      </div>

    </main>

    {/* DELETE CONFIRMATION MODAL */}
    {roomToDelete && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0F1E17]/45 backdrop-blur-[10px] animate-in fade-in duration-300"
        onClick={(e) => {
          if (e.target === e.currentTarget && deletingRoom !== roomToDelete) {
            setRoomToDelete(null);
          }
        }}
      >
        <div 
          className="w-full max-w-[480px] sm:max-w-[500px] rounded-[28px] border border-[#174D35]/12 bg-[#FAF7F2] p-7 sm:p-9 shadow-[0_24px_50px_-12px_rgba(28,27,24,0.14)] text-[#1C1B18] animate-in fade-in zoom-in-95 duration-300 ease-out"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          {/* Subtle Icon Container */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#174D35]/8 text-[#174D35] border border-[#174D35]/12 mb-5">
            <Trash2 size={20} strokeWidth={1.75} />
          </div>

          {/* Heading & Description */}
          <h3 id="delete-modal-title" className="font-serif text-2xl sm:text-[28px] font-normal leading-tight text-[#1C1B18] tracking-tight">
            Delete listing?
          </h3>
          <p id="delete-modal-description" className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#756A5C]">
            Are you sure you want to delete this room listing? This action cannot be undone.
          </p>

          {/* Composition Divider */}
          <div className="my-6 border-t border-[#1C1B18]/8" />

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              disabled={deletingRoom === roomToDelete}
              onClick={() => setRoomToDelete(null)}
              className="w-full sm:w-auto h-11 rounded-full border border-[#1C1B18]/15 bg-[#F5F0E5]/70 px-6 text-xs sm:text-[13px] font-semibold text-[#1C1B18] hover:bg-[#EFE8D8] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingRoom === roomToDelete}
              onClick={confirmDelete}
              className="w-full sm:w-auto h-11 rounded-full bg-[#174D35] px-6 text-xs sm:text-[13px] font-semibold text-[#F8F4EA] hover:bg-[#123E2B] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 disabled:opacity-50 shadow-sm shadow-[#174D35]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {deletingRoom === roomToDelete && <ButtonLoader color="#F8F4EA" />}
              <span>{deletingRoom === roomToDelete ? "Deleting..." : "Delete listing"}</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#1C1B18]/8 bg-[#F8F4EA] px-4 py-3.5 transition hover:border-[#174D35]/15">

      <div className="flex items-center justify-between">

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#174D35]/5 text-[#174D35]">
          {icon}
        </div>

        <span className="font-serif text-[25px] font-medium">
          {value}
        </span>

      </div>

      <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.18em] text-[#756A5C]">
        {label}
      </p>

    </div>
  );
}