"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Building2, ArrowUpRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { becomeOwner } from "../services/auth.service";
import ButtonLoader from "@/components/ui/ButtonLoader";

interface BecomeOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectUrl?: string;
}

export default function BecomeOwnerModal({
  isOpen,
  onClose,
  onSuccess,
  redirectUrl = "/owner-dashboard/add-room",
}: BecomeOwnerModalProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await becomeOwner();

      if (response.success && response.user) {
        setUser(response.user);
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectUrl);
        }
      } else {
        throw new Error(response.message || "Couldn't update your account. Please try again.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Couldn't update your account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && onClose()}
          className="fixed inset-0 bg-[#1C1B18]/40 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#174D35]/15 bg-[#F8F4EA] p-6 sm:p-8 shadow-xl text-[#1C1B18]"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#756A5C] hover:bg-[#1C1B18]/5 hover:text-[#1C1B18] transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Icon Badge */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
            <Building2 size={24} />
          </div>

          {/* Header */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#174D35]">
            Account Role Conversion
          </p>
          <h3 className="mt-1 font-serif text-2xl font-normal leading-tight text-[#1C1B18] sm:text-3xl">
            Want to list a room?
          </h3>

          {/* Message */}
          <p className="mt-3 text-xs leading-relaxed text-[#756A5C] sm:text-sm">
            You're currently a tenant. To add and manage rental listings, your account needs to be converted to an owner.
          </p>

          <div className="mt-3 rounded-xl border border-[#174D35]/15 bg-[#174D35]/5 p-3 text-xs font-medium text-[#174D35]">
            Your account role will be updated to <span className="font-bold">"Owner"</span> after you confirm.
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 w-full sm:w-auto rounded-full border border-[#174D35]/30 bg-transparent px-6 text-xs font-semibold text-[#1C1B18] hover:bg-[#1C1B18]/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="group flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#174D35] px-6 text-xs font-semibold !text-[#F8F4EA] transition-all hover:bg-[#123d2a] active:bg-[#0d2e1f] disabled:opacity-70 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <ButtonLoader color="#F8F4EA" />
                  <span>Becoming an Owner...</span>
                </>
              ) : (
                <>
                  <span>Become an Owner</span>
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
