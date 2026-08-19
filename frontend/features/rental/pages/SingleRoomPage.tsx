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
  ShieldCheck,
  Calendar,
  Sparkles,
  Bath,
  UtensilsCrossed,
  Droplets,
  Wifi,
  Wind,
  Car,
  Sofa,
  Tv,
  Zap,
  Shield,
  Shirt,
  Dumbbell,
  Sun,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  shouldReduceMotion,
} from "@/lib/animations";

import Navbar from "@/components/layout/Navbar";
import { getSingleRoom } from "@/features/rental/services/rental.service";
import { createOrGetConversation } from "@/features/conversation/services/conversation.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Room } from "@/features/rental/types/rental";

export default function SingleRoomPage({ roomId }: { roomId: string }) {
  const reduceMotion = shouldReduceMotion();
  const router = useRouter();

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [restrictionModal, setRestrictionModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

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
  // CHAT HANDLER
  // ============================================================

  const handleChat = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=/rentals/${roomId}`);
      return;
    }

    const roomOwnerId =
      typeof room?.owner === "object"
        ? room.owner?._id || (room.owner as any)?.id
        : room?.owner;
    const currentUserId = user?._id || (user as any)?.id;

    if (
      currentUserId &&
      roomOwnerId &&
      String(currentUserId) === String(roomOwnerId)
    ) {
      setRestrictionModal({
        isOpen: true,
        title: "Your Property Listing",
        message:
          "You are the owner of this property. You cannot message yourself. Potential tenants can contact you about this listing.",
      });
      return;
    }

    if (user?.role?.toLowerCase() === "owner") {
      setRestrictionModal({
        isOpen: true,
        title: "Messaging Not Available",
        message:
          "You are currently signed in as a Property Owner. Owners cannot send room inquiry messages to other owners. Only tenants can contact property owners about listings.",
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
      const msg =
        err?.response?.data?.message || "Unable to start chat at this time.";
      setRestrictionModal({
        isOpen: true,
        title: "Cannot Start Chat",
        message: msg,
      });
    } finally {
      setChatLoading(false);
    }
  };

  // ============================================================
  // HELPERS & FORMATTING
  // ============================================================

  const getRoomTypeLabel = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "single":
        return "Single Room";
      case "double":
        return "Double Room";
      case "3bhk":
        return "3 BHK";
      case "1bhk":
        return "1 BHK";
      case "2bhk":
        return "2 BHK";
      default:
        return type ? `${type} Room` : "Room";
    }
  };

  const formatOwnerSinceDate = (dateStr?: string) => {
    if (!dateStr) return "August 2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "August 2026";
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return "August 2026";
    }
  };

  const getFacilityIcon = (facility: string) => {
    const norm = facility.toLowerCase().trim();

    if (norm.includes("bath") || norm.includes("toilet") || norm.includes("washroom")) {
      return <Bath size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("kitchen") || norm.includes("food") || norm.includes("cook")) {
      return <UtensilsCrossed size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("water") || norm.includes("supply")) {
      return <Droplets size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("wifi") || norm.includes("internet") || norm.includes("net")) {
      return <Wifi size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("ac") || norm.includes("air") || norm.includes("cooler") || norm.includes("fan")) {
      return <Wind size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("park") || norm.includes("car") || norm.includes("bike") || norm.includes("vehicle")) {
      return <Car size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("furnish") || norm.includes("bed") || norm.includes("sofa") || norm.includes("table") || norm.includes("chair")) {
      return <Sofa size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("tv") || norm.includes("television") || norm.includes("cable")) {
      return <Tv size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("power") || norm.includes("backup") || norm.includes("geyser") || norm.includes("electricity") || norm.includes("inverter")) {
      return <Zap size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("security") || norm.includes("cctv") || norm.includes("guard")) {
      return <Shield size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("laundry") || norm.includes("wash")) {
      return <Shirt size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("gym") || norm.includes("fitness")) {
      return <Dumbbell size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("balcony") || norm.includes("terrace") || norm.includes("sun")) {
      return <Sun size={14} className="text-[#174D35]" />;
    }
    if (norm.includes("lift") || norm.includes("elevator") || norm.includes("floor")) {
      return <Building2 size={14} className="text-[#174D35]" />;
    }

    return <Sparkles size={14} className="text-[#174D35]" />;
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-[#F8F4EA]">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-5 py-10 sm:px-8">
          <div className="text-center">
            <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-[#174D35]/20 border-t-[#174D35]" />
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#174D35]">
              Loading Room Details
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error || !room) {
    return (
      <main className="min-h-screen bg-[#F8F4EA]">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md rounded-2xl border border-[#1C1B18]/15 bg-[#FAF7F0] px-8 py-12 text-center shadow-sm">
            <p className="mb-3 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#174D35]">
              404 / PROPERTY NOT FOUND
            </p>
            <h1 className="mb-7 font-serif text-3xl text-[#1C1B18]">
              {error || "Room Not Found"}
            </h1>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-full border border-[#174D35] bg-[#174D35] px-7 py-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:text-[#174D35]"
            >
              <ArrowLeft size={14} />
              Return Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // DATA PREPARATION
  // ============================================================

  const images = Array.isArray(room.images) ? room.images : [];
  const currentImage =
    images.length > 0
      ? images[activeImageIndex]?.url
      : "/placeholder-room.jpg";

  const goPrevious = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const owner =
    typeof room.owner === "object" && room.owner ? room.owner : null;
  const ownerName = owner?.username || "Property Owner";
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const rent = Number(room.rent ?? 0);

  return (
    <main className="min-h-screen bg-[#F8F4EA] text-[#1C1B18] pb-28 sm:pb-32">
      {/* ========================================================
          GLOBAL NAVBAR
      ======================================================== */}
      <Navbar />

      {/* BREADCRUMB / BACK TO HOME */}
      <div className="mx-auto max-w-[1380px] px-4 pt-5 sm:px-8 sm:pt-6 lg:px-10">
        <button
          onClick={() => router.push("/")}
          className="group inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#174D35] transition-colors duration-300 hover:text-[#1C1B18]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          <span>Back to Home</span>
        </button>
      </div>

      {/* ========================================================
          MAIN CONTENT CONTAINER
      ======================================================== */}
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? false : "visible"}
        variants={staggerContainerVariants}
        className="mx-auto max-w-[1380px] px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_480px] lg:gap-12 items-start">
          {/* ==================================================
              LEFT COLUMN — PROPERTY IMAGE GALLERY
          ================================================== */}
          <motion.section variants={staggerItemVariants} className="w-full">
            {/* MAIN IMAGE DISPLAY */}
            <div className="group relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#1C1B18]/12 bg-[#EBE5D9] shadow-sm transition-all duration-500 hover:shadow-md">
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="absolute inset-0 h-full w-full overflow-hidden"
                  >
                    <Image
                      src={currentImage}
                      alt={room.title || "Room"}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex h-full items-center justify-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#756A5C]">
                  No Images Available
                </div>
              )}

              {/* IMAGE COUNTER BADGE */}
              {images.length > 1 && (
                <div className="absolute right-4 top-4 z-10 rounded-full border border-white/40 bg-[#F8F4EA]/85 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#174D35]">
                    {String(activeImageIndex + 1).padStart(2, "0")} /{" "}
                    {String(images.length).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* PREVIOUS BUTTON */}
              {images.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goPrevious}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[#F8F4EA]/85 text-[#174D35] backdrop-blur-md shadow-md transition-colors duration-200 hover:bg-[#174D35] hover:text-[#F8F4EA]"
                >
                  <ChevronLeft size={18} />
                </motion.button>
              )}

              {/* NEXT BUTTON */}
              {images.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goNext}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[#F8F4EA]/85 text-[#174D35] backdrop-blur-md shadow-md transition-colors duration-200 hover:bg-[#174D35] hover:text-[#F8F4EA]"
                >
                  <ChevronRight size={18} />
                </motion.button>
              )}
            </div>

            {/* THUMBNAIL GALLERY */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, index) => (
                  <motion.button
                    key={img.fileId || img.url || `thumb-${index}`}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 ${
                      activeImageIndex === index
                        ? "border-[#174D35] ring-2 ring-[#174D35]/30 shadow-sm opacity-100"
                        : "border-[#1C1B18]/15 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${room.title || "Room"} thumb ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.section>

          {/* ==================================================
              RIGHT COLUMN — EDITORIAL ROOM DETAILS & OWNER PANEL
          ================================================== */}
          <motion.aside
            variants={staggerItemVariants}
            className="w-full rounded-2xl border border-[#1C1B18]/12 bg-[#FAF7F0] p-6 sm:p-8 shadow-sm"
          >
            {/* ROOM TYPE & AVAILABILITY */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center rounded-full border border-[#174D35]/30 bg-[#174D35]/5 px-3.5 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#174D35]">
                {getRoomTypeLabel(room.roomType)}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] ${
                  room.availability
                    ? "bg-[#174D35]/10 text-[#174D35]"
                    : "bg-[#A53B32]/10 text-[#A53B32]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    room.availability ? "bg-[#174D35]" : "bg-[#A53B32]"
                  }`}
                />
                {room.availability ? "Available" : "Sold Out"}
              </span>
            </div>

            {/* ROOM TITLE (MAIN VISUAL FOCUS) */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal leading-[1.12] tracking-[-0.035em] text-[#1C1B18]">
              {room.title}
            </h1>

            {/* LOCATION */}
            <div className="mt-3.5 flex items-start gap-2 text-sm font-sans text-[#5F554A]">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#174D35]" />
              <span className="leading-snug">
                {room.location || "Location not specified"}
              </span>
            </div>

            {/* MONTHLY RENT */}
            <div className="mt-6 border-t border-[#1C1B18]/10 pt-5 flex items-baseline justify-between">
              <div>
                <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.24em] text-[#756A5C] mb-1">
                  Monthly Rent
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#174D35]">
                    ₹{rent.toLocaleString("en-IN")}
                  </span>
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#756A5C]">
                    / month
                  </span>
                </div>
              </div>
            </div>

            {/* OWNER INFORMATION (NEAR TOP OF ROOM DETAILS) */}
            <div className="mt-6 border-t border-[#1C1B18]/10 pt-5">
              <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35] mb-3">
                03 / PROPERTY OWNER
              </span>

              <div className="flex items-center gap-4 rounded-xl border border-[#174D35]/15 bg-[#174D35]/[0.03] p-4 transition-colors duration-200 hover:bg-[#174D35]/[0.06]">
                {owner?.avatar?.url ? (
                  <Image
                    src={owner.avatar.url}
                    alt={ownerName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-[#174D35]/20"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#174D35] font-serif text-xl text-[#F8F4EA]">
                    {ownerInitial}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans text-base font-semibold text-[#1C1B18] truncate">
                      {ownerName}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#174D35]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#174D35]">
                      <ShieldCheck size={11} className="text-[#174D35]" />
                      Verified
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 font-sans text-xs text-[#756A5C]">
                    <Calendar size={12} className="text-[#174D35]" />
                    <span>
                      Owner since {formatOwnerSinceDate(room.createdAt)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-6 border-t border-[#1C1B18]/10 pt-5">
              <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35] mb-3">
                01 / DESCRIPTION
              </span>
              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#514A42]">
                {room.description || "No description provided for this property."}
              </p>
            </div>

            {/* FACILITIES */}
            {Array.isArray(room.facilities) && room.facilities.length > 0 && (
              <div className="mt-6 border-t border-[#1C1B18]/10 pt-5">
                <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35] mb-3">
                  02 / FACILITIES
                </span>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((facility, index) => (
                    <span
                      key={`${facility}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1B18]/15 bg-[#FFFDF8] px-3.5 py-1.5 font-sans text-xs font-medium text-[#514A42] transition-colors duration-200 hover:border-[#174D35] hover:text-[#174D35]"
                    >
                      {getFacilityIcon(facility)}
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      </motion.div>

      {/* ========================================================
          STICKY BOTTOM ACTION BAR (CHAT WITH OWNER CTA)
      ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1C1B18]/10 bg-[#F8F4EA]/95 py-3.5 px-4 sm:px-8 backdrop-blur-md shadow-[0_-8px_30px_rgba(28,27,24,0.06)]">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4">
          {/* LEFT: ROOM SUMMARY PREVIEW (DESKTOP/TABLET) */}
          <div className="hidden sm:flex items-center gap-4 min-w-0">
            <div className="min-w-0">
              <h4 className="font-serif text-base font-normal text-[#1C1B18] truncate">
                {room.title}
              </h4>
              <p className="font-sans text-xs text-[#756A5C] truncate">
                {room.location}
              </p>
            </div>
            <div className="h-8 w-px bg-[#1C1B18]/10" />
            <div>
              <span className="font-serif text-lg font-normal text-[#174D35]">
                ₹{rent.toLocaleString("en-IN")}
              </span>
              <span className="font-sans text-[9px] uppercase tracking-wider text-[#756A5C]">
                {" "}
                / month
              </span>
            </div>
          </div>

          {/* RIGHT: CHAT WITH OWNER BUTTON */}
          <div className="w-full sm:w-auto flex items-center justify-end">
            <button
              onClick={handleChat}
              disabled={chatLoading || !room.availability}
              className="group inline-flex w-full sm:w-auto h-12 items-center justify-center gap-3 rounded-full border border-[#174D35] bg-[#174D35] px-8 font-sans text-xs font-bold uppercase tracking-[0.2em] !text-[#F8F4EA] shadow-md transition-all duration-300 hover:bg-[#123d2a] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle size={16} className="!text-[#F8F4EA]" />
              <span className="!text-[#F8F4EA]">
                {chatLoading
                  ? "Connecting..."
                  : room.availability
                  ? "Chat with Owner"
                  : "Room Sold Out"}
              </span>
              <ArrowRight
                size={14}
                className="!text-[#F8F4EA] transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          RESTRICTION MODAL (EDITORIAL WARM CREAM STYLING)
      ======================================================== */}
      {restrictionModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1C1B18]/60 px-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-[#174D35]/15 bg-[#FAF7F0] p-7 sm:p-8 shadow-[0_24px_60px_rgba(28,27,24,0.18)] text-[#1C1B18]">
            {/* CLOSE BUTTON */}
            <button
              onClick={() =>
                setRestrictionModal({ ...restrictionModal, isOpen: false })
              }
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#174D35]/5 text-[#756A5C] transition-all hover:bg-[#174D35]/15 hover:text-[#174D35] focus:outline-none"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* EYEBROW */}
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#174D35]" />
              <span className="h-px w-6 bg-[#174D35]/30" />
              <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35]">
                Account Notice
              </span>
            </div>

            {/* ICON HEADER */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
              <Info size={22} />
            </div>

            {/* TITLE */}
            <h2 className="font-serif text-[28px] sm:text-[32px] font-normal leading-[1.15] tracking-[-0.03em] text-[#1C1B18]">
              {restrictionModal.title}
            </h2>

            {/* MESSAGE */}
            <p className="mt-3 text-sm leading-relaxed text-[#5F554A]">
              {restrictionModal.message}
            </p>

            {/* ACTION CTA */}
            <div className="mt-7 flex items-center justify-end border-t border-[#174D35]/10 pt-5">
              <button
                type="button"
                onClick={() =>
                  setRestrictionModal({ ...restrictionModal, isOpen: false })
                }
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#174D35] px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition-all hover:bg-[#123d2a] shadow-md"
              >
                <span>Understood</span>
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
