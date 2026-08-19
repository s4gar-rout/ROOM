"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants, shouldReduceMotion } from "@/lib/animations";

import { getSingleRoom } from "@/features/rental/services/rental.service";
import { createOrGetConversation } from "@/features/conversation/services/conversation.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Room } from "@/features/rental/types/rental";

export default function SingleRoomPage({
  roomId,
}: {
  roomId: string;
}) {
  const reduceMotion = shouldReduceMotion();
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [restrictionModal, setRestrictionModal] = useState({ isOpen: false, title: "", message: "" });

  // ============================================================
  // FETCH ROOM
  // ============================================================

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSingleRoom(roomId);

        if (data?.success && data?.room) {
          setRoom(data.room);
        } else {
          setError("Room not found");
        }
      } catch (err: unknown) {
        console.error("Failed to fetch room:", err);

        if (typeof err === "object" && err !== null && "response" in err) {
          const axiosErr = err as { response?: { status?: number } };
          if (axiosErr.response?.status === 404) {
            setError("Room not found");
            return;
          }
        }
        
        setError("Failed to load room details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // ============================================================
  // CHAT
  // ============================================================

  const handleChat = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=/rentals/${roomId}`);
      return;
    }

    const roomOwnerId = typeof room?.owner === "object" ? (room.owner?._id || (room.owner as any)?.id) : room?.owner;
    const currentUserId = user?._id || (user as any)?.id;

    if (currentUserId && roomOwnerId && String(currentUserId) === String(roomOwnerId)) {
      setRestrictionModal({
        isOpen: true,
        title: "Your Property Listing",
        message: "You are the owner of this property. You cannot message yourself. Potential tenants can contact you about this listing."
      });
      return;
    }

    if (user?.role?.toLowerCase() === "owner") {
      setRestrictionModal({
        isOpen: true,
        title: "Messaging Not Available",
        message: "You are currently signed in as a Property Owner. Owners cannot send room inquiry messages to other owners. Only tenants can contact property owners about listings."
      });
      return;
    }

    try {
      setChatLoading(true);

      const res = await createOrGetConversation(roomId);

      if (res?.success && res?.conversation?._id) {
        router.push(`/messages/${res.conversation._id}`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Unable to start chat at this time.";
      setRestrictionModal({
        isOpen: true,
        title: "Cannot Start Chat",
        message: msg
      });
    } finally {
      setChatLoading(false);
    }
  };

  // ============================================================
  // ROOM TYPE
  // ============================================================

  const getRoomTypeLabel = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "single":
        return "Single Room";

      case "double":
        return "Double Room";

      case "3BHK":
        return "3 BHK";

      case "1bhk":
        return "1 BHK";

      case "2bhk":
        return "2 BHK";

      case "3bhk":
        return "3 BHK";

      default:
        return type || "Room";
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-[#F8F4EA] px-5 py-10 sm:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div
              className="
                mx-auto
                mb-5
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-[#174D35]/20
                border-t-[#174D35]
              "
            />

            <p
              className="
                font-sans
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#174D35]
              "
            >
              Loading Room
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !room) {
    return (
      <main className="min-h-screen bg-[#F8F4EA] px-5 py-10 sm:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center">
          <div
            className="
              w-full
              max-w-md
              border
              border-[#1C1B18]/15
              bg-[#F8F4EA]
              px-8
              py-12
              text-center
            "
          >
            <p
              className="
                mb-3
                font-sans
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#174D35]
              "
            >
              404 / ROOM
            </p>

            <h1
              className="
                mb-7
                font-serif
                text-3xl
                text-[#1C1B18]
              "
            >
              {error || "Room Not Found"}
            </h1>

            <button
              onClick={() => router.push("/")}
              className="
                inline-flex
                items-center
                gap-2
                border
                border-[#174D35]
                bg-[#174D35]
                px-7
                py-3.5
                font-sans
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#F8F4EA]
                transition-all
                duration-300
                hover:bg-[#F8F4EA]
                hover:text-[#174D35]
              "
            >
              <ArrowLeft size={14} />
              Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // IMAGES
  // ============================================================

  const images = Array.isArray(room.images)
    ? room.images
    : [];

  const currentImage =
    images.length > 0
      ? images[activeImageIndex]?.url
      : "/placeholder-room.jpg";

  const goPrevious = () => {
    if (images.length <= 1) return;

    setActiveImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    if (images.length <= 1) return;

    setActiveImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // ============================================================
  // OWNER
  // ============================================================

  const owner =
    typeof room.owner === "object" && room.owner
      ? room.owner
      : null;

  const ownerName =
    owner?.username || "Room Owner";

  const ownerInitial =
    ownerName.charAt(0).toUpperCase();

  // ============================================================
  // PRICE
  // ============================================================

  const rent = Number(room.rent ?? 0);

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-[#F8F4EA] text-[#1C1B18] pb-24 md:pb-12">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <header className="border-b border-[#1C1B18]/10">
        <div
          className="
            mx-auto
            flex
            h-[70px]
            max-w-[1380px]
            items-center
            px-5
            sm:px-8
            lg:px-10
          "
        >
          <button
            onClick={() => router.push("/")}
            className="
              group
              inline-flex
              items-center
              gap-3
              font-sans
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#174D35]
              transition-colors
              duration-300
              hover:text-[#1C1B18]
            "
          >
            <ArrowLeft
              size={15}
              className="
                transition-transform
                duration-300
                group-hover:-translate-x-1
              "
            />

            Home
          </button>
        </div>
      </header>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <motion.div
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? false : "visible"}
        variants={staggerContainerVariants}
        className="
          mx-auto
          max-w-[1380px]
          px-5
          py-8
          sm:px-8
          lg:px-10
          lg:py-10
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-8
            lg:grid-cols-[minmax(0,1fr)_420px]
            xl:grid-cols-[minmax(0,1fr)_460px]
          "
        >

          {/* ==================================================
              LEFT — IMAGE GALLERY
          ================================================== */}

          <motion.section variants={staggerItemVariants}>

            {/* MAIN IMAGE */}

            <motion.div
              layoutId={`room-image-${roomId}`}
              className="
                relative
                aspect-[4/3]
                w-full
                overflow-hidden
                border
                border-[#1C1B18]/15
                bg-[#EBE5D9]
              "
            >
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={currentImage}
                      alt={room.title || "Room"}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 70vw"
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                    font-sans
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-[#756B60]
                  "
                >
                  No Image Available
                </div>
              )}

              {/* IMAGE COUNTER */}

              {images.length > 1 && (
                <div
                  className="
                    absolute
                    right-4
                    top-4
                    border
                    border-white/40
                    bg-[#F8F4EA]/90
                    px-3
                    py-1.5
                    backdrop-blur-sm
                  "
                >
                  <span
                    className="
                      font-sans
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-[#174D35]
                    "
                  >
                    {String(activeImageIndex + 1).padStart(2, "0")} /{" "}
                    {String(images.length).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* PREVIOUS */}

              {images.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goPrevious}
                  aria-label="Previous image"
                  className="
                    absolute
                    left-4
                    top-1/2
                    flex
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    border
                    border-white/50
                    bg-[#F8F4EA]/90
                    text-[#174D35]
                    backdrop-blur-sm
                    transition-colors
                    duration-300
                    hover:bg-[#174D35]
                    hover:text-[#F8F4EA]
                  "
                >
                  <ChevronLeft size={17} />
                </motion.button>
              )}

              {/* NEXT */}

              {images.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goNext}
                  aria-label="Next image"
                  className="
                    absolute
                    right-4
                    top-1/2
                    flex
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    border
                    border-white/50
                    bg-[#F8F4EA]/90
                    text-[#174D35]
                    backdrop-blur-sm
                    transition-colors
                    duration-300
                    hover:bg-[#174D35]
                    hover:text-[#F8F4EA]
                  "
                >
                  <ChevronRight size={17} />
                </motion.button>
              )}
            </motion.div>

            {/* ==================================================
                OTHER IMAGES
                MAIN IMAGE KE NICHE
            ================================================== */}

            {images.length > 1 && (
              <div
                className="
                  mt-3
                  flex
                  gap-3
                  overflow-x-auto
                  pb-1
                  scrollbar-thin
                "
              >
                {images.slice(1).map((img, index) => {
                  const actualIndex = index + 1;

                  return (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={
                        img.fileId ||
                        img.url ||
                        `room-image-${actualIndex}`
                      }
                      onClick={() =>
                        setActiveImageIndex(actualIndex)
                      }
                      className={`
                        relative
                        h-[82px]
                        w-[110px]
                        shrink-0
                        overflow-hidden
                        border
                        transition-all
                        duration-300
                        ${
                          activeImageIndex === actualIndex
                            ? "border-[#174D35] ring-1 ring-[#174D35]"
                            : "border-[#1C1B18]/10 opacity-60 hover:opacity-100"
                        }
                      `}
                    >
                      <Image
                        src={img.url}
                        alt={`${room.title || "Room"} image ${
                          actualIndex + 1
                        }`}
                        fill
                        className="object-cover"
                        sizes="110px"
                      />
                    </motion.button>
                  );
                })}
              </div>
            )}

          </motion.section>


          {/* ==================================================
              RIGHT — ALL ROOM DETAILS
          ================================================== */}

          <motion.aside
            variants={staggerItemVariants}
            className="
              border
              border-[#1C1B18]/15
              bg-[#F8F4EA]
            "
          >
            <div className="p-6 sm:p-7 lg:p-8">

              {/* ROOM TYPE */}

              <div className="mb-5">
                <span
                  className="
                    border
                    border-[#174D35]/30
                    px-3
                    py-1.5
                    font-sans
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-[#174D35]
                  "
                >
                  {getRoomTypeLabel(room.roomType)}
                </span>
              </div>

              {/* TITLE */}

              <h1
                className="
                  font-serif
                  text-[34px]
                  leading-[1.08]
                  tracking-[-0.035em]
                  text-[#1C1B18]
                  sm:text-[40px]
                "
              >
                {room.title}
              </h1>

              {/* LOCATION */}

              <div
                className="
                  mt-4
                  flex
                  items-start
                  gap-2
                  font-sans
                  text-sm
                  text-[#62594F]
                "
              >
                <MapPin
                  size={15}
                  className="mt-0.5 shrink-0 text-[#174D35]"
                />

                <span>
                  {room.location || "Location not specified"}
                </span>
              </div>

              {/* PRICE */}

              <div
                className="
                  mt-7
                  border-t
                  border-[#1C1B18]/10
                  pt-6
                "
              >
                <div className="flex items-baseline gap-2">

                  <span
                    className="
                      font-serif
                      text-[32px]
                      tracking-[-0.03em]
                      text-[#174D35]
                    "
                  >
                    ₹{rent.toLocaleString("en-IN")}
                  </span>

                  <span
                    className="
                      font-sans
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-[#756B60]
                    "
                  >
                    / Month
                  </span>

                </div>
              </div>

              {/* AVAILABILITY */}

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-between
                  border-y
                  border-[#1C1B18]/10
                  py-4
                "
              >
                <span
                  className="
                    font-sans
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-[#756B60]
                  "
                >
                  Availability
                </span>

                <span
                  className={`
                    font-sans
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    ${
                      room.availability
                        ? "text-[#174D35]"
                        : "text-[#A53B32]"
                    }
                  `}
                >
                  {room.availability
                    ? "Available"
                    : "Sold Out"}
                </span>
              </div>

              {/* DESCRIPTION */}

              <div className="mt-7">

                <p
                  className="
                    mb-3
                    font-sans
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-[#174D35]
                  "
                >
                  01 / Description
                </p>

                <p
                  className="
                    whitespace-pre-wrap
                    font-sans
                    text-[14px]
                    leading-7
                    text-[#514A42]
                  "
                >
                  {room.description ||
                    "No description provided."}
                </p>

              </div>

              {/* FACILITIES */}

              {Array.isArray(room.facilities) &&
                room.facilities.length > 0 && (
                  <div
                    className="
                      mt-7
                      border-t
                      border-[#1C1B18]/10
                      pt-7
                    "
                  >
                    <p
                      className="
                        mb-4
                        font-sans
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.25em]
                        text-[#174D35]
                      "
                    >
                      02 / Facilities
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {room.facilities.map(
                        (facility, index) => (
                          <span
                            key={`${facility}-${index}`}
                            className="
                              border
                              border-[#1C1B18]/12
                              px-3
                              py-2
                              font-sans
                              text-[9px]
                              font-semibold
                              uppercase
                              tracking-[0.1em]
                              text-[#62594F]
                            "
                          >
                            {facility}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* OWNER */}

              <div
                className="
                  mt-7
                  border-t
                  border-[#1C1B18]/10
                  pt-7
                "
              >
                <p
                  className="
                    mb-4
                    font-sans
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-[#174D35]
                  "
                >
                  03 / Property Owner
                </p>

                <div className="flex items-center gap-3">

                  {owner?.avatar?.url ? (
                    <Image
                      src={owner.avatar.url}
                      alt={ownerName}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        border
                        border-[#174D35]/20
                        bg-[#174D35]/5
                        font-serif
                        text-lg
                        text-[#174D35]
                        rounded-full
                      "
                    >
                      {ownerInitial}
                    </div>
                  )}

                  <div>
                    <h3
                      className="
                        font-sans
                        text-sm
                        font-semibold
                        text-[#1C1B18]
                      "
                    >
                      {ownerName}
                    </h3>

                    <p
                      className="
                        mt-0.5
                        font-sans
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.12em]
                        text-[#756B60]
                      "
                    >
                      Property Owner
                    </p>
                  </div>

                </div>
              </div>

              {/* CHAT */}

              <div className="mt-8">

                <button
                  onClick={handleChat}
                  disabled={
                    chatLoading ||
                    !room.availability
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    border
                    border-[#174D35]
                    bg-[#174D35]
                    px-5
                    py-4
                    font-sans
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-[#F8F4EA]
                    transition-all
                    duration-300
                    hover:bg-[#F8F4EA]
                    hover:text-[#174D35]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <MessageCircle size={15} />

                  {chatLoading
                    ? "Opening Chat..."
                    : room.availability
                      ? "Chat With Owner"
                      : "Room Sold Out"}
                </button>

                <p
                  className="
                    mt-3
                    text-center
                    font-sans
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#8A8177]
                  "
                >
                  Direct communication with the property owner
                </p>

              </div>

            </div>
          </motion.aside>
        </div>
      </motion.div>

      {/* ========================================================
          RESTRICTION MODAL (PREMIUM EDITORIAL DESIGN)
      ======================================================== */}
      {restrictionModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1C1B18]/60 px-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] sm:rounded-[36px] border border-[#174D35]/15 bg-[#FAF7F0] p-7 sm:p-8 shadow-[0_24px_60px_rgba(28,27,24,0.18)] animate-in zoom-in-95 duration-200 text-[#1C1B18]">

            {/* Close Button */}
            <button
              onClick={() => setRestrictionModal({ ...restrictionModal, isOpen: false })}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#174D35]/5 text-[#756A5C] transition-all hover:bg-[#174D35]/15 hover:text-[#174D35] focus:outline-none"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Eyebrow Accent Line */}
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#174D35]" />
              <span className="h-px w-6 bg-[#174D35]/30" />
              <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35]">
                Account Notice
              </span>
            </div>

            {/* Icon Header */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
              <Info size={22} />
            </div>

            {/* Title */}
            <h2 className="font-serif text-[28px] sm:text-[32px] font-normal leading-[1.15] tracking-[-0.03em] text-[#1C1B18]">
              {restrictionModal.title}
            </h2>

            {/* Message */}
            <p className="mt-3 text-[13px] sm:text-[14px] leading-relaxed text-[#5F554A]">
              {restrictionModal.message}
            </p>

            {/* Action CTA */}
            <div className="mt-7 flex items-center justify-end border-t border-[#174D35]/10 pt-5">
              <button
                type="button"
                onClick={() => setRestrictionModal({ ...restrictionModal, isOpen: false })}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#174D35] px-7 text-[10px] font-bold uppercase tracking-[0.18em] !text-[#F8F4EA] transition-all hover:bg-[#123d2a] shadow-md hover:shadow-lg"
              >
                <span>Understood</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
