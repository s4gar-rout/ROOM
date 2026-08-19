import Navbar from "@/components/layout/Navbar";
import Hero from "@/features/home/components/Hero";
import LocationSearch from "@/features/home/components/LocationSearch";
import FeaturedRentals from "@/features/home/components/FeaturedRentals";
import LocalDiscovery from "@/features/home/components/LocalDiscovery";
import HowRoomWorks from "@/features/home/components/HowRoomWorks";
import OwnerCTA from "@/features/home/components/OwnerCTA";
import EditorialBrandStatement from "@/features/home/components/EditorialBrandStatement";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pb-24 md:pb-0">
        <Hero />
        <LocationSearch />
        <FeaturedRentals />
        <LocalDiscovery />
        <HowRoomWorks />
        <OwnerCTA />
        <EditorialBrandStatement />
      </main>

      <Footer />
    </>
  );
}