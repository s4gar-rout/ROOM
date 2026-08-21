"use client";

import { useEffect, useState, useRef } from "react";
import { getMyProfile, updateProfile, updateAvatar, ProfileUser } from "../../../features/auth/services/profile.service";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";

export default function EditProfilePage() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const { isAuthenticated, loading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isAuthenticated) {
      const fetchProfile = async () => {
        try {
          const data = await getMyProfile();
          if (data.success && data.user) {
            setProfile(data.user);
            setUsername(data.user.username || "");
            setContact(data.user.contact || "");
            if (data.user.avatar?.url) {
              setAvatarPreview(data.user.avatar.url);
            }
          } else {
            setError(data.message || "Failed to load profile.");
          }
        } catch (error: unknown) {
          setError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "An error occurred while loading profile.");
        } finally {
          setLoadingProfile(false);
        }
      };
      
      fetchProfile();
    }
  }, [isAuthenticated, loading, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const profileRes = await updateProfile({ username, contact });
      if (!profileRes.success) {
        throw new Error(profileRes.message || "Failed to update profile details.");
      }

      if (avatarFile) {
        const avatarRes = await updateAvatar(avatarFile);
        if (!avatarRes.success) {
          throw new Error(avatarRes.message || "Failed to upload avatar.");
        }
      }

      await refreshUser();
      
      setSuccessMsg("Profile updated successfully. Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (error: unknown) {
      setError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error).message || "An error occurred during update.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#174D35] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  const inputClass = "w-full border-b border-[#1C1B18]/25 focus:border-[#174D35] bg-transparent py-3 text-sm font-medium text-[#1C1B18] outline-none transition-colors placeholder:font-medium placeholder:text-[#756A5C]";
  const labelClass = "mb-1 block text-[11px] md:text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A]";

  return (
    <main className="w-full flex flex-col gap-10">
      
      {/* Header & Back Navigation */}
      <div>
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs md:text-[10px] font-medium uppercase tracking-[0.2em] text-[#5F554A] transition-colors hover:text-[#174D35] mb-8"
        >
          <ArrowLeft size={13} className="transition-transform duration-300 group-hover:-translate-x-1" /> Back
        </button>

        <h1 className="font-serif text-5xl sm:text-6xl tracking-tight text-[#1C1B18] leading-none mb-4">
          Edit <em className="text-[#174D35]">profile.</em>
        </h1>
        <p className="text-sm font-medium text-[#5F554A] max-w-sm">
          Update your personal information to keep your livansa account current.
        </p>
      </div>

      {/* Form Card */}
      <div className="relative w-full">
        <div className="border border-[#1C1B18]/15 bg-[#F8F4EA] px-6 py-8 sm:p-10">
          
          <div className="mb-10 flex items-center justify-between border-b border-[#1C1B18]/10 pb-4">
            <span className="text-[11px] md:text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
              Edit Profile
            </span>
            <span className="text-[11px] md:text-[9px] font-semibold uppercase tracking-[0.25em] text-[#174D35]">
              01 / 01
            </span>
          </div>

          {error && (
            <div className="mb-6 border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs md:text-[11px] font-medium text-red-600">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 border border-green-500/20 bg-green-500/5 px-4 py-3 text-xs md:text-[11px] font-medium text-green-700">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* 01 / PROFILE PHOTO */}
            <div>
              <label className={labelClass}>01 / Profile Photo</label>
              <div className="flex items-center gap-6 mt-3">
                <div className="w-16 h-16 rounded-full border border-[#1C1B18]/15 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl text-[#174D35] font-serif">
                      {profile.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs md:text-[10px] font-semibold uppercase tracking-[0.16em] text-[#174D35] hover:opacity-70 transition-opacity flex items-center gap-1"
                  >
                    Change Image <ArrowUpRight size={12} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* 02 / USERNAME */}
            <div>
              <label htmlFor="username" className={labelClass}>
                02 / Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                autoComplete="username"
                className={inputClass}
              />
            </div>

            {/* 03 / EMAIL ADDRESS */}
            <div>
              <label htmlFor="email" className={labelClass}>
                03 / Email Address
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="w-full border-b border-[#1C1B18]/10 bg-transparent py-3 text-sm font-medium text-[#756A5C] cursor-not-allowed outline-none"
              />
              <p className="mt-1 text-[11px] md:text-[9px] text-[#756A5C]">Email address cannot be changed.</p>
            </div>

            {/* 04 / PHONE NUMBER */}
            <div>
              <label htmlFor="contact" className={labelClass}>
                04 / Phone Number
              </label>
              <input
                id="contact"
                type="tel"
                value={contact}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setContact(value);
                }}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                autoComplete="tel"
                className={inputClass}
              />
            </div>

            {/* ACTIONS */}
            <div className="pt-6 mt-4 flex items-center justify-between">
              <Link
                href="/profile"
                className="text-[11px] md:text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5F554A] hover:text-[#174D35] transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="group flex h-11 items-center justify-center gap-2 rounded-full bg-[#174D35] px-6 text-xs md:text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:!text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <ButtonLoader color="#F8F4EA" /> : "Save Changes"}
                {!isSaving && (
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Architectural corners */}
        <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-[#174D35]" />
        <span className="absolute -right-1 -top-1 h-3 w-3 border-r border-t border-[#174D35]" />
        <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-[#174D35]" />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-[#174D35]" />
      </div>
    </main>
  );
}
