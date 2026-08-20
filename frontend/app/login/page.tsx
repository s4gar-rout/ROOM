import LoginPage from "@/features/auth/pages/LoginPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Livansa account to browse rooms, message owners, and manage your rentals.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LoginPage />;
}