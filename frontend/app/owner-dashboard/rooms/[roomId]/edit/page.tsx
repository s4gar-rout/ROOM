"use client";

import { use, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  MapPin,
  Wifi,
  Snowflake,
  Car,
  Bath,
  CookingPot,
  Sofa,
  BatteryCharging,
  Droplets,
  X,
  Loader2,
} from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";
import Navbar from "@/components/layout/Navbar";

import {
  getSingleRoom,
  updateRoom,
  deleteRoomImage,
} from "@/features/rental/services/rental.service";

import type { Room } from "@/features/rental/types/rental";

const ROOM_TYPES = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "3BHK", label: "3 BHK" },
  { value: "1BHK", label: "1 BHK" },
  { value: "2BHK", label: "2 BHK" },
] as const;

const FACILITIES = [
  { label: "WiFi", icon: Wifi },
  { label: "AC", icon: Snowflake },
  { label: "Parking", icon: Car },
  { label: "Attached Bathroom", icon: Bath },
  { label: "Kitchen", icon: CookingPot },
  { label: "Furnished", icon: Sofa },
  { label: "Power Backup", icon: BatteryCharging },
  { label: "Water Supply", icon: Droplets },
];

type RoomType =
  | "single"
  | "double"
  | "3BHK"
  | "1BHK"
  | "2BHK";

import { useAuth } from "@/features/auth/hooks/useAuth";

