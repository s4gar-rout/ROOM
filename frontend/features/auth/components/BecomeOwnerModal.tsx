"use client";

import { useState } from "react";
import { updateProfile } from "@/features/auth/services/profile.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";

interface BecomeOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeOwnerModal({ isOpen, onClose }: BecomeOwnerModalProps) {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError("");
      
      await updateProfile({ role: "owner" });
      await refreshUser();
      
      onClose();
      router.push("/owner-dashboard");
    } catch (error: unknown) {
      setError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[20px] bg-[#F8F4EA] p-6 shadow-2xl relative">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute right-4 top-4 text-[#1C1B18]/50 hover:text-[#1C1B18] transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="font-serif text-2xl font-medium text-[#1C1B18]">
          Become a Property Owner
        </h2>

        <p className="mt-3 text-sm text-[#5F554A] leading-relaxed">
          You are about to upgrade your account to an Owner. This will give you access to list your properties and manage rentals.
        </p>

        {error && (
          <div className="mt-4 rounded-[12px] border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#5F554A] hover:bg-[#1C1B18]/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-[#174D35] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#F8F4EA] hover:bg-[#14422D] transition-colors disabled:opacity-70"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Upgrading..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
