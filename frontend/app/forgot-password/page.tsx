import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Your Password",
  description: "Recover access to your Livansa account with a simple three-step password reset.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForgotPasswordPage />;
}