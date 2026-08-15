"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../services/auth.service";

// ==========================================
// TYPES
// ==========================================

type Step = 1 | 2 | 3;

interface ForgotPasswordFormProps {
  step: Step;

  setStep: Dispatch<SetStateAction<Step>>;

  email: string;
  setEmail: Dispatch<SetStateAction<string>>;

  resetToken: string;
  setResetToken: Dispatch<SetStateAction<string>>;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// ==========================================
// COMPONENT
// ==========================================

export default function ForgotPasswordForm({
  step,
  setStep,
  email,
  setEmail,
  resetToken,
  setResetToken,
}: ForgotPasswordFormProps) {
  // ========================================
  // LOCAL STATE
  // ========================================

  const [otp, setOtp] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [resendTimer, setResendTimer] =
    useState(0);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [completed, setCompleted] =
    useState(false);

  // ========================================
  // OTP RESEND TIMER
  // ========================================

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendTimer((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendTimer]);

  // ========================================
  // HELPERS
  // ========================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const getErrorMessage = (
    error: unknown,
    fallback: string
  ) => {
    const apiError = error as ApiError;

    return (
      apiError?.response?.data?.message ||
      fallback
    );
  };

  // ========================================
  // STEP 1
  // SEND OTP
  // ========================================

  const handleEmailSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({
        email: normalizedEmail,
      });

      setEmail(normalizedEmail);

      setOtp("");

      setStep(2);

      // Backend cooldown = 60 seconds
      setResendTimer(60);

      setSuccess(
        "We've sent a 6-digit verification code to your email."
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Unable to send verification code. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // STEP 2
  // VERIFY OTP
  // ========================================

  const handleOtpSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    const normalizedOtp = otp.trim();

    if (!normalizedOtp) {
      setError(
        "Please enter the verification code."
      );
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError(
        "Verification code must contain exactly 6 digits."
      );
      return;
    }

    if (!email) {
      setError(
        "Email session is missing. Please start again."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await verifyResetOtp({
          email,
          otp: normalizedOtp,
        });

      if (!response.resetToken) {
        setError(
          "Reset session could not be created. Please request a new OTP."
        );
        return;
      }

      setResetToken(
        response.resetToken
      );

      setOtp("");

      setStep(3);

      setSuccess(
        "Email verified successfully. Create your new password."
      );
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Invalid or expired verification code."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RESEND OTP
  // ========================================

  const handleResendOtp = async () => {
    clearMessages();

    if (!email) {
      setError(
        "Email session is missing. Please start again."
      );
      return;
    }

    if (
      resendTimer > 0 ||
      resendLoading ||
      loading
    ) {
      return;
    }

    try {
      setResendLoading(true);

      await forgotPassword({
        email,
      });

      setOtp("");

      setResendTimer(60);

      setSuccess(
        "A new verification code has been sent."
      );
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Unable to resend verification code."
        )
      );
    } finally {
      setResendLoading(false);
    }
  };

  // ========================================
  // STEP 3
  // RESET PASSWORD
  // ========================================

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    if (!password) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (!email || !resetToken) {
      setError(
        "Your reset session has expired. Please start again."
      );
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        email,
        resetToken,
        newPassword: password,
        confirmPassword,
      });

      // Clear sensitive values
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setResetToken("");

      setCompleted(true);
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Unable to reset password. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // BACK TO EMAIL
  // ========================================

  const handleBackToEmail = () => {
    clearMessages();

    setStep(1);

    setOtp("");

    setResetToken("");

    setPassword("");

    setConfirmPassword("");

    setResendTimer(0);
  };

  // ========================================
  // SUCCESS SCREEN
  // ========================================

