import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback & Suggestions",
  description: "Share your thoughts, suggestions, and feedback to help us improve Livansa. We read every submission.",
  alternates: { canonical: "https://livansa.in/feedback" },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
