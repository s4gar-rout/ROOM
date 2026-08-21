import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-[100svh] overflow-hidden bg-[#F8F4EA] text-[#1C1B18]">
      {/* Header */}
      <header className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="font-serif text-2xl italic tracking-tight text-[#174D35]"
        >
          livansa
        </Link>

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
      <section className="mx-auto flex min-h-[calc(100svh-72px)] max-w-[1240px] items-center px-6 py-8 sm:px-10 lg:py-10">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_500px] lg:gap-24">

          {/* LEFT — Editorial */}
          <div className="hidden lg:block">
            <div className="max-w-[620px]">

              {/* Eyebrow */}
              <div className="mb-10 flex items-center gap-3">
                <span className="h-px w-12 bg-[#174D35]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#174D35]">
                  Welcome back
                </span>
              </div>

              {/* Label */}
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#5F554A]">
                Livansa / 02
              </p>

              {/* Heading */}
              <h1 className="font-serif text-[5.8rem] font-normal leading-[0.84] tracking-[-0.055em]">
                Welcome
                <br />
                <em className="text-[#174D35]">
                  home.
                </em>
              </h1>

              {/* Description */}
              <p className="mt-9 max-w-[390px] text-sm font-medium leading-6 text-[#5F554A]">
                Pick up where you left off and continue
                finding a place that feels like home.
              </p>

              {/* Bottom information */}
              <div className="mt-16 flex max-w-[620px] items-center justify-between border-t border-[#1C1B18]/10 pt-5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  Jharsuguda • Odisha
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  2026
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — Login */}
          <div className="relative w-full">

            <div className="border border-[#1C1B18]/15 bg-[#F8F4EA] p-6 sm:p-8">

              {/* Top */}
              <div className="mb-8 flex items-center justify-between border-b border-[#1C1B18]/10 pb-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  Sign in
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#174D35]">
                  02 / 02
                </span>
              </div>

              {/* Mobile heading */}
              <div className="mb-8 lg:hidden">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                  Livansa / 02
                </p>

                <h1 className="font-serif text-4xl leading-none tracking-[-0.04em]">
                  Welcome{" "}
                  <em className="text-[#174D35]">
                    home.
                  </em>
                </h1>
              </div>

              <Suspense fallback={<div className="h-40 w-full animate-pulse bg-[#174D35]/5 rounded-md" />}>
                <LoginForm />
              </Suspense>

              {/* Bottom */}
              <div className="mt-7 border-t border-[#1C1B18]/10 pt-4">
                <p className="text-[8px] font-medium leading-4 text-[#756A5C]/75">
                  Secure access to your livansa account.
                </p>
              </div>
            </div>

            {/* Architectural corners */}
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