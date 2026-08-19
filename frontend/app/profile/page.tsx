"use client";

import { useEffect, useState } from "react";
import { getMyProfile, ProfileUser } from "../../features/auth/services/profile.service";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowLeft, Trash2 } from "lucide-react";
import DeleteAccountModal from "@/features/auth/components/DeleteAccountModal";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

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

  if (loading || loadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#174D35] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-20 max-w-xl border border-red-500/20 bg-red-500/5 px-6 py-4 text-sm font-medium text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <main className="w-full flex flex-col gap-10">
      
      {/* Header & Back Navigation */}
      <div>
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5F554A] transition-colors hover:text-[#174D35] mb-8"
        >
          <ArrowLeft size={13} className="transition-transform duration-300 group-hover:-translate-x-1" /> Back
        </button>

        <h1 className="font-serif text-5xl sm:text-6xl tracking-tight text-[#1C1B18] leading-none mb-4">
          Your <em className="text-[#174D35]">profile.</em>
        </h1>
        <p className="text-sm font-medium text-[#5F554A] max-w-sm">
          Manage your personal information and ROOM account details.
        </p>
      </div>

      {/* Profile Card */}
      <div className="relative w-full">
        <div className="border border-[#1C1B18]/15 bg-[#F8F4EA] px-6 py-8 sm:p-10">
          
          {/* Top Label */}
          <div className="mb-10 flex items-center justify-between border-b border-[#1C1B18]/10 pb-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
              Personal Information
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#174D35]">
              01 / 01
            </span>
          </div>

          <div className="flex flex-col gap-10">
            
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-[#1C1B18]/15">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
                <div className="w-24 h-24 rounded-full border border-[#1C1B18]/15 overflow-hidden bg-[#F8F4EA] shrink-0 flex items-center justify-center shadow-sm">
                  {profile.avatar?.url ? (
                    <Image
                      src={profile.avatar.url}
                      alt={profile.username}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-[#174D35] font-serif">
                      {profile.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-serif text-[#1C1B18] leading-tight mb-1">{profile.username}</h2>
                  <p className="text-xs text-[#5F554A] mb-3">@{profile.username.toLowerCase().replace(/\s/g, '')}</p>
                  <span className="inline-block px-3 py-1 bg-[#174D35]/5 border border-[#174D35]/15 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#174D35]">
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <Link
                href="/profile/edit"
                className="group flex h-11 items-center justify-center gap-2 rounded-full bg-[#174D35] px-6 text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:!text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40"
              >
                Edit Profile
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {/* Information List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="border-b border-[#1C1B18]/15 pb-4">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A] mb-2">
                  01 / Username
                </span>
                <p className="text-sm font-medium text-[#1C1B18]">{profile.username}</p>
              </div>
              
              <div className="border-b border-[#1C1B18]/15 pb-4">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A] mb-2">
                  02 / Email Address
                </span>
                <p className="text-sm font-medium text-[#1C1B18]">{profile.email}</p>
              </div>

              <div className="border-b border-[#1C1B18]/15 pb-4 sm:col-span-2">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A] mb-2">
                  03 / Phone Number
                </span>
                <p className="text-sm font-medium text-[#1C1B18]">{profile.contact || "—"}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Architectural corners */}
        <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-[#174D35]" />
        <span className="absolute -right-1 -top-1 h-3 w-3 border-r border-t border-[#174D35]" />
        <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-[#174D35]" />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-[#174D35]" />
      </div>

      {/* Delete Account */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#1C1B18]/10 pt-6">
        <div>
          <h3 className="text-sm font-medium text-[#1C1B18]">Delete Account</h3>
          <p className="text-xs text-[#5F554A] mt-0.5">
            Permanently remove your account and all associated data via email OTP verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="self-start sm:self-auto flex h-10 items-center justify-center gap-2 rounded-full border border-[#1C1B18]/20 px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5F554A] transition-all hover:border-[#1C1B18] hover:bg-[#1C1B18] hover:!text-[#F8F4EA] whitespace-nowrap"
        >
          <Trash2 size={13} />
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal with OTP */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={profile.email}
      />
    </main>
  );
}
