import Navbar from "@/components/layout/Navbar";
import Hero from "@/features/home/components/Hero";
import LocationSearch from "@/features/home/components/LocationSearch";
import FeaturedRentals from "@/features/home/components/FeaturedRentals";
import LocalDiscovery from "@/features/home/components/LocalDiscovery";
import WhyChooseLivansa from "@/features/home/components/WhyChooseLivansa";
import HowRoomWorks from "@/features/home/components/HowRoomWorks";
import OwnerCTA from "@/features/home/components/OwnerCTA";
import EditorialBrandStatement from "@/features/home/components/EditorialBrandStatement";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livansa — Find a Place to Belong",
  description:
    "Find rooms and monthly rentals with Livansa. Discover spaces that feel like home and connect with local property owners directly.",
  alternates: {
    canonical: "https://livansa.in",
  },
  openGraph: {
    title: "Livansa — Find a Place to Belong",
    description:
      "Find rooms and monthly rentals with Livansa. Discover spaces that feel like home and connect with local property owners directly.",
    url: "https://livansa.in",
  },
};


export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pb-24 md:pb-0">
        <Hero />
        <LocationSearch />
        <FeaturedRentals />
        <LocalDiscovery />
        <WhyChooseLivansa />
        <HowRoomWorks />
        <OwnerCTA />
        <EditorialBrandStatement />
      </main>

      <Footer />
    </>
  );
}