  if (completed) {
    return (
      <div className="w-full">
        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between border-b border-[#1C1B18]/10 pb-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#174D35]">
            Reset Access
          </span>

          <span className="text-[10px] font-bold tracking-[0.2em] text-[#174D35]">
            03 / 03
          </span>
        </div>

        {/* SUCCESS */}

        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-[#174D35] text-[#F8F4EA]">
            <Check
              size={28}
              strokeWidth={2.5}
            />
          </div>

          <h2 className="font-serif text-[42px] leading-[0.95] tracking-[-0.045em] text-[#1C1B18]">
            Password
            <br />
            <em className="text-[#174D35]">
              updated.
            </em>
          </h2>

          <p className="mt-5 max-w-sm text-sm font-medium leading-6 text-[#6A6258]">
            Your password has been changed
            successfully. You can now sign in
            using your new password.
          </p>

          <Link
            href="/login"
            className="mt-9 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1B18] transition-opacity hover:opacity-60"
          >
            Back to sign in
            <span className="text-sm">
              ↗
            </span>
          </Link>
        </div>

        {/* FOOTER */}

        <div className="border-t border-[#1C1B18]/10 pt-5">
          <p className="text-[9px] font-medium leading-4 text-[#8B8175]">
            Your account recovery information is
            securely handled and never shared.
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN FORM
  // ========================================

  return (
    <div className="w-full">

      {/* ====================================
          HEADER
      ==================================== */}

      <div className="mb-8 flex items-center justify-between border-b border-[#1C1B18]/10 pb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#174D35]">
          Reset Access
        </span>

        <span className="text-[10px] font-bold tracking-[0.2em] text-[#174D35]">
          {String(step).padStart(2, "0")} / 03
        </span>
      </div>

      {/* ====================================
          STEP 1 TITLE
      ==================================== */}

      {step === 1 && (
        <>
          <h2 className="font-serif text-[42px] leading-[0.95] tracking-[-0.045em] text-[#1C1B18]">
            Forgot your{" "}
            <em className="text-[#174D35]">
              password?
            </em>
          </h2>

          <p className="mt-4 max-w-md text-sm font-medium leading-6 text-[#6A6258]">
            Enter your registered email address
            and we&apos;ll send you a verification
            code.
          </p>
        </>
      )}

      {/* ====================================
          STEP 2 TITLE
      ==================================== */}

      {step === 2 && (
        <>
          <h2 className="font-serif text-[42px] leading-[0.95] tracking-[-0.045em] text-[#1C1B18]">
            Verify your{" "}
            <em className="text-[#174D35]">
              email.
            </em>
          </h2>

          <p className="mt-4 max-w-md text-sm font-medium leading-6 text-[#6A6258]">
            We&apos;ve sent a 6-digit code to{" "}
            <span className="font-bold text-[#1C1B18]">
              {email}
            </span>
          </p>
        </>
      )}

      {/* ====================================
          STEP 3 TITLE
      ==================================== */}

      {step === 3 && (
        <>
          <h2 className="font-serif text-[42px] leading-[0.95] tracking-[-0.045em] text-[#1C1B18]">
            Create a new{" "}
            <em className="text-[#174D35]">
              password.
            </em>
          </h2>

          <p className="mt-4 max-w-md text-sm font-medium leading-6 text-[#6A6258]">
            Choose a strong password to keep
            your account secure.
          </p>
        </>
      )}

      {/* ====================================
          ERROR MESSAGE
      ==================================== */}

      {error && (
        <div
          role="alert"
          className="mt-6 border border-red-500/20 bg-red-500/5 px-4 py-3 text-[10px] font-semibold leading-4 text-red-600"
        >
          {error}
        </div>
      )}

      {/* ====================================
          SUCCESS MESSAGE
      ==================================== */}

      {success && (
        <div
          role="status"
          className="mt-6 border border-[#174D35]/15 bg-[#174D35]/5 px-4 py-3 text-[10px] font-semibold leading-4 text-[#174D35]"
        >
          {success}
        </div>
      )}

      {/* ====================================
          STEP 1 — EMAIL
      ==================================== */}

      {step === 1 && (
        <form
          onSubmit={handleEmailSubmit}
          noValidate
          className="mt-8 space-y-7"
        >
          <div>
            <label
              htmlFor="reset-email"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#5F554A]"
            >
              01 / Email
            </label>

            <input
              id="reset-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value
                );

                clearMessages();
              }}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full border-b border-[#1C1B18]/20 bg-transparent px-0 py-3 text-base font-semibold text-[#1C1B18] outline-none transition-colors placeholder:text-[#756A5C]/55 focus:border-[#174D35] disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-13 w-full items-center justify-center rounded-full bg-[#174D35] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition-all hover:bg-[#123F2B] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Sending OTP..."
              : "Send Verification Code ↗"}
          </button>
        </form>
      )}

      {/* ====================================
          STEP 2 — OTP
      ==================================== */}

      {step === 2 && (
        <form
          onSubmit={handleOtpSubmit}
          noValidate
          className="mt-8 space-y-7"
        >
          <div>
            <label
              htmlFor="reset-otp"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#5F554A]"
            >
              02 / Verification Code
            </label>

            <input
              id="reset-otp"
              type="text"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => {
                const value =
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                setOtp(value);

                clearMessages();
              }}
              placeholder="000000"
              disabled={loading}
              className="w-full border-b border-[#1C1B18]/20 bg-transparent px-0 py-4 text-center font-mono text-2xl font-bold tracking-[0.45em] text-[#1C1B18] outline-none transition-colors placeholder:text-[#756A5C]/35 focus:border-[#174D35] disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              otp.length !== 6
            }
            className="flex h-13 w-full items-center justify-center rounded-full bg-[#174D35] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition-all hover:bg-[#123F2B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Verifying..."
              : "Verify Code ↗"}
          </button>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBackToEmail}
              disabled={loading}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5F554A] transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              <ArrowLeft size={13} />

              Change Email
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={
                resendTimer > 0 ||
                resendLoading ||
                loading
              }
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#174D35] transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {resendLoading
                ? "Sending..."
                : resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {/* ====================================
          STEP 3 — NEW PASSWORD
      ==================================== */}

      {step === 3 && (
        <form
          onSubmit={handlePasswordSubmit}
          noValidate
          className="mt-8 space-y-6"
        >
          {/* NEW PASSWORD */}

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#5F554A]"
            >
              03 / New Password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="newPassword"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );

                  clearMessages();
                }}
                placeholder="Create a password"
                disabled={loading}
                className="w-full border-b border-[#1C1B18]/20 bg-transparent px-0 py-3 pr-10 text-base font-semibold text-[#1C1B18] outline-none transition-colors placeholder:text-[#756A5C]/55 focus:border-[#174D35] disabled:opacity-50"
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#6A6258] transition-opacity hover:opacity-60"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-[9px] font-medium text-[#8B8175]">
              Minimum 8 characters
            </p>
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#5F554A]"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );

                  clearMessages();
                }}
                placeholder="Repeat your password"
                disabled={loading}
                className="w-full border-b border-[#1C1B18]/20 bg-transparent px-0 py-3 pr-10 text-base font-semibold text-[#1C1B18] outline-none transition-colors placeholder:text-[#756A5C]/55 focus:border-[#174D35] disabled:opacity-50"
              />

              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) =>
                      !previous
                  )
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#6A6258] transition-opacity hover:opacity-60"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              loading ||
              !password ||
              !confirmPassword
            }
            className="flex h-13 w-full items-center justify-center rounded-full bg-[#174D35] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition-all hover:bg-[#123F2B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Updating Password..."
              : "Update Password ↗"}
          </button>
        </form>
      )}

      {/* ====================================
          FOOTER
      ==================================== */}

      <div className="mt-8 border-t border-[#1C1B18]/10 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-medium leading-4 text-[#8B8175]">
            Secure account recovery
          </p>

          <Link
            href="/login"
            className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#1C1B18] transition-opacity hover:opacity-60"
          >
            Sign in ↗
          </Link>
        </div>
      </div>
    </div>
  );
}