import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report an Issue",
  description: "Encountered a problem on Livansa? Report a technical issue or content concern and our team will look into it.",
  alternates: { canonical: "https://livansa.in/report-issue" },
};

export default function ReportIssueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
