import { Suspense } from "react";
import AllRoomsPage from "@/features/rental/pages/AllRoomsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rooms for Rent",
  description:
    "Browse verified rooms and monthly rentals near you. Filter by location, budget, and type to find a space that feels like home.",
  alternates: {
    canonical: "https://livansa.in/rentals",
  },
  openGraph: {
    title: "Rooms for Rent | Livansa",
    description:
      "Browse verified rooms and monthly rentals near you. Filter by location, budget, and type to find a space that feels like home.",
    url: "https://livansa.in/rentals",
  },
};

export default function RoomsRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F4EA] flex items-center justify-center">Loading...</div>}>
      <AllRoomsPage />
    </Suspense>
  );
}
