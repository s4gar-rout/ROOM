import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  description: "Manage your rental listings on Livansa.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

