"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ForgotPasswordForm from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  return (
    <main className="min-h-[100svh] overflow-hidden bg-[#F8F4EA] text-[#1C1B18]">
      {/* ========================================
          HEADER
      ======================================== */}

      <header className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="font-serif text-2xl italic tracking-tight text-[#174D35]"
        >
          room.
        </Link>

        <Link
          href="/login"
          className="group flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5F554A] transition-colors hover:text-[#174D35]"
        >
          <ArrowLeft
            size={13}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />

          Sign in
        </Link>
      </header>

      {/* ========================================
          MAIN
      ======================================== */}

      <section className="mx-auto flex min-h-[calc(100svh-68px)] max-w-[1240px] items-center px-6 py-6 sm:px-10 lg:h-[calc(100svh-68px)] lg:min-h-0 lg:py-5">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_520px] lg:gap-20">

          {/* ====================================
              LEFT CONTENT
          ==================================== */}

          <div className="hidden lg:block">
            <div className="max-w-[600px]">

              <div className="mb-9 flex items-center gap-3">
                <span className="h-px w-12 bg-[#174D35]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#174D35]">
                  Account recovery
                </span>
              </div>

              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#5F554A]">
                Room / 03
              </p>

              <h1 className="font-serif text-[5.5rem] leading-[0.84] tracking-[-0.055em]">
                Find your
                <br />
                way{" "}
                <em className="text-[#174D35]">
                  back.
                </em>
              </h1>

              <p className="mt-8 max-w-[390px] text-sm font-medium leading-6 text-[#5F554A]">
                A simple three-step process to safely
                recover your ROOM account.
              </p>

              <div className="mt-14 flex max-w-[600px] items-center justify-between border-t border-[#1C1B18]/10 pt-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  Jharsuguda • Odisha
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  2026
                </span>
              </div>

            </div>
          </div>

          {/* ====================================
              RIGHT CARD
          ==================================== */}

          <div className="relative w-full">

            <div className="border border-[#1C1B18]/15 bg-[#F8F4EA] px-7 py-7 sm:px-8">

              {/* Mobile heading */}

              <div className="mb-7 lg:hidden">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  Room / 03
                </p>

                <h1 className="font-serif text-4xl tracking-[-0.04em]">
                  {step === 1 && (
                    <>
                      Find your{" "}
                      <em className="text-[#174D35]">
                        way back.
                      </em>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      Verify your{" "}
                      <em className="text-[#174D35]">
                        email.
                      </em>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      Start{" "}
                      <em className="text-[#174D35]">
                        fresh.
                      </em>
                    </>
                  )}
                </h1>
              </div>

              {/* =================================
                  FORM
              ================================= */}

              <ForgotPasswordForm
                step={step}
                setStep={setStep}
                email={email}
                setEmail={setEmail}
                resetToken={resetToken}
                setResetToken={setResetToken}
              />

              {/* Bottom note */}

              <div className="mt-6 border-t border-[#1C1B18]/10 pt-4">
                <p className="text-[8px] font-medium leading-4 text-[#756A5C]/75">
                  Your account recovery information is
                  securely handled and never shared.
                </p>
              </div>

            </div>

            {/* Corner details */}

            <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-[#174D35]" />

            <span className="absolute -right-1 -top-1 h-3 w-3 border-r border-t border-[#174D35]" />

            <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-[#174D35]" />

            <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-[#174D35]" />

          </div>
        </div>
      </section>
    </main>
  );
}