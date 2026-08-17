import Link from "next/link";
import { UserRound } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full border-b border-[#DED7C9] bg-[#F8F4EA]">
      <nav className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">

        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-2xl md:text-3xl tracking-tight text-[#1C1B18]"
        >
          room.
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:gap-10 md:flex">
          <Link
            href="/rentals"
            className="text-sm md:text-[16px] text-[#756A5C] transition-colors hover:text-[#174D35]"
          >
            Find a home
          </Link>

          <Link
            href="/owner-dashboard"
            className="text-sm md:text-[16px] text-[#756A5C] transition-colors hover:text-[#174D35]"
          >
            For owners
          </Link>

          <Link
            href="/messages"
            className="text-sm md:text-[16px] text-[#756A5C] transition-colors hover:text-[#174D35]"
          >
            Messages
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/login"
            className="hidden items-center gap-2 text-sm md:text-[16px] text-[#1C1B18] sm:flex"
          >
            <UserRound size={18} strokeWidth={1.8} />
            Sign in
          </Link>

          <Link
            href="/owner/add-rental"
            className="rounded-full bg-[#174D35] px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-[15px] font-medium !text-[#F8F4EA] transition-all hover:bg-[#2D6047]"
          >
            List a home
          </Link>
        </div>

      </nav>
    </header>
  );
}