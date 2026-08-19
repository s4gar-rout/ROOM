"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { loginUser } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginErrors = Partial<
  Record<keyof LoginFormData, string>
>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { user: authUser, loading: authLoading, setUser } = useAuth();

  const [formData, setFormData] =
    useState<LoginFormData>({
      email: "",
      password: "",
    });

  const [errors, setErrors] =
    useState<LoginErrors>({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  // ==========================================
  // ALREADY LOGGED IN
  // ==========================================

  useEffect(() => {
    if (!authLoading && authUser) {
      if (authUser.role === "owner") {
        router.replace(returnUrl || "/owner-dashboard");
      } else if (authUser.role === "tenant") {
        router.replace(returnUrl || "/");
      }
    }
  }, [authUser, authLoading, router, returnUrl]);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (
      errors[name as keyof LoginFormData]
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    const newErrors: LoginErrors = {};

    const email = formData.email.trim();

    if (!email) {
      newErrors.email = "Email or phone number is required";
    } else if (email.length < 3) {
      newErrors.email = "Enter a valid email address or phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      const user = response?.user;

      if (!user) {
        setServerError(
          "Login successful, but user information was not received."
        );
        return;
      }

      setUser(user);

      if (user.role === "owner") {
        router.replace(returnUrl || "/owner-dashboard");
        return;
      }

      if (user.role === "tenant") {
        router.replace(returnUrl || "/");
        return;
      }

      if (user.role === "admin") {
        router.replace(returnUrl || "/admin");
        return;
      }

      setServerError(
        "Your account role is not configured correctly."
      );
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Invalid email/phone or password.";

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // STYLES
  // ==========================================

  const inputClass = (
    field: keyof LoginFormData
  ) =>
    `w-full border-b ${
      errors[field]
        ? "border-red-500"
        : "border-[#1C1B18]/25 focus:border-[#174D35]"
    } bg-transparent py-3 text-sm font-medium text-[#1C1B18] outline-none transition-colors placeholder:font-medium placeholder:text-[#756A5C]`;

  const labelClass =
    "mb-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A]";

  const errorClass =
    "mt-1 text-[10px] font-medium text-red-500";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      {/* EMAIL OR PHONE */}

      <div>
        <label
          htmlFor="email"
          className={labelClass}
        >
          01 / Email or Phone
        </label>

        <input
          id="email"
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email@example.com or phone number"
          autoComplete="username"
          className={inputClass(
            "email"
          )}
        />

        {errors.email && (
          <p className={errorClass}>
            {errors.email}
          </p>
        )}
      </div>

      {/* PASSWORD */}

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="password"
            className={labelClass}
          >
            02 / Password
          </label>

          <Link
            href="/forgot-password"
            className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#174D35] transition-opacity hover:opacity-60"
          >
            Forgot?
          </Link>
        </div>

        <div className="relative">
          <input
            id="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            value={
              formData.password
            }
            onChange={handleChange}
            placeholder="Your password"
            autoComplete="current-password"
            className={`${inputClass(
              "password"
            )} pr-8`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (prev) => !prev
              )
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#5F554A] transition-colors hover:text-[#174D35]"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}
          </button>
        </div>

        {errors.password && (
          <p className={errorClass}>
            {errors.password}
          </p>
        )}
      </div>

      {/* SERVER ERROR */}

      {serverError && (
        <div className="mb-4 border border-red-500/20 bg-red-500/5 px-4 py-3 text-[11px] font-medium text-red-600">
          {serverError}
        </div>
      )}

      {/* SUBMIT */}

      <button
        type="submit"
        disabled={isLoading}
        className="group mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? <ButtonLoader color="#F8F4EA" /> : "Login securely"}

        {!isLoading && (
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        )}
      </button>

      {/* REGISTER */}

      <p className="pt-1 text-center text-[11px] font-medium text-[#5F554A]">
        New to ROOM?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#174D35] underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}