interface EditRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function EditRoomPage({ params }: EditRoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading States
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // Form States
  const [form, setForm] = useState({
    title: "",
    description: "",
    rent: "",
    location: "",
    roomType: "" as RoomType | "",
  });

  const [availability, setAvailability] = useState(true);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; fileId: string }[]>([]);

  // New Upload States
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  // ==========================================
  // FETCH EXISTING ROOM DETAILS
  // ==========================================
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setPageLoading(true);
        const data = await getSingleRoom(roomId);
        if (data.room) {
          const room: Room = data.room;
          setForm({
            title: room.title,
            description: room.description,
            rent: String(room.rent),
            location: room.location,
            roomType: room.roomType,
          });
          setAvailability(room.availability);
          setSelectedFacilities(room.facilities || []);
          setExistingImages(room.images || []);
        }
      } catch (error: unknown) {
        console.error("Fetch room error:", error);
        setServerError(
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Unable to fetch room details."
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  // ==========================================
  // IMAGE UPLOAD (NEW IMAGES)
  // ==========================================
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    const validFiles = files.filter((file) => validTypes.includes(file.type));

    const totalAllowed = 5;
    const currentTotal = existingImages.length + images.length;
    const remainingSlots = totalAllowed - currentTotal;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      setServerError("You can upload up to 5 total images.");
      return;
    }

    const nextImages = [...images, ...filesToAdd];
    setImages(nextImages);

    setPreviews((prev) => [
      ...prev,
      ...filesToAdd.map((file) => URL.createObjectURL(file)),
    ]);

    setErrors((prev) => ({
      ...prev,
      images: "",
    }));

    setServerError("");
    e.target.value = "";
  };

  // ==========================================
  // REMOVE NEW IMAGE PREVIEW
  // ==========================================
  const removeNewImage = (index: number) => {
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    setImages((prev) => prev.filter((_, idx) => idx !== index));
    setPreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  // ==========================================
  // DELETE EXISTING IMAGE FROM BACKEND
  // ==========================================
  const handleDeleteExistingImage = async (fileId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo permanently?"
    );
    if (!confirmed) return;

    try {
      setDeletingFileId(fileId);
      setServerError("");
      const res = await deleteRoomImage(roomId, fileId);
      if (res.success) {
        setExistingImages((prev) => prev.filter((img) => img.fileId !== fileId));
      }
    } catch (error: unknown) {
      console.error("Delete image error:", error);
      setServerError(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete image."
      );
    } finally {
      setDeletingFileId(null);
    }
  };

  // ==========================================
  // FACILITIES
  // ==========================================
  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((item) => item !== facility)
        : [...prev, facility]
    );
  };

  // ==========================================
  // ROOM TYPE
  // ==========================================
  const selectRoomType = (value: RoomType) => {
    setForm((prev) => ({
      ...prev,
      roomType: value,
    }));

    setErrors((prev) => ({
      ...prev,
      roomType: "",
    }));
  };

  // ==========================================
  // VALIDATION
  // ==========================================
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (form.title.trim().length < 3) {
      newErrors.title = "Minimum 3 characters required.";
    }

    if (form.description.trim().length < 10) {
      newErrors.description = "Minimum 10 characters required.";
    }

    if (!form.rent || Number(form.rent) < 0) {
      newErrors.rent = "Enter a valid monthly rent.";
    }

    if (form.location.trim().length < 2) {
      newErrors.location = "Location is required.";
    }

    if (!form.roomType) {
      newErrors.roomType = "Select a room type.";
    }

    if (existingImages.length + images.length === 0) {
      newErrors.images = "Add at least one room photo.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const response = await updateRoom(roomId, {
        title: form.title.trim(),
        description: form.description.trim(),
        rent: Number(form.rent),
        location: form.location.trim(),
        roomType: form.roomType as RoomType,
        facilities: selectedFacilities,
        availability,
        images, // New uploads
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to update room.");
      }

      router.replace("/owner-dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("Update room error:", err);
      setServerError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error).message ||
          "Unable to update listing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // STYLES
  // ==========================================
  const inputClass =
    "h-11 w-full border border-[#CFCBBF] bg-transparent px-3 text-sm md:text-[13px] font-medium text-[#1C1B18] outline-none transition placeholder:text-[#918A7D] focus:border-[#174D35]";

  const labelClass =
    "mb-2 block text-[11px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1B18]";

  const errorClass =
    "mt-1.5 text-xs md:text-[9px] font-semibold text-red-500";

  if (authLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F4EA]">
        <div className="flex items-center gap-3 text-[#174D35]">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-[0.15em]">
            Checking authentication...
          </span>
        </div>
      </main>
    );
  }

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F4EA]">
        <div className="flex items-center gap-3 text-[#174D35]">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-[0.15em]">
            Loading listing...
          </span>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F8F4EA] px-4 pt-4 pb-24 md:py-4 text-[#1C1B18] sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-[1400px] flex-col border border-[#174D35]/15 bg-[#F8F4EA]">

        {/* =========================================
            MAIN FORM
        ========================================= */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="grid flex-1 lg:grid-cols-[1.05fr_0.95fr]">
            
            {/* =====================================
                LEFT COLUMN: Details & Room Type
            ===================================== */}
            <section className="border-b border-[#1C1B18]/10 px-6 py-7 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-8">
              
              <div className="mb-7">
                <p className="text-[11px] md:text-[9px] font-bold uppercase tracking-[0.25em] text-[#174D35]">
                  Edit room
                </p>
                <h1 className="mt-2 font-serif text-[36px] leading-[0.95] tracking-[-0.035em] sm:text-[42px]">
                  Update your{" "}
                  <em className="text-[#174D35]">listing.</em>
                </h1>
                <p className="mt-3 max-w-md text-xs md:text-[11px] font-medium leading-5 text-[#756A5C]">
                  Keep your property information current to attract matching tenants.
                </p>
              </div>

              {/* Basic Details */}
              <div>
                <div className="mb-5 flex items-center justify-between border-b border-[#1C1B18]/10 pb-3">
                  <p className="text-[11px] md:text-[9px] font-bold uppercase tracking-[0.22em]">
                    01 / Basic details
                  </p>
                  <span className="text-[11px] md:text-[9px] font-medium text-[#918A7D]">
                    Required
                  </span>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className={labelClass}>Room title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Spacious room near main market"
                    className={inputClass}
                  />
                  {errors.title && <p className={errorClass}>{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the room and surroundings..."
                    className="w-full resize-none border border-[#CFCBBF] bg-transparent px-3 py-3 text-sm md:text-[13px] font-medium text-[#1C1B18] outline-none transition placeholder:text-[#918A7D] focus:border-[#174D35]"
                  />
                  {errors.description && (
                    <p className={errorClass}>{errors.description}</p>
                  )}
                </div>

                {/* Rent & Location */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Monthly rent</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#174D35]">
                        ₹
                      </span>
                      <input
                        name="rent"
                        type="number"
                        min="0"
                        value={form.rent}
                        onChange={handleChange}
                        placeholder="8000"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                    {errors.rent && <p className={errorClass}>{errors.rent}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Location</label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#174D35]"
                      />
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Jharsuguda"
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                    {errors.location && (
                      <p className={errorClass}>{errors.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Room Type */}
              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between border-b border-[#1C1B18]/10 pb-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em]">
                    02 / Room type
                  </p>
                  <span className="text-[9px] text-[#918A7D]">Select one</span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {ROOM_TYPES.map((type) => {
                    const active = form.roomType === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => selectRoomType(type.value)}
                        className={`relative flex h-11 items-center justify-center border text-[10px] font-semibold transition ${
                          active
                            ? "border-[#174D35] bg-[#174D35] text-[#F8F4EA]"
                            : "border-[#CFCBBF] bg-transparent text-[#5F554A] hover:border-[#174D35]"
                        }`}
                      >
                        {active && <Check size={11} className="mr-1" />}
                        {type.label}
                      </button>
                    );
                  })}
                </div>
                {errors.roomType && (
                  <p className={errorClass}>{errors.roomType}</p>
                )}
              </div>

              {/* Availability */}
              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between border-b border-[#1C1B18]/10 pb-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em]">
                    03 / Availability status
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAvailability(true)}
                    className={`flex h-11 flex-1 items-center justify-center border text-[10px] font-semibold transition ${
                      availability
                        ? "border-[#174D35] bg-[#EEF2E9] text-[#174D35]"
                        : "border-[#CFCBBF] bg-transparent text-[#5F554A] hover:border-[#174D35]"
                    }`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailability(false)}
                    className={`flex h-11 flex-1 items-center justify-center border text-xs md:text-[10px] font-semibold transition ${
                      !availability
                        ? "border-[#174D35] bg-[#EEF2E9] text-[#174D35]"
                        : "border-[#CFCBBF] bg-transparent text-[#5F554A] hover:border-[#174D35]"
                    }`}
                  >
                    Sold Out
                  </button>
                </div>
              </div>

            </section>

            {/* =====================================
                RIGHT COLUMN: Facilities & Photos
            ===================================== */}
            <section className="px-6 py-7 sm:px-8 lg:px-10 lg:py-8">
              
              {/* Facilities */}
              <div>
                <div className="mb-5 border-b border-[#1C1B18]/10 pb-3">
                  <p className="text-[11px] md:text-[9px] font-bold uppercase tracking-[0.22em]">
                    04 / Additional information
                  </p>
                </div>

                <p className="mb-3 text-[11px] md:text-[9px] font-bold uppercase tracking-[0.2em]">
                  Facilities
                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FACILITIES.map((facility) => {
                    const active = selectedFacilities.includes(facility.label);
                    const Icon = facility.icon;

                    return (
                      <button
                        key={facility.label}
                        type="button"
                        onClick={() => toggleFacility(facility.label)}
                        className={`flex h-11 items-center justify-between border px-3 text-left text-xs md:text-[10px] font-medium transition ${
                          active
                            ? "border-[#174D35] bg-[#EEF2E9] text-[#174D35]"
                            : "border-[#CFCBBF] bg-transparent text-[#5F554A] hover:border-[#174D35]"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Icon size={14} />
                          <span className="truncate">{facility.label}</span>
                        </span>
                        {active && <Check size={13} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] md:text-[9px] text-[#918A7D]">
                  Select all facilities that apply.
                </p>
              </div>

              {/* Photos */}
              <div className="mt-7 border-t border-[#1C1B18]/10 pt-6">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] md:text-[9px] font-bold uppercase tracking-[0.2em]">
                      05 / Photos
                    </p>
                    <p className="mt-1 text-[11px] md:text-[9px] text-[#918A7D]">
                      Manage photos (max 5 total).
                    </p>
                  </div>

                  <span className="text-[11px] md:text-[9px] font-bold text-[#174D35]">
                    {existingImages.length + images.length} / 5 photos
                  </span>
                </div>

                {/* Photo Grid (Existing + Previews) */}
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Existing Images */}
                  {existingImages.map((image) => (
                    <div
                      key={image.fileId}
                      className="group relative aspect-[1.15] overflow-hidden border border-[#CFCBBF] bg-[#DDE7DD]"
                    >
                      <Image
                        src={image.url}
                        alt="Existing room image"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      
                      <button
                        type="button"
                        disabled={deletingFileId === image.fileId}
                        onClick={() => handleDeleteExistingImage(image.fileId)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#F8F4EA] text-[#1C1B18] shadow-sm transition hover:bg-white disabled:opacity-50"
                        aria-label="Delete photo"
                      >
                        {deletingFileId === image.fileId ? (
                          <Loader2 size={10} className="animate-spin text-[#174D35]" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    </div>
                  ))}

                  {/* New Previews */}
                  {previews.map((preview, index) => (
                    <div
                      key={preview}
                      className="group relative aspect-[1.15] overflow-hidden border border-[#CFCBBF] bg-[#DDE7DD]"
                    >
                      <Image
                        src={preview}
                        alt={`New preview ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#F8F4EA] text-[#1C1B18] shadow-sm transition hover:bg-white"
                        aria-label="Remove preview"
                      >
                        <X size={12} />
                      </button>
                      
                      {existingImages.length === 0 && index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-[#174D35] px-2 py-1 text-[9px] md:text-[7px] font-bold uppercase tracking-[0.12em] text-[#F8F4EA]">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add Button */}
                  {existingImages.length + images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-[1.15] flex-col items-center justify-center border border-dashed border-[#AFA99B] bg-transparent text-[#174D35] transition hover:border-[#174D35] hover:bg-[#EEF2E9]"
                    >
                      <ImagePlus size={19} />
                      <span className="mt-1.5 text-[10px] md:text-[8px] font-bold uppercase tracking-[0.12em]">
                        Add photo
                      </span>
                    </button>
                  )}

                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                  multiple
                  onChange={handleImages}
                  className="hidden"
                />

                {errors.images && (
                  <p className={errorClass}>{errors.images}</p>
                )}
              </div>

            </section>
          </div>

          {/* =========================================
              BOTTOM UPDATE BAR
          ========================================= */}
          <div className="border-t border-[#1C1B18]/10 px-6 py-4 sm:px-8 lg:px-10">
            {serverError && (
              <div className="mb-3 border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs md:text-[10px] font-semibold text-red-600">
                {serverError}
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2E9] text-[#174D35]">
                  <Check size={14} />
                </div>
                <div>
                  <p className="text-[11px] md:text-[9px] font-bold uppercase tracking-[0.17em] text-[#1C1B18]">
                    Almost there.
                  </p>
                  <p className="mt-0.5 text-[11px] md:text-[9px] text-[#756A5C]">
                    Review details and save updates to your listing.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex h-11 items-center justify-center gap-2 bg-[#174D35] px-8 text-xs md:text-[9px] font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition hover:bg-[#123D2A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <ButtonLoader color="#F8F4EA" /> : "Save updates"}
                {!isSubmitting && (
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </main>
  </>
);
}
