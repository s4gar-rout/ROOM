import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-[#F8F4EA] text-[#1C1B18]">
      {/* Header */}
      <header className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 sm:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-2xl italic tracking-tight text-[#174D35]"
        >
          room.
        </Link>

        {/* Home */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5F554A] transition-colors hover:text-[#174D35]"
        >
          <ArrowLeft
            size={13}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />

          Home
        </Link>
      </header>

      {/* Main */}
<section className="mx-auto flex min-h-[calc(100svh-68px)] max-w-[1240px] items-center px-6 py-5 sm:px-10 lg:h-[calc(100svh-68px)] lg:min-h-0 lg:overflow-hidden lg:py-5">
  <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_520px] lg:gap-20">
          {/* =====================================================
              LEFT — EDITORIAL SECTION
          ====================================================== */}
          <div className="hidden lg:block">
            <div className="max-w-[620px]">
              {/* Eyebrow */}
              <div className="mb-8 flex items-center gap-3">
                <span className="h-px w-12 bg-[#174D35]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#174D35]">
                  A better way to rent
                </span>
              </div>

              {/* Section Label */}
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#5F554A]">
                Room / 01
              </p>

              {/* Heading */}
              <h1 className="font-serif text-[5.5rem] font-normal leading-[0.84] tracking-[-0.055em]">
                Find
                <br />
                your{" "}
                <em className="text-[#174D35]">
                  place.
                </em>
              </h1>

              {/* Description */}
              <p className="mt-7 max-w-[390px] text-sm font-medium leading-6 text-[#5F554A]">
                A simpler way to discover rooms and homes
                around the places you already call familiar.
              </p>

              {/* Bottom Meta */}
              <div className="mt-12 flex max-w-[620px] items-center justify-between border-t border-[#1C1B18]/10 pt-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  Jharsuguda • Odisha
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  2026
                </span>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT — REGISTER CARD
          ====================================================== */}
          <div className="relative w-full">
           <div className="border border-[#1C1B18]/15 bg-[#F8F4EA] px-7 py-7 sm:px-8 sm:py-7">
              {/* Card Header */}
             <div className="mb-7 flex items-center justify-between border-b border-[#1C1B18]/10 pb-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  Create account
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#174D35]">
                  01 / 01
                </span>
              </div>

              {/* Mobile Heading */}
              <div className="mb-6 lg:hidden">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  Room / 01
                </p>

                <h1 className="font-serif text-4xl leading-none tracking-[-0.04em]">
                  Find your{" "}
                  <em className="text-[#174D35]">
                    place.
                  </em>
                </h1>
              </div>

              {/* Form */}
              <RegisterForm />

              {/* Bottom Note */}
           <div className="mt-6 border-t border-[#1C1B18]/10 pt-4">
                <p className="text-[8px] font-medium leading-4 text-[#756A5C]/75">
                  By continuing, you agree to livansa&apos;s
                  Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>

            {/* Architectural Corners */}
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