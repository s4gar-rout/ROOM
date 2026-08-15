import Navbar from "@/components/layout/Navbar";
import Hero from "@/features/home/components/Hero";
import LocationSearch from "@/features/home/components/LocationSearch";
import FeaturedRentals from "@/features/home/components/FeaturedRentals";
import HowRoomWorks from "@/features/home/components/HowRoomWorks";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <LocationSearch />
        <FeaturedRentals />
        <HowRoomWorks />
      </main>

      <Footer />
    </>
  );
}