import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/hooks/useAuth";

export const metadata: Metadata = {
  title: "ROOM — Find a place that feels like home",
  description: "Find and list long-term rental homes with ROOM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}