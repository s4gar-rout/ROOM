import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import InitialLoader from "@/components/ui/InitialLoader";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "ROOM — Find a place that feels like home",
  description: "Find and list long-term rental homes with ROOM.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SmoothScrollProvider>
          <InitialLoader />
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}