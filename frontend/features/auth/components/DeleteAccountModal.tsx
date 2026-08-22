"use client";

import { useState, useEffect } from "react";
import { Trash2, AlertTriangle, ArrowUpRight, Loader2, X, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  sendDeleteAccountOtp,
  verifyAndDeleteAccount,
} from "../services/profile.service";
import { useAuth } from "../hooks/useAuth";
import { getSafeErrorMessage } from "@/lib/error";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const [step, setStep] = useState<"confirm" | "otp">("confirm");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep("confirm");
      setOtp("");
      setError("");
      setSuccess("");
      setCooldown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await sendDeleteAccountOtp();
      if (res.success) {
        setStep("otp");
        setCooldown(45);
      } else {
        setError(res.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: unknown) {
      const msg = getSafeErrorMessage(err, "Failed to send verification OTP.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const res = await sendDeleteAccountOtp();
      if (res.success) {
        setCooldown(45);
      } else {
        setError(res.message || "Failed to resend OTP.");
      }
    } catch (err: unknown) {
      const msg = getSafeErrorMessage(err, "Failed to resend OTP. Please try again.");
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const handleVerifyAndDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await verifyAndDeleteAccount(otp.trim());
      if (res.success) {
        setSuccess("Your account has been deleted permanently.");
        setTimeout(async () => {
          await logout();
          onClose();
          router.replace("/register");
        }, 1500);
      } else {
        setError(res.message || "Failed to verify OTP.");
      }
    } catch (err: unknown) {
      const msg = getSafeErrorMessage(err, "Invalid or expired OTP.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B18]/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md border border-[#1C1B18]/20 bg-[#F8F4EA] p-7 sm:p-9 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-[#1C1B18]/10 pb-4">
          <div className="flex items-center gap-2 text-[#1C1B18]">
            <Trash2 size={16} className="text-[#5F554A]" />
            <span className="text-[11px] md:text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
              Delete Account
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-[#5F554A] transition-colors hover:text-[#1C1B18]"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-5 border border-[#1C1B18]/15 bg-[#1C1B18]/5 px-4 py-3 text-xs font-medium text-[#1C1B18]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 border border-[#174D35]/20 bg-[#174D35]/10 px-4 py-3 text-xs font-medium text-[#174D35]">
            {success}
          </div>
        )}

        {step === "confirm" ? (
          <div>
            <h2 className="font-serif text-3xl font-normal leading-tight tracking-tight text-[#1C1B18]">
              Delete your <em className="text-[#174D35]">account?</em>
            </h2>

            <p className="mt-3 text-sm font-medium leading-relaxed text-[#5F554A]">
              This action is permanent and cannot be undone. All your room listings, chat conversations, notifications, and profile details will be permanently removed.
            </p>

            <p className="mt-3 text-xs md:text-[11px] font-medium text-[#756A5C]">
              We will send a 6-digit verification code to <span className="font-semibold text-[#1C1B18]">{userEmail || "your email"}</span> to verify account ownership.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1C1B18] px-5 text-sm sm:text-xs font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] transition-all duration-300 hover:bg-[#174D35] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-[#F8F4EA]" />
                ) : (
                  <>
                    Send Verification Code
                    <ArrowUpRight size={15} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-10 text-center text-xs md:text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5F554A] transition-colors hover:text-[#1C1B18]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyAndDelete}>
            <h2 className="font-serif text-3xl font-normal leading-tight tracking-tight text-[#1C1B18]">
              Verify Email <em className="text-[#174D35]">OTP</em>
            </h2>

            <p className="mt-3 text-sm font-medium leading-relaxed text-[#5F554A]">
              Enter the 6-digit code sent to <span className="font-semibold text-[#1C1B18]">{userEmail || "your email"}</span> to confirm permanent account deletion.
            </p>

            <div className="mt-6">
              <label
                htmlFor="delete-account-otp"
                className="mb-1 block text-[11px] md:text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A]"
              >
                01 / Enter 6-Digit OTP
              </label>
              <input
                id="delete-account-otp"
                type="text"
                maxLength={6}
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full border-b border-[#1C1B18]/25 bg-transparent py-3 text-center font-mono text-2xl font-bold tracking-[0.4em] text-[#1C1B18] outline-none transition-colors focus:border-[#174D35]"
                autoFocus
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs md:text-[10px] font-medium text-[#5F554A]">
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="flex items-center gap-1 font-semibold text-[#174D35] hover:underline disabled:opacity-50"
              >
                <RotateCcw size={11} className={resending ? "animate-spin" : ""} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1C1B18] px-5 text-sm sm:text-xs font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] transition-all duration-300 hover:bg-[#174D35] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-[#F8F4EA]" />
                ) : (
                  "Confirm & Delete Account"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("confirm")}
                disabled={loading}
                className="h-10 text-center text-xs md:text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5F554A] transition-colors hover:text-[#1C1B18]"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Architectural Corners */}
        <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-[#174D35]" />
        <span className="absolute -right-1 -top-1 h-3 w-3 border-r border-t border-[#174D35]" />
        <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-[#174D35]" />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-[#174D35]" />
      </div>
    </div>
  );
}
