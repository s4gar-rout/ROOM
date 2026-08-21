import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const exploreLinks = [
  { label: "Find a home", href: "/rentals" },
  { label: "About us", href: "/about-us" },
  { label: "Messages", href: "/messages" },
];

const ownerLinks = [
  { label: "List a home", href: "/owner-dashboard/add-room" },
  { label: "Owner dashboard", href: "/owner-dashboard" },
  { label: "My listings", href: "/owner-dashboard/rooms" },
];

export default function Footer() {
  return (
    <footer className="bg-[#F8F4EA] pt-4 sm:pt-6">
      <div className="rounded-t-[2.5rem] sm:rounded-t-[3rem] bg-[#174D35] text-[#F8F4EA]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">

          {/* Heading */}
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] md:text-[9px] font-medium uppercase tracking-[0.3em] text-[#C8D5CA]">
              livansa / FIND YOUR SPACE
            </p>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl leading-[1.1] tracking-[-0.03em]">
              Find a place that{" "}
              <em className="text-[#D8E6D8]">feels right.</em>
            </h2>
          </div>

          {/* Links */}
          <div className="mt-8 grid gap-6 border-t border-[#F8F4EA]/15 pt-6 sm:grid-cols-2 md:grid-cols-4">

            {/* Brand */}
            <div>
              <Link
                href="/"
                className="font-serif text-2xl md:text-3xl italic"
              >
              livansa
              </Link>

              <p className="mt-2 max-w-xs text-xs leading-4 sm:text-xs text-[#C8D5CA]">
                Long-term rentals for real life.
              </p>
            </div>

            {/* Explore */}
            <div>
              <p className="mb-3 text-[11px] md:text-[9px] uppercase tracking-[0.3em] text-[#C8D5CA]">
                Explore
              </p>

              <div className="flex flex-col gap-1.5">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="w-fit text-[13px] md:text-xs text-[#F8F4EA]/70 transition hover:text-[#F8F4EA]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Owners */}
            <div>
              <p className="mb-3 text-[11px] md:text-[9px] uppercase tracking-[0.3em] text-[#C8D5CA]">
                For owners
              </p>

              <div className="flex flex-col gap-1.5">
                {ownerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="w-fit text-[13px] md:text-xs text-[#F8F4EA]/70 transition hover:text-[#F8F4EA]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-3 text-[11px] md:text-[9px] uppercase tracking-[0.3em] text-[#C8D5CA]">
                Contact
              </p>

              <div className="flex flex-col gap-1.5 text-[13px] md:text-xs text-[#F8F4EA]/70">
                <a
                  href="mailto:hello@room.local"
                  className="hover:text-[#F8F4EA]"
                >
                  hello@room.local
                </a>

                <span>Jharsuguda • Odisha</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-6 flex flex-col gap-3 border-t border-[#F8F4EA]/15 pt-4 text-xs md:text-[10px] text-[#C8D5CA] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} livansa. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <Link href="/report-issue" className="hover:text-[#F8F4EA]">
                Report an Issue
              </Link>

              <Link href="/feedback" className="hover:text-[#F8F4EA]">
                Feedback
              </Link>

              <Link href="/privacy-policy" className="hover:text-[#F8F4EA]">
                Privacy Policy
              </Link>

              <Link href="/terms-and-conditions" className="hover:text-[#F8F4EA]">
                Terms &amp; Conditions
              </Link>

              <Link
                href="/rentals"
                className="group flex items-center gap-1 text-[#F8F4EA]"
              >
                Explore
                <ArrowUpRight
                  size={12}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
