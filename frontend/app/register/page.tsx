import RegisterPage from "@/features/auth/pages/RegisterPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account",
  description: "Join Livansa to find and list long-term rental rooms. Create your free account today.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RegisterPage />;
}