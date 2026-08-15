import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ResetPasswordForm from "../components/ResetPasswordForm";

interface ResetPasswordPageProps {
  token: string;
}

export default function ResetPasswordPage({
  token,
}: ResetPasswordPageProps) {
  return (
    <main className="min-h-[100svh] bg-[#F8F4EA] text-[#1C1B18]">
      <header className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="font-serif text-2xl italic tracking-tight text-[#174D35]"
        >
          room.
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5F554A] hover:text-[#174D35]"
        >
          <ArrowLeft size={13} />
          Sign in
        </Link>
      </header>

      <section className="mx-auto flex min-h-[calc(100svh-68px)] max-w-[1240px] items-center justify-center px-6 py-6">
        <div className="relative w-full max-w-[500px]">
          <div className="border border-[#1C1B18]/15 px-7 py-7 sm:px-8">
            <div className="mb-8 border-b border-[#1C1B18]/10 pb-4">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
                Create new password
              </span>
            </div>

            <ResetPasswordForm token={token} />
          </div>

          <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-[#174D35]" />
          <span className="absolute -right-1 -top-1 h-3 w-3 border-r border-t border-[#174D35]" />
          <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-[#174D35]" />
          <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-[#174D35]" />
        </div>
      </section>
    </main>
  );
}