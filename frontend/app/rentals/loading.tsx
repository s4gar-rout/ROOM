import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RentalCardSkeleton from "@/features/rental/components/RentalCardSkeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F4EA]">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded bg-[#E8E3D9] mb-3" />
            <div className="h-4 w-64 animate-pulse rounded bg-[#E8E3D9]" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RentalCardSkeleton key={i} />
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
