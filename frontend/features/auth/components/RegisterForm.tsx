"use client";

import { useState } from "react";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { registerUser } from "../services/auth.service";

type RegisterFormData = {
  username: string;
  email: string;
  contact: string;
  password: string;
  confirmPassword: string;
};

type RegisterErrors = Partial<
  Record<keyof RegisterFormData, string>
>;

export default function RegisterForm() {
  const [formData, setFormData] =
    useState<RegisterFormData>({
      username: "",
      email: "",
      contact: "",
      password: "",
      confirmPassword: "",
    });

  const [errors, setErrors] =
    useState<RegisterErrors>({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =====================================================
     INPUT CHANGE
  ====================================================== */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setServerError("");
    setSuccessMessage("");
  };

  /* =====================================================
     VALIDATION
  ====================================================== */

  const validateForm = () => {
    const newErrors: RegisterErrors = {};

    const username =
      formData.username.trim();

    const email =
      formData.email.trim();

    const contact =
      formData.contact.trim();

    if (!username) {
      newErrors.username =
        "Username is required";
    } else if (username.length < 3) {
      newErrors.username =
        "Username must be at least 3 characters";
    }

    if (!email) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (!contact) {
      newErrors.contact =
        "Contact number is required";
    } else if (!/^\d{10}$/.test(contact)) {
      newErrors.contact =
        "Enter a valid 10-digit number";
    }

    if (!formData.password) {
      newErrors.password =
        "Password is required";
    } else if (
      formData.password.length < 8
    ) {
      newErrors.password =
        "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =====================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setServerError("");
    setSuccessMessage("");

    const isValid = validateForm();

    if (!isValid) return;

    try {
      setIsLoading(true);

      const response = await registerUser({
        username:
          formData.username.trim(),

        email:
          formData.email.trim(),

        contact:
          formData.contact.trim(),

        password:
          formData.password,
      });

      console.log(
        "Registration successful:",
        response
      );

      setSuccessMessage(
        response.message ||
        "Account created successfully."
      );

      setFormData({
        username: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error(
        "Registration error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================================================
     STYLES
  ====================================================== */

  const inputClass = (
    field: keyof RegisterFormData
  ) =>
    `w-full border-b ${errors[field]
      ? "border-red-500"
      : "border-[#1C1B18]/25 focus:border-[#174D35]"
    } bg-transparent py-3 text-sm font-medium text-[#1C1B18] outline-none transition-colors placeholder:font-medium placeholder:text-[#756A5C]`;
  const labelClass =
    "mb-0.5 block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A]";

  const errorClass =
    "mt-0.5 text-[10px] font-medium text-red-500";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Server Error */}
      {serverError && (
        <div className="mb-3 border border-red-500/20 bg-red-500/5 px-3 py-2 text-[10px] font-medium leading-4 text-red-600">
          {serverError}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div className="mb-3 border border-[#174D35]/20 bg-[#174D35]/5 px-3 py-2 text-[10px] font-medium leading-4 text-[#174D35]">
          {successMessage}
        </div>
      )}

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className={labelClass}
        >
          01 / Username
        </label>

        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Your name"
          autoComplete="username"
          className={inputClass("username")}
        />

        {errors.username && (
          <p className={errorClass}>
            {errors.username}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className={labelClass}
        >
          02 / Email
        </label>

        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          className={inputClass("email")}
        />

        {errors.email && (
          <p className={errorClass}>
            {errors.email}
          </p>
        )}
      </div>

      {/* Contact */}
      <div>
        <label
          htmlFor="contact"
          className={labelClass}
        >
          03 / Contact
        </label>

        <input
          id="contact"
          type="tel"
          name="contact"
          value={formData.contact}
          onChange={(e) => {
            const value =
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

            setFormData((prev) => ({
              ...prev,
              contact: value,
            }));

            if (errors.contact) {
              setErrors((prev) => ({
                ...prev,
                contact: "",
              }));
            }

            setServerError("");
            setSuccessMessage("");
          }}
          placeholder="10-digit mobile number"
          inputMode="numeric"
          autoComplete="tel"
          className={inputClass("contact")}
        />

        {errors.contact && (
          <p className={errorClass}>
            {errors.contact}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className={labelClass}
        >
          04 / Password
        </label>

        <div className="relative">
          <input
            id="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
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
            aria-label="Toggle password visibility"
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

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className={labelClass}
        >
          05 / Confirm password
        </label>

        <div className="relative">
          <input
            id="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            name="confirmPassword"
            value={
              formData.confirmPassword
            }
            onChange={handleChange}
            placeholder="Repeat your password"
            autoComplete="new-password"
            className={`${inputClass(
              "confirmPassword"
            )} pr-8`}
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (prev) => !prev
              )
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#5F554A] transition-colors hover:text-[#174D35]"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className={errorClass}>
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading
          ? "Creating..."
          : "Enter ROOM"}

        {!isLoading && (
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        )}
      </button>

      {/* Login */}
<p className="pt-1 text-center text-[11px] font-medium text-[#5F554A]">
  Already have a place?{" "}
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