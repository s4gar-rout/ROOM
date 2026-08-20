"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Search,
  Home,
  Loader2,
  X,
} from "lucide-react";

import {
  updateProfile,
  updateAvatar,
} from "../../features/auth/services/profile.service";
import { useAuth } from "../../features/auth/hooks/useAuth";

type Role = "user" | "owner";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // ==========================================
  // STATE
  // ==========================================

  const [role, setRole] = useState<Role>("user");

  const [profileFile, setProfileFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // HANDLE IMAGE
  // ==========================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a JPG, PNG or WEBP image."
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Profile photo must be smaller than 5MB."
      );
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const preview = URL.createObjectURL(file);

    setProfileFile(file);
    setPreviewUrl(preview);
    setError("");
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setProfileFile(null);
    setPreviewUrl(null);
    setError("");
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (!profileFile) {
      setError(
        "Please upload your profile photo to continue."
      );
      return;
    }

    try {
      setLoading(true);

      // 1. Upload photo
      await updateAvatar(profileFile);

      // 2. Save role
      await updateProfile({ role });

      // 3. Refresh user state so navbar updates
      await refreshUser();

      // 4. Redirect based on role
      if (role === "owner") {
        router.replace("/owner-dashboard");
        return;
      }

      router.replace("/rentals");
    } catch (err: unknown) {
      console.error(
        "Complete Profile Error:",
        err
      );

      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-[#F8F4EA] text-[#1C1B18]">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-5 sm:px-8">

        <button
          type="button"
          onClick={() => router.back()}
          className="group flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5F554A] transition-all duration-300 hover:bg-[#EDE6D9] hover:text-[#174D35]"
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />

          Back
        </button>

        <span className="font-serif text-2xl italic tracking-tight text-[#174D35]">
          room.
        </span>

        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#756A5C]">
          Profile / 01
        </span>

      </header>

      {/* ========================================
          MAIN
      ======================================== */}

      <section className="mx-auto flex min-h-[calc(100svh-68px)] max-w-[1200px] items-center px-5 py-6 sm:px-8">

        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-20">

          {/* ======================================
              LEFT CONTENT
          ====================================== */}

          <div className="hidden lg:block">

            <div className="mb-7 flex items-center gap-3">

              <span className="h-px w-10 bg-[#174D35]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#174D35]">
                Profile setup
              </span>

            </div>

            <h1 className="font-serif text-[5rem] font-medium leading-[0.82] tracking-[-0.055em]">

              Make it
              <br />

              <em className="text-[#174D35]">
                yours.
              </em>

            </h1>

            <p className="mt-7 max-w-[370px] text-[13px] font-medium leading-6 text-[#62594F]">
              Complete your profile before
              exploring rooms on livansa.
            </p>

            <div className="mt-12 border-t border-[#1C1B18]/10 pt-4">

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#756A5C]">
                Jharsuguda • Odisha
              </span>

            </div>

          </div>

          {/* ======================================
              CARD
          ====================================== */}

          <div className="relative w-full max-w-[560px] lg:ml-auto">

            <div className="rounded-[26px] border border-[#1C1B18]/12 bg-[#F8F4EA] px-6 py-6 shadow-[0_12px_40px_rgba(28,27,24,0.04)] sm:px-8 sm:py-7">

              {/* MOBILE TITLE */}

              <div className="mb-7 lg:hidden">

                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#174D35]">
                  Profile setup
                </p>

                <h1 className="font-serif text-4xl font-medium tracking-[-0.04em]">
                  Complete your{" "}
                  <em className="text-[#174D35]">
                    profile.
                  </em>
                </h1>

              </div>

              {/* ====================================
                  FORM
              ==================================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-7"
              >

                {/* PROFILE PHOTO */}

                <div>

                  <div className="mb-5">

                    <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#174D35]">
                      Profile picture
                    </p>

                    <p className="mt-1.5 text-[11px] font-medium text-[#756A5C]">
                      Upload a clear photo of yourself
                    </p>

                  </div>

                  {/* PREVIEW */}

                  <div className="mb-5 flex justify-center">

                    <div className="relative">

                      <div className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border border-[#174D35]/25 bg-[#EDE6D9] shadow-sm">

                        {previewUrl ? (

                          <Image
                            src={previewUrl}
                            alt="Profile preview"
                            fill
                            sizes="100px"
                            className="object-cover"
                          />

                        ) : (

                          <ImagePlus
                            size={26}
                            strokeWidth={1.5}
                            className="text-[#174D35]/50"
                          />

                        )}

                      </div>

                      {previewUrl && (

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          aria-label="Remove photo"
                          className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#1C1B18] text-[#F8F4EA] shadow-sm transition-transform duration-200 hover:scale-105"
                        >
                          <X size={12} />
                        </button>

                      )}

                    </div>

                  </div>

                  {/* UPLOAD */}

                  <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-[#1C1B18]/15 px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5F554A] transition-all duration-300 hover:border-[#174D35] hover:bg-[#EDE6D9] hover:text-[#174D35]">

                    <ImagePlus size={15} />

                    {profileFile
                      ? "Change photo"
                      : "Upload your photo"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                  </label>

                  <p className="mt-2 text-center text-[9px] font-medium text-[#756A5C]">
                    JPG, PNG or WEBP • Maximum 5MB
                  </p>

                </div>

                {/* ROLE */}

                <div>

                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.23em] text-[#174D35]">
                    What brings you here?
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {/* USER */}

                    <button
                      type="button"
                      onClick={() => setRole("user")}
                      className={`relative rounded-2xl border p-4 text-left transition-all duration-300 ${
                        role === "user"
                          ? "border-[#174D35] bg-[#EDE6D9] shadow-sm"
                          : "border-[#1C1B18]/10 hover:border-[#174D35]/40 hover:bg-[#F4EEE3]"
                      }`}
                    >

                      {role === "user" && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#174D35] text-[#F8F4EA]">
                          <Check size={10} />
                        </span>
                      )}

                      <Search
                        size={20}
                        strokeWidth={1.5}
                        className="text-[#174D35]"
                      />

                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em]">
                        Find a room
                      </p>

                      <p className="mt-1 text-[10px] font-medium leading-4 text-[#756A5C]">
                        I am looking for a place
                      </p>

                    </button>

                    {/* OWNER */}

                    <button
                      type="button"
                      onClick={() => setRole("owner")}
                      className={`relative rounded-2xl border p-4 text-left transition-all duration-300 ${
                        role === "owner"
                          ? "border-[#174D35] bg-[#EDE6D9] shadow-sm"
                          : "border-[#1C1B18]/10 hover:border-[#174D35]/40 hover:bg-[#F4EEE3]"
                      }`}
                    >

                      {role === "owner" && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#174D35] text-[#F8F4EA]">
                          <Check size={10} />
                        </span>
                      )}

                      <Home
                        size={20}
                        strokeWidth={1.5}
                        className="text-[#174D35]"
                      />

                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em]">
                        List my room
                      </p>

                      <p className="mt-1 text-[10px] font-medium leading-4 text-[#756A5C]">
                        I want to rent my property
                      </p>

                    </button>

                  </div>

                </div>

                {/* ERROR */}

                {error && (

                  <div className="rounded-2xl border border-red-900/10 bg-[#F7E9E6] px-4 py-3">

                    <p className="text-[10px] font-semibold leading-5 text-red-800">
                      {error}
                    </p>

                  </div>

                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F8F4EA] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123D2A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />

                      Saving profile...
                    </>
                  ) : (
                    "Continue"
                  )}

                </button>

              </form>

              {/* FOOTER NOTE */}

              <p className="mt-5 border-t border-[#1C1B18]/10 pt-4 text-[9px] font-medium leading-5 text-[#756A5C]">
                Your profile photo is securely
                stored and can be changed later
                from your profile settings.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}