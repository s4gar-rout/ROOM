"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { useRouter } from "next/navigation";

import { 
  registerUser, 
  sendRegistrationOtp, 
  verifyRegistrationOtp,
  resendVerificationOtp // we might still need this if existing API handles it, but wait, sendRegistrationOtp can be used to resend. Let's use sendRegistrationOtp for resending.
} from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";
import NotificationPromptModal from "@/features/notifications/components/NotificationPromptModal";
import { getSafeErrorMessage } from "@/lib/error";

type Step = "EMAIL" | "OTP" | "DETAILS";

export default function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [step, setStep] = useState<Step>("EMAIL");
  
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === "OTP" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  // Step 1: Send Email OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setErrors({});
    
    if (!formData.email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }

    try {
      setIsLoading(true);
      await sendRegistrationOtp({ email: formData.email.trim() });
      setStep("OTP");
      setResendTimer(60);
      setServerSuccess("Verification code sent to your email. Enter the OTP below to continue.");
    } catch (error: unknown) {
      const message = getSafeErrorMessage(error, "Failed to send verification code. Please try again.");
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResending) return;
    try {
      setIsResending(true);
      setServerError("");
      setServerSuccess("");
      await sendRegistrationOtp({ email: formData.email.trim() });
      setServerSuccess("A new verification code has been sent to your email.");
      setResendTimer(60);
    } catch (error: unknown) {
      const message = getSafeErrorMessage(error, "Failed to resend verification code. Please try again.");
      setServerError(message);
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    if (!otp || otp.trim().length !== 6) {
      setServerError("Please enter a valid 6-digit verification code");
      return;
    }

    try {
      setIsLoading(true);
      await verifyRegistrationOtp({
        email: formData.email.trim(),
        otp: otp.trim(),
      });
      setServerSuccess(""); // Clear success message from OTP screen
      setStep("DETAILS");
    } catch (error: unknown) {
      const message = getSafeErrorMessage(error, "Verification failed. Invalid or expired OTP.");
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Finalize Registration
  const validateDetails = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    const username = formData.username.trim();
    const contact = formData.contact.trim();

    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!contact) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(contact)) {
      newErrors.contact = "Enter a valid 10-digit mobile number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    
    if (!validateDetails()) return;

    try {
      setIsLoading(true);
      const response = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        password: formData.password,
      });

      if (response.user) {
        setUser(response.user);
        setShowNotificationModal(true);
      }
    } catch (error: unknown) {
      const message = getSafeErrorMessage(error, "An error occurred during registration. Please try again.");
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes("mobile number") || lowerMessage.includes("contact")) {
        setErrors((prev) => ({ ...prev, contact: message }));
      } else if (lowerMessage.includes("username")) {
        setErrors((prev) => ({ ...prev, username: message }));
      } else {
        setServerError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (error?: string) =>
    `w-full border-b ${
      error ? "border-red-500" : "border-[#1C1B18]/25 focus:border-[#174D35]"
    } bg-transparent py-3 text-sm font-medium text-[#1C1B18] outline-none transition-colors placeholder:font-medium placeholder:text-[#756A5C]`;

  const labelClass = "mb-0.5 block text-[11px] md:text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F554A]";
  const errorClass = "mt-0.5 text-xs md:text-[10px] font-medium text-red-500";

  return (
    <>
      <div className="space-y-4">
        {serverError && (
          <div className="border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs md:text-[10px] font-medium leading-4 text-red-600">
            {serverError}
          </div>
        )}
        
        {serverSuccess && step === "OTP" && (
          <div className="border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs md:text-[10px] font-medium leading-4 text-green-700">
            {serverSuccess}
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === "EMAIL" && (
          <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass(errors.email)}
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.email.trim()}
              className="group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap leading-none shrink-0"
            >
              {isLoading ? <ButtonLoader color="#F8F4EA" /> : "Verify Email"}
              {!isLoading && (
                <ArrowUpRight size={16} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              )}
            </button>
            
            <p className="pt-1 text-center text-xs md:text-[11px] font-medium text-[#5F554A]">
              Already have a place?{" "}
              <Link href="/login" className="font-semibold text-[#174D35] underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="rounded-2xl border border-[#174D35]/20 bg-[#174D35]/5 p-4 text-center">
              <p className="text-xs md:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#174D35]">
                Email Verification
              </p>
              <p className="mt-1 text-xs text-[#5F554A]">
                A 6-digit code was sent to <strong className="text-[#1C1B18]">{formData.email}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="otp" className={labelClass}>Verification Code</label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setServerError("");
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full border-b border-[#1C1B18]/25 bg-transparent py-3 text-center font-mono text-2xl font-bold tracking-[0.4em] text-[#1C1B18] outline-none focus:border-[#174D35]"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || isResending}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[#174D35] disabled:text-[#756A5C] disabled:cursor-not-allowed hover:underline transition-colors"
              >
                {isResending ? "Sending..." : resendTimer > 0 ? `Resend code in ${formatTimer(resendTimer)}` : "Resend Code"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="group mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] px-4 text-xs font-bold uppercase tracking-[0.16em] text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap leading-none shrink-0"
            >
              {isLoading ? <ButtonLoader color="#F8F4EA" /> : "Verify"}
              {!isLoading && (
                <ArrowUpRight size={16} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setServerError("");
                setOtp("");
              }}
              className="w-full text-center text-xs font-medium text-[#756A5C] hover:text-[#174D35]"
            >
              ← Change email address
            </button>
          </form>
        )}

        {/* STEP 3: DETAILS */}
        {step === "DETAILS" && (
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            
            <div className="mb-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 flex items-center gap-2">
               <span className="text-green-600 text-xs font-semibold uppercase tracking-wider">Email Verified ✓</span>
               <span className="text-[#5F554A] text-xs ml-auto truncate">{formData.email}</span>
            </div>

            <div>
              <label htmlFor="username" className={labelClass}>Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your display name"
                className={inputClass(errors.username)}
              />
              {errors.username && <p className={errorClass}>{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="contact" className={labelClass}>Mobile Number</label>
              <input
                id="contact"
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData((prev) => ({ ...prev, contact: value }));
                  if (errors.contact) setErrors((prev) => ({ ...prev, contact: "" }));
                  setServerError("");
                }}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                className={inputClass(errors.contact)}
              />
              {errors.contact && <p className={errorClass}>{errors.contact}</p>}
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={`${inputClass(errors.password)} pr-8`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#5F554A] transition-colors hover:text-[#174D35]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className={errorClass}>{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`${inputClass(errors.confirmPassword)} pr-8`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#5F554A] transition-colors hover:text-[#174D35]"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap leading-none shrink-0"
            >
              {isLoading ? <ButtonLoader color="#F8F4EA" /> : "Create Account"}
              {!isLoading && (
                <ArrowUpRight size={16} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              )}
            </button>
          </form>
        )}
      </div>

      <NotificationPromptModal
        isOpen={showNotificationModal}
        onComplete={() => {
          setShowNotificationModal(false);
          router.replace("/complete-profile");
        }}
      />
    </>
  );
}
