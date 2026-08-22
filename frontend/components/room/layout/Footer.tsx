import Link from "next/link";
import { ArrowUpRight, Mail, Globe } from "lucide-react";
import { siteConfig } from "@/config/site";

function InstagramIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const exploreLinks = [
  { label: "Find a home", href: "/rentals" },
  { label: "Saved rentals", href: "/saved" },
  { label: "Messages", href: "/messages" },
];

const ownerLinks = [
  { label: "List a home", href: "/owner/add-rental" },
  { label: "Owner dashboard", href: "/owner-dashboard" },
  { label: "My listings", href: "/owner/listings" },
];

export default function Footer() {
  return (
    <footer className="bg-[#F8F4EA] pt-4 sm:pt-6">
      <div className="rounded-t-[2.5rem] sm:rounded-t-[3rem] bg-[#174D35] text-[#F8F4EA]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">

          {/* Heading */}
          <div className="max-w-2xl">
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.3em] text-[#C8D5CA]">
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

              <p className="mt-2 max-w-xs text-[11px] leading-4 sm:text-xs text-[#C8D5CA]">
                Long-term rentals for real life.
              </p>
            </div>

            {/* Explore */}
            <div>
              <p className="mb-3 text-[9px] uppercase tracking-[0.3em] text-[#C8D5CA]">
                Explore
              </p>

              <div className="flex flex-col gap-1.5">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="w-fit text-xs text-[#F8F4EA]/70 transition hover:text-[#F8F4EA]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Owners */}
            <div>
              <p className="mb-3 text-[9px] uppercase tracking-[0.3em] text-[#C8D5CA]">
                For owners
              </p>

              <div className="flex flex-col gap-1.5">
                {ownerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="w-fit text-xs text-[#F8F4EA]/70 transition hover:text-[#F8F4EA]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-3 text-[9px] uppercase tracking-[0.3em] text-[#C8D5CA]">
                Contact
              </p>

              <div className="flex flex-col gap-2 text-xs text-[#F8F4EA]/70">
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="inline-flex items-center gap-1.5 transition hover:text-[#F8F4EA]"
                >
                  <Mail size={13} className="shrink-0 text-[#C8D5CA]" />
                  <span>{siteConfig.supportEmail}</span>
                </a>

                <a
                  href={siteConfig.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition hover:text-[#F8F4EA]"
                >
                  <InstagramIcon size={13} className="shrink-0 text-[#C8D5CA]" />
                  <span>{siteConfig.instagram.handle}</span>
                </a>

                <a
                  href={siteConfig.url}
                  className="inline-flex items-center gap-1.5 transition hover:text-[#F8F4EA]"
                >
                  <Globe size={13} className="shrink-0 text-[#C8D5CA]" />
                  <span>{siteConfig.displayUrl}</span>
                </a>

                <span className="text-[11px] text-[#C8D5CA]/80 pt-0.5">
                  {siteConfig.location}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-6 flex flex-col gap-3 border-t border-[#F8F4EA]/15 pt-4 text-[10px] text-[#C8D5CA] sm:flex-row sm:items-center sm:justify-between">
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