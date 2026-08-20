import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Profile",
  description: "Finish setting up your Livansa account to start browsing rooms.",
  robots: { index: false, follow: false },
};

export default function CompleteProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

