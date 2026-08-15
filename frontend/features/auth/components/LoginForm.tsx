"use client";

import { useState } from "react";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { loginUser } from "../services/auth.service";


type LoginFormData = {
  email: string;
  password: string;
};

type LoginErrors = Partial<
  Record<keyof LoginFormData, string>
>;

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: LoginErrors = {};

    const email = formData.email.trim();

    if (!email) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setServerError("");

  const isValid = validateForm();

  if (!isValid) return;

  try {
    setIsLoading(true);

    const response = await loginUser({
      email: formData.email.trim(),
      password: formData.password,
    });

    console.log("Login successful:", response);

    // Next step:
    // redirect to dashboard/home
    // and maintain authenticated user state

  } catch (error: any) {
    console.error("Login error:", error);

    const message =
      error?.response?.data?.message ||
      "Invalid email or password.";

    setServerError(message);

  } finally {
    setIsLoading(false);
  }
};

  const inputClass = (
    field: keyof LoginFormData
  ) =>
    `w-full border-b ${errors[field]
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
      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          01 / Email
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
          <p className={errorClass}>{errors.email}</p>
        )}
      </div>

      {/* Password */}
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
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            autoComplete="current-password"
            className={`${inputClass("password")} pr-8`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((prev) => !prev)
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

      {serverError && (
  <div className="mb-4 border border-red-500/20 bg-red-500/5 px-4 py-3 text-[11px] font-medium text-red-600">
    {serverError}
  </div>
)}

      {/* Submit */}
<button
  type="submit"
  disabled={isLoading}
  className="group mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isLoading ? "Signing in..." : "Enter ROOM"}

  {!isLoading && (
    <ArrowUpRight
      size={16}
      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    />
  )}
</button>

      {/* Register */}
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