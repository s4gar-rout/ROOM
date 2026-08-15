"use client";

import { useState } from "react";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../services/auth.service";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, password);

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Reset link is invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-5 text-center">
        <h2 className="font-serif text-3xl">
          Password{" "}
          <em className="text-[#174D35]">
            updated.
          </em>
        </h2>

        <p className="mt-3 text-xs font-medium text-[#5F554A]">
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      {error && (
        <div className="border border-red-500/20 bg-red-500/5 px-3 py-2 text-[10px] font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A]"
        >
          01 / New password
        </label>

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Create a new password"
            autoComplete="new-password"
            className="w-full border-b border-[#1C1B18]/25 bg-transparent py-3 pr-8 text-sm font-medium outline-none placeholder:text-[#756A5C] focus:border-[#174D35]"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#5F554A]"
          >
            {showPassword ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}
          </button>
        </div>
      </div>

      {/* Confirm */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A]"
        >
          02 / Confirm password
        </label>

        <div className="relative">
          <input
            id="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            placeholder="Repeat your password"
            autoComplete="new-password"
            className="w-full border-b border-[#1C1B18]/25 bg-transparent py-3 pr-8 text-sm font-medium outline-none placeholder:text-[#756A5C] focus:border-[#174D35]"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (prev) => !prev
              )
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#5F554A]"
          >
            {showConfirmPassword ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] text-xs font-semibold uppercase tracking-[0.16em] text-[#F8F4EA] disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update password"}

        {!loading && <ArrowUpRight size={16} />}
      </button>

      <p className="text-center text-[11px] text-[#5F554A]">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#174D35] underